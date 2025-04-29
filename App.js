const express = require('express');
const connectDB = require('./db');
const Snippet = require('./models/Snippet');

const app = express();
const port = 3000;

connectDB();
app.use(express.json());

// Add/create new snippet
app.post('/snippets', async (req, res) => {
    try {
        const { language, code } = req.body;
        const snippet = new Snippet({ language, code });
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