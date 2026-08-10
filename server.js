require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dns = require('dns');

// Configure DNS servers if needed for local network environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.log("Using default network DNS settings.");
}

// Models loaded from root directory
const Admin = require('./Admin');
const Lead = require('./Lead');
const Order = require('./Order');
const Inventory = require('./Inventory');
const Quotation = require('./Quotation');
const Customer = require('./Customer');
const Product = require('./Product');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tiruramchowdary_db_user:ram2004@cluster0.8foz0if.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas!");
    seedInitialInventory();
    seedInitialMasters();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// --- SEED DATA FUNCTIONS ---
async function seedInitialInventory() {
  try {
    const count = await Inventory.countDocuments();
    if (count === 0) {
      await Inventory.insertMany([
        { itemCategory: 'Steel Angles', itemName: 'ISA 65x65x6 (IS 2062)', stockQty: 45, unit: 'MT', minimumStock: 10, supplier: 'SAIL' },
        { itemCategory: 'Channels', itemName: 'ISMC 100 Channels', stockQty: 28, unit: 'MT', minimumStock: 8, supplier: 'RINL' },
        { itemCategory: 'Flats', itemName: 'MS Flat 50x6 mm', stockQty: 15, unit: 'MT', minimumStock: 5, supplier: 'Local Vendor' },
        { itemCategory: 'Zinc', itemName: 'Pure Zinc Slabs (99.99%)', stockQty: 4, unit: 'MT', minimumStock: 5, supplier: 'Hindustan Zinc' }
      ]);
      console.log("✅ Multi-category inventory seeded!");
    }
  } catch (err) {
    console.error("Inventory Seed Error:", err.message);
  }
}

async function seedInitialMasters() {
  try {
    const custCount = await Customer.countDocuments();
    if (custCount === 0) {
      await Customer.create({
        customerId: 'CUST-1001',
        companyName: 'L&T Power Transmission',
        contactPerson: 'Rajesh Sharma',
        phone: '9876543210',
        email: 'rsharma@intecc.com',
        gstin: '36AAACL1234H1ZP',
        billingAddress: 'Plot 45, HITEC City, Hyderabad, TS',
        outstandingBalance: 450000
      });
      console.log("✅ Customer Master seeded!");
    }

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany([
        { productCode: 'TWR-33KV', productName: 'M Type 33KV Electrical Tower', category: 'Transmission Towers', standardRatePerUnit: 78000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062 E250' },
        { productCode: 'CBL-TRAY', productName: 'Ladder Type Cable Tray Galvanizing', category: 'Structural Fabrication', standardRatePerUnit: 42000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062' },
        { productCode: 'BARRIER-3X5', productName: 'Highway Crash Barrier Galvanizing', category: 'Structural Fabrication', standardRatePerUnit: 32000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062 E250' },
        { productCode: 'GRATING-MS', productName: 'Metal Gratings Hot Dip Galvanizing', category: 'Structural Fabrication', standardRatePerUnit: 29000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062' },
        { productCode: 'STEEL-STRUCT', productName: 'General Steel Structure Galvanizing', category: 'Structural Fabrication', standardRatePerUnit: 28000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062 E250' },
        { productCode: 'TWR-TLINE', productName: 'Transmission Line Tower Galvanizing', category: 'Transmission Towers', standardRatePerUnit: 20300, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062 E250' },
        { productCode: 'EARTH-STRIP', productName: 'GI Earthing Strip Galvanizing', category: 'GI Earthing Strip', standardRatePerUnit: 19000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062' },
        { productCode: 'SOLAR-STRUCT', productName: 'Solar Structure Hot Dip Galvanizing', category: 'Solar Structures', standardRatePerUnit: 17000, hsnCode: '7308', unit: 'MT', steelGrade: 'IS 2062 E250' }
      ]);
      console.log("✅ IndiaMART Product Master seeded!");
    }
  } catch (err) {
    console.error("Master Seeding Error:", err.message);
  }
}

// Fallback Order Data
const fallbackOrders = [
  {
    orderId: "ORD-1002",
    customerName: "L&T Power Transmission",
    project: "400KV Substation Tower Project",
    item: "33KV Substation Tower Structures",
    amount: 350000,
    totalWeightMT: 18.5,
    drawingNumber: "DWG-LNT-400KV/R2",
    currentStage: "Galvanizing",
    expectedDispatch: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    stages: [
      { stageName: 'Order', status: 'Completed' },
      { stageName: 'Planning', status: 'Completed' },
      { stageName: 'Raw Material', status: 'Completed' },
      { stageName: 'Fabrication', status: 'Completed' },
      { stageName: 'Punching', status: 'Completed' },
      { stageName: 'Drilling', status: 'Completed' },
      { stageName: 'Galvanizing', status: 'In Progress' },
      { stageName: 'Inspection', status: 'Pending' },
      { stageName: 'Packing', status: 'Pending' },
      { stageName: 'Dispatch', status: 'Pending' },
      { stageName: 'Delivered', status: 'Pending' }
    ],
    historyTimeline: [
      { stageName: "Order Created", remarks: "Order registered in ERP", timestamp: new Date() },
      { stageName: "Galvanizing Started", remarks: "Moved to Hot-Dip Zinc Bath Tank 2", timestamp: new Date() }
    ]
  }
];

// --- HTML PAGE ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/track', (req, res) => res.sendFile(path.join(__dirname, 'track.html')));
app.get('/client-portal.html', (req, res) => res.sendFile(path.join(__dirname, 'client-portal.html')));
app.get('/admin-dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'admin-dashboard.html')));

// --- AUTHENTICATION APIS ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if ((username || '').trim() === 'gopi_achanti' && (password || '').trim() === 'admin123') {
    res.cookie('adminSession', 'authenticated_gopi_achanti', { httpOnly: true, maxAge: 86400000 });
    return res.json({ success: true, user: { username: 'gopi_achanti' } });
  }
  return res.status(401).json({ success: false, message: "Invalid Credentials." });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('adminSession');
  res.json({ success: true });
});

// --- CUSTOMER MASTER APIS ---
app.get('/api/customers', async (req, res) => {
  try {
    const search = req.query.search || '';
    let query = {};
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } }
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
    const count = await Customer.countDocuments();
    const customerId = `CUST-${1001 + count}`;
    const customer = await Customer.create({ customerId, ...req.body });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer record deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- PRODUCT MASTER APIS ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ category: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- QUOTATION APIS ---
app.get('/api/quotations', async (req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const { customerName, customerPhone, items, totalAmount, taxAmount, grandTotal } = req.body;
    const count = await Quotation.countDocuments();
    const quotationNumber = `MSM-QT-${10001 + count}`;

    const newQuotation = await Quotation.create({
      quotationNumber,
      customerName,
      customerPhone,
      items,
      totalAmount,
      taxAmount,
      grandTotal,
      status: 'Issued'
    });

    res.status(201).json({ success: true, quotation: newQuotation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/quotations/:id/status', async (req, res) => {
  try {
    const quote = await Quotation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTION ORDERS APIS ---
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const rawOrderId = req.params.orderId;
    if (!rawOrderId) return res.status(400).json({ success: false, message: 'Order ID required.' });
    
    const sanitized = rawOrderId.trim().toUpperCase();

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ orderId: { $regex: new RegExp(`^${sanitized}$`, 'i') } });
      if (order) {
        return res.json({
          success: true,
          orderId: order.orderId,
          customerName: order.customerName || order.customer,
          project: order.project,
          item: order.item,
          amount: order.amount,
          totalWeightMT: order.totalWeightMT,
          drawingNumber: order.drawingNumber,
          currentStage: order.currentStage,
          expectedDispatch: order.expectedDispatch,
          stages: order.stages,
          historyTimeline: order.historyTimeline
        });
      }
    }

    const fallback = fallbackOrders.find(f => f.orderId.toUpperCase() === sanitized);
    if (fallback) return res.json({ success: true, ...fallback });

    return res.status(404).json({ success: false, message: 'Order reference not found.' });
  } catch (err) {
    const sanitized = (req.params.orderId || '').trim().toUpperCase();
    const fallback = fallbackOrders.find(f => f.orderId.toUpperCase() === sanitized);
    if (fallback) return res.json({ success: true, ...fallback });
    res.status(500).json({ success: false, message: "Database lookup failed." });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(fallbackOrders);
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.json(fallbackOrders);
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, project, item, amount, totalWeightMT, drawingNumber, expectedDispatch } = req.body;
    const ALL_STAGES = ['Order', 'Planning', 'Raw Material', 'Fabrication', 'Punching', 'Drilling', 'Galvanizing', 'Inspection', 'Packing', 'Dispatch', 'Delivered'];
    
    const initialStages = ALL_STAGES.map(stageName => ({
      stageName,
      status: stageName === 'Order' ? 'Completed' : 'Pending',
      remarks: stageName === 'Order' ? 'Order registered' : ''
    }));

    const newOrder = await Order.create({
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Valued Industrial Client',
      project: project || '33KV Substation Structure',
      item,
      amount: Number(amount) || 0,
      totalWeightMT: Number(totalWeightMT) || 0,
      drawingNumber: drawingNumber || 'DWG-001',
      expectedDispatch: expectedDispatch || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      currentStage: 'Planning',
      stages: initialStages,
      historyTimeline: [{ stageName: 'Order', status: 'Completed', remarks: 'Order registered in ERP', timestamp: new Date() }]
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/stage', async (req, res) => {
  try {
    const { currentStage, remarks } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.currentStage = currentStage;
    order.historyTimeline.push({ stageName: currentStage, status: 'In Progress', remarks: remarks || `Moved to ${currentStage}`, timestamp: new Date() });

    let reached = true;
    order.stages.forEach(st => {
      if (st.stageName === currentStage) {
        st.status = 'In Progress';
        if (remarks) st.remarks = remarks;
        st.updatedAt = new Date();
        reached = false;
      } else if (reached) {
        st.status = 'Completed';
      } else {
        st.status = 'Pending';
      }
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- INVENTORY & CRM LEADS APIS ---
app.get('/api/inventory', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const items = await Inventory.find({}).sort({ itemCategory: 1 });
    res.json(items);
  } catch (err) {
    res.json([]);
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, { stockQty: req.body.stockQty }, { new: true });
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const search = req.query.search || '';
    const status = req.query.status || 'All';
    let query = {};

    if (status !== 'All') query.status = status;
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
    res.json([]);
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTS & EXECUTIVE ANALYTICS APIS ---
app.get('/api/analytics', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ totalLeads: 0, totalOrders: 1, pendingLeads: 0, inGalvanizing: 1, inFabrication: 0, completedOrders: 0 });
    }
    const totalLeads = await Lead.countDocuments();
    const totalOrders = await Order.countDocuments();
    const inGalvanizing = await Order.countDocuments({ currentStage: 'Galvanizing' });
    const inFabrication = await Order.countDocuments({ currentStage: 'Fabrication' });
    const completedOrders = await Order.countDocuments({ currentStage: 'Delivered' });

    res.json({ totalLeads, totalOrders, inGalvanizing, inFabrication, completedOrders });
  } catch (err) {
    res.json({ totalLeads: 0, totalOrders: 0, inGalvanizing: 0, inFabrication: 0, completedOrders: 0 });
  }
});

app.get('/api/reports/daily-output', async (req, res) => {
  try {
    const orders = await Order.find({});
    const totalOrders = orders.length;
    let totalTonnageMT = 0;
    let inFabricationMT = 0;
    let inGalvanizingMT = 0;
    let completedMT = 0;

    orders.forEach(o => {
      const weight = o.totalWeightMT || 0;
      totalTonnageMT += weight;
      if (o.currentStage === 'Fabrication') inFabricationMT += weight;
      if (o.currentStage === 'Galvanizing') inGalvanizingMT += weight;
      if (o.currentStage === 'Delivered') completedMT += weight;
    });

    res.json({
      reportDate: new Date().toLocaleDateString('en-IN'),
      totalOrders,
      totalTonnageMT,
      inFabricationMT,
      inGalvanizingMT,
      completedMT,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/ledger', async (req, res) => {
  try {
    const customers = await Customer.find({});
    let totalOutstanding = 0;

    const ledger = customers.map(c => {
      const balance = c.outstandingBalance || 0;
      totalOutstanding += balance;
      return {
        customerId: c.customerId,
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        phone: c.phone,
        gstin: c.gstin || 'N/A',
        outstandingBalance: balance
      };
    });

    res.json({
      generatedAt: new Date().toLocaleDateString('en-IN'),
      totalClients: customers.length,
      totalOutstanding,
      ledger
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(PORT, () => console.log(`🚀 Maa Sai ERP Server active on http://localhost:${PORT}`));
