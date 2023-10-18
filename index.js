// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

const SALE = require('./models/SALE'); 
const USER = require('./models/USER');


const verifyToken = require('./middlewere/verifyToken'); 

const app = express();
dotenv.config();

// Connect to the MongoDB database 
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// Enable JSON request and response handling & Cross-Origin Resource Sharing
app.use(express.json()); 
app.use(cors()); 

// Handle user registration
app.post('/api/signup', async (req, res) => {
  try {
    // Create a new user document from the request body
    const newUser = new USER(req.body);
    // Save the new user to the database
    await newUser.save();
    // Respond with the user document (excluding the password)
    res.status(200).send({ ...newUser._doc });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Handle user login
app.post('/api/signin', async (req, res) => {
  try {
    // Find a user by their email in the database
    const user = await USER.findOne({ email: req.body.email });

    if (!user)
      return res.status(400).json("User not found");

    // Check if the provided password matches the user's password
    const isCorrect = req.body.password === user.password;

    if (isCorrect) {
      // If the password is correct, generate a JWT token and respond with user data and the token
      const { password, ...others } = user._doc;
      const token = JWT.sign({ id: user._id }, process.env.JWT);
      res.send({ ...others, token });
    } else {
      // If the password is incorrect, respond with an error message
      res.status(400).send("Password not matched");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Create a new sale (requires a valid token for authorization)
app.post('/api/sales', verifyToken, async (req, res) => {
  // Attach the user's ID from the token to the sale data
  const data = req.body;
  data.userId = req.data.id;

  try {
    // Create a new sale document and save it to the database
    const sale = new SALE(data);
    await sale.save();
    res.status(200).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all sales (requires a valid token for authorization)
app.get('/api/sales', verifyToken, async (req, res) => {
  try {
    // Find and return all sales associated with the user's ID, sorted by creation date
    const sales = await SALE.find({ userId: req.data.id }).sort({ 'createdAt': -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific sale by ID (requires a valid token for authorization)
app.get('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    // Find a sale by its ID
    const sale = await SALE.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a sale by ID (requires a valid token for authorization)
app.put('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    // Find and update a sale by its ID, returning the updated sale
    const sale = await SALE.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a sale by ID (requires a valid token for authorization)
app.delete('/api/sales/:id', verifyToken, async (req, res) => {
  try {
    // Find and remove a sale by its ID
    const sale = await SALE.findByIdAndRemove(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    // Respond with a successful status code
    res.status(200).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set the server port using the PORT environment variable or default to 5000
const port = process.env.PORT || 5000;

// Start the Express server
app.listen(port, () => {
  console.log("Server started at port: " + port);
});
