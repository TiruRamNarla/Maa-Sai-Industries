require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tiruramchowdary_db_user:ram2004@cluster0.8foz0if.mongodb.net/myDatabase?appName=Cluster0";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    await Admin.deleteMany({ username: 'gopi_achanti' });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await Admin.create({
      username: 'gopi_achanti',
      password: hashedPassword
    });

    console.log("SUCCESS: Admin user created in Database!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err.message);
    process.exit(1);
  }
}

seedAdmin();