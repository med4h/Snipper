const express = require('express');
const connectDB = require('./db');
const { Snippet } = require('./models/Snippet');
const User = require('./models/User')
const Counter = require('./modles/Counter');
const bcrypt = require('bcrypt');


const app = express();
const port = 3000;

const authenticateUser = async (email, password) => {
    const user = await User.findoNE ({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch) {
        throw new Error('Invalid email or Password')
    }
    return user;
}

connectDB();
app.use(express.json());

app.post('/user', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password }); 
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

app.get('/user', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);
        const { password: _, ...userData } = user.toObject();
        res.json(userData);
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
})

// Add/create new snippet
app.post('/snippets', async (req, res) => {
    try {
        const { language, code } = req.body;
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'snippetId' },
            { $inc: {seq: 1 }},
            { new: true, upsert: true }
        );
        const snippet = new Snippet({ _id: counter.seq, language, code });
        await snippet.save();
        res.status(201).json(snippet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all snippets or filter by language
app.get('/snippets', async (req, res) => {
    try {
        const { lang } = req.query; // Check for query parameter
        const filter = lang ? { language: lang } : {}; // Filter by language if provided
        const snippets = await Snippet.find(filter);
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get snippet by ID
app.get('/snippets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const snippet = await Snippet.findById(id); // Query by _id
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }
        res.json(snippet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Snipper Project!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});