const express = require('express');
const connectDB = require('./db');
const Snippet = require('./models/Snippet');

const app = express()
const port = 3000

connectDB();
app.use(express.json());

// add snippet
app.post('/snippets', async (req, res) => {
    try {
        const { language, code } = req.body;
        const snippet = new Snippet({ language, code });
        await snippet.save();
        res.status(201).json(snippet);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

app.get('/snippets', async (req, res) => {
    try {
        const snippets = await Snippet.find();
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/', (req, res) => {
  res.send('Snipper Project!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})