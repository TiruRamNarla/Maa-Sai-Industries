const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML, CSS, images, and JS files from your project root
app.use(express.static(__dirname));

// MongoDB Connection URI
const uri = "mongodb+srv://tiruramchowdary_db_user:ram2004@cluster0.8foz0if.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function startServer() {
  try {
    // 1. Connect to MongoDB Atlas
    await client.connect();
    console.log(" Connected to MongoDB Atlas!");

    const db = client.db('myDatabase');
    const collection = db.collection('users');

    // 2. Default route: Serve index.html when visiting http://localhost:3000/
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    // API route to get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await collection.find({}).toArray();
        res.json(users);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // API route to create a user
    app.post('/users', async (req, res) => {
      try {
        const { name, email, role } = req.body;
        const newUser = {
          name,
          email,
          role: role || "User",
          createdAt: new Date()
        };
        const result = await collection.insertOne(newUser);
        res.status(201).json({ message: "User created", id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // 3. Start listening on Port 3000
    app.listen(port, () => {
      console.log(` Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
}

startServer();