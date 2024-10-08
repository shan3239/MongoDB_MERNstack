// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/houserent', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Define the property schema
const propertySchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    location: String
});

// Create the user model
const User = mongoose.model('User ', userSchema);

// Create the property model
const Property = mongoose.model('Property', propertySchema);

// Create the Express app
const app = express();

// Define middleware for JSON parsing
app.use(express.json());

// Define middleware for authentication
const authenticate = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};

// Define routes
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.send('User  registered successfully!');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).send('Invalid email or password');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.send({ token });
});

app.get('/properties', authenticate, async (req, res) => {
    const properties = await Property.find();
    res.send(properties);
});

app.post('/properties', authenticate, async (req, res) => {
    const { title, description, price, location } = req.body;
    const property = new Property({ title, description, price, location });
    await property.save();
    res.send('Property added successfully!');
});

app.get('/properties/:id', authenticate, async (req, res) => {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).send('Property not found');
    }
    res.send(property);
});

app.put('/properties/:id', authenticate, async (req, res) => {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).send('Property not found');
    }
    const { title, description, price, location } = req.body;
    property.title = title;
    property.description = description;
    property.price = price;
    property.location = location;
    await property.save();
    res.send('Property updated successfully!');
});

app.delete('/properties/:id', authenticate, async (req, res) => {
    const propertyId = req.params.id;
    const property = await Property.findByIdAndRemove(propertyId);
    if (!property) {
        return res.status(404).send('Property not found');
    }
    res.send('Property deleted successfully!');
});

app.post('/bookings', authenticate, async (req, res) => {
    const { propertyId, startDate, endDate } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).send('Property not found');
    }
    const booking = {
        propertyId,
        startDate,
        endDate,
        userId: req.user._id
    };
    // Save booking to database
    // ...
    res.send('Booking created successfully!');
});

app.get('/bookings', authenticate, async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id });
    res.send(bookings);
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});