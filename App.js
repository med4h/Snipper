const express = require('express');
const connectDB = require('./db');
const Snippet = require('./models/Snippet');

const app = express()
const port = 3000

connectDB();
app.use(express.json());

// add/create new snippet
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

// get all snippets currently in data store
app.get('/snippets', async (req, res) => {
    try {
        const snippets = await Snippet.find();
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get snippet by id
app.get('/snippets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const snippet = await Snippet.findById(id);
     if (!snippet) {
        return res. status(404).json({ error: 'Snippet not found'});
     }
     res.json(snippet);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

//get snippets by language 
app.get('/snippets', async (req, res) => {
    try {
        const { lang } = req.query;
        const filter = lang ? { language : lang } :{};
        const snippets = await Snippet.find(filter);
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})



app.get('/', (req, res) => {
  res.send('Snipper Project!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})