require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serves html, images, pdfs from public folder

// =================================────────────────=========
// MONGOOSE DATABASE SCHEMAS & MODELS
// =================================────────────────=========

// 1. CRM Lead Schema
const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    product: { type: String, required: true },
    message: { type: String, default: '' },
    source: { type: String, default: 'Website' },
    status: { type: String, default: 'New' },
    createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', LeadSchema);

// 2. Production Order Schema
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    customerName: { type: String, required: true },
    project: { type: String, default: 'General Infrastructure' },
    item: { type: String, required: true },
    totalWeightMT: { type: Number, default: 0 },
    amount: { type: String, default: '0' },
    currentStage: { type: String, default: 'Order' },
    stages: [{
        stageName: String,
        completed: Boolean,
        remarks: String,
        updatedAt: { type: Date, default: Date.now }
    }],
    expectedDispatch: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate Order ID before saving
OrderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `MSM-ORD-${1000 + count + 1}`;
    }
    next();
});
const Order = mongoose.model('Order', OrderSchema);

// 3. Customer Master Schema
const CustomerSchema = new mongoose.Schema({
    customerId: { type: String, unique: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    gstin: { type: String, default: 'N/A' },
    billingAddress: { type: String, required: true },
    outstandingBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

CustomerSchema.pre('save', async function (next) {
    if (!this.customerId) {
        const count = await mongoose.model('Customer').countDocuments();
        this.customerId = `CUST-${1000 + count + 1}`;
    }
    next();
});
const Customer = mongoose.model('Customer', CustomerSchema);

// 4. Product Master Schema
const ProductSchema = new mongoose.Schema({
    productCode: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    hsnCode: { type: String, default: '7308' },
    steelGrade: { type: String, default: 'IS 2062 E250' },
    standardRatePerUnit: { type: Number, required: true },
    unit: { type: String, default: 'MT' }
});
const Product = mongoose.model('Product', ProductSchema);

// 5. Quotation Schema
const QuotationSchema = new mongoose.Schema({
    quotationNumber: { type: String, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
        description: String,
        quantity: Number,
        ratePerUnit: Number,
        amount: Number
    }],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: { type: String, default: 'Issued' },
    createdAt: { type: Date, default: Date.now }
});

QuotationSchema.pre('save', async function (next) {
    if (!this.quotationNumber) {
        const count = await mongoose.model('Quotation').countDocuments();
        this.quotationNumber = `MSM-QT-${100 + count + 1}`;
    }
    next();
});
const Quotation = mongoose.model('Quotation', QuotationSchema);

// 6. Inventory Schema
const InventorySchema = new mongoose.Schema({
    itemCategory: { type: String, required: true },
    itemName: { type: String, required: true },
    stockQty: { type: Number, required: true },
    minimumStock: { type: Number, default: 5 },
    unit: { type: String, default: 'MT' },
    supplier: { type: String, default: 'Primary Steel Mill' }
});
const Inventory = mongoose.model('Inventory', InventorySchema);

// =================================────────────────=========
// ALTERNATIVE 1: WEB FORM ENQUIRY & WHATSAPP PUSH ALERT
// =================================────────────────=========
app.post('/api/leads', async (req, res) => {
    try {
        const { name, phone, email, product, message } = req.body;

        if (!name || !phone || !product) {
            return res.status(400).json({ success: false, message: 'Name, phone, and product are required.' });
        }

        // Save Lead to MongoDB
        const newLead = new Lead({ name, phone, email, product, message, source: 'Website' });
        await newLead.save();

        // Asynchronous Notification Alert
        const promoterPhone = '918143891289';
        const alertText = encodeURIComponent(`*NEW ERP LEAD RECEIVED!*\n\nClient: ${name}\nPhone: ${phone}\nProduct: ${product}\nSpecs: ${message}`);
        
        axios.get(`https://api.callmebot.com/whatsapp.php?phone=${promoterPhone}&text=${alertText}&apikey=MAASAI_KEY`)
            .catch(() => console.log('WhatsApp notification link generated.'));

        res.status(201).json({ success: true, message: 'Enquiry saved successfully and synced to Admin Portal!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/leads', async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { product: { $regex: search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query).sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/leads/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =================================────────────────=========
// ERP API ENDPOINTS: ORDERS, CUSTOMERS, PRODUCTS, QUOTES
// =================================────────────────=========

// Analytics Summary
app.get('/api/analytics', async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const totalOrders = await Order.countDocuments();
        const inFabrication = await Order.countDocuments({ currentStage: 'Fabrication' });
        const inGalvanizingDocs = await Order.find({ currentStage: 'Galvanizing' });
        const completedOrders = await Order.countDocuments({ currentStage: { $in: ['Dispatch', 'Delivered'] } });

        const inGalvanizingMT = inGalvanizingDocs.reduce((acc, curr) => acc + (curr.totalWeightMT || 0), 0);

        res.json({
            totalLeads,
            totalOrders,
            inFabrication,
            inGalvanizing: inGalvanizingMT,
            completedOrders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Production Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/orders/:id/stage', async (req, res) => {
    try {
        const { currentStage, remarks } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.currentStage = currentStage;
        order.stages.push({ stageName: currentStage, completed: true, remarks: remarks || '' });

        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Master
app.get('/api/customers', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Product Catalogue
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Quotations Pipeline
app.get('/api/quotations', async (req, res) => {
    try {
        const quotes = await Quotation.find().sort({ createdAt: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        const quote = new Quotation(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/quotations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Quotation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stock Inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/inventory/:id', async (req, res) => {
    try {
        const { stockQty } = req.body;
        const updated = await Inventory.findByIdAndUpdate(req.params.id, { stockQty: Number(stockQty) }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports Endpoints
app.get('/api/reports/daily-output', async (req, res) => {
    try {
        const orders = await Order.find();
        const totalTonnageMT = orders.reduce((acc, curr) => acc + (curr.totalWeightMT || 0), 0);

        res.json({
            reportDate: new Date().toLocaleDateString('en-IN'),
            totalOrders: orders.length,
            totalTonnageMT,
            orders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/ledger', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json({ ledger: customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Authentication Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === (process.env.ADMIN_USER || 'admin') && password === (process.env.ADMIN_PASS || 'maasai2026')) {
        return res.json({ success: true, user: 'Achanta Gopi (CEO)' });
    }
    res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
});

app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// =================================────────────────=========
// ALTERNATIVE 2: FREE INDIAMART EMAIL PARSER ENGINE
// =================================────────────────=========
const imapConfig = {
    imap: {
        user: process.env.GMAIL_USER || 'maasai.metals@gmail.com',
        password: process.env.GMAIL_APP_PASSWORD || '', // Set 16-digit App Password here or in Render Env
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 30000
    }
};

async function parseIndiaMARTEmails() {
    if (!imapConfig.imap.password) return; // Skip if app password is not set

    try {
        const connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN', ['FROM', 'indiamart.com']];
        const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], struct: true };

        const messages = await connection.search(searchCriteria, fetchOptions);

        for (let item of messages) {
            const all = item.parts.find(part => part.which === '');
            const parsed = await simpleParser(all.body);
            const emailText = parsed.text || '';

            const nameMatch = emailText.match(/Sender Name:\s*(.*)/i);
            const phoneMatch = emailText.match(/Mobile:\s*(.*)/i);
            const productMatch = emailText.match(/Product Name:\s*(.*)/i);

            if (phoneMatch) {
                const leadData = {
                    name: nameMatch ? nameMatch[1].trim() : 'IndiaMART Buyer',
                    phone: phoneMatch[1].trim(),
                    email: parsed.from?.value?.[0]?.address || 'indiamart@buyer.com',
                    product: productMatch ? productMatch[1].trim() : 'IndiaMART Enquiry',
                    message: parsed.subject || 'Inquiry received via IndiaMART',
                    source: 'IndiaMART Email'
                };

                await Lead.updateOne(
                    { phone: leadData.phone },
                    { $setOnInsert: leadData },
                    { upsert: true }
                );

                console.log(`Synced IndiaMART Lead: ${leadData.name} (${leadData.phone})`);
            }
        }
        connection.end();
    } catch (err) {
        // Silent catch for IMAP polling
    }
}

// Poll Gmail inbox every 15 minutes
setInterval(parseIndiaMARTEmails, 15 * 60 * 1000);

// =================================────────────────=========
// MONGOOSE CONNECT & SERVER START
// =================================────────────────=========
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:maasai2026@cluster0.mongodb.net/maasai_erp?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to Maa Sai MongoDB Atlas Cluster');
        // Initial check for seed data
        seedDefaultProducts();
        seedDefaultInventory();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Seed default products if database is empty
async function seedDefaultProducts() {
    const count = await Product.countDocuments();
    if (count === 0) {
        await Product.insertMany([
            { productCode: 'TWR-220KV', productName: '220kV Transmission Line Tower', category: 'Transmission Towers', standardRatePerUnit: 78000 },
            { productCode: 'TWR-33KV', productName: '33kV M Type Tower', category: 'Transmission Towers', standardRatePerUnit: 72000 },
            { productCode: 'SUB-GANTRY', productName: '220kV Substation Structure Gantry', category: 'Substation Structures', standardRatePerUnit: 82000 },
            { productCode: 'GI-FLAT-50x6', productName: 'GI Earthing Flat 50x6mm', category: 'GI Earthing Strip', standardRatePerUnit: 68000 }
        ]);
    }
}

async function seedDefaultInventory() {
    const count = await Inventory.countDocuments();
    if (count === 0) {
        await Inventory.insertMany([
            { itemCategory: 'Raw Steel', itemName: 'ISA 65x65x6 Angles', stockQty: 45, minimumStock: 10, unit: 'MT' },
            { itemCategory: 'Raw Steel', itemName: 'ISA 75x75x6 Angles', stockQty: 32, minimumStock: 8, unit: 'MT' },
            { itemCategory: 'Galvanizing Bath', itemName: 'Zinc Slabs 99.99% Pure', stockQty: 12, minimumStock: 3, unit: 'MT' },
            { itemCategory: 'Chemicals', itemName: 'Hydrochloric Acid (HCL)', stockQty: 2500, minimumStock: 500, unit: 'Liters' }
        ]);
    }
}

// Fallback HTML page routing
app.get('/track', (req, res) => res.sendFile(path.join(__dirname, 'public', 'track.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin-dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

app.listen(PORT, () => {
    console.log(`MAA SAI METAL ERP Server active on port ${PORT}`);
});
