const mongoose = require('mongoose');
const SnippetSchema = new mongoose.Schema({
    _id: { type: Number }, // Explicitly allow _id to be a Number
    language: { type: String, required: true },
    code: { type: String, required: true },
});

module.exports = mongoose.model('Snippet', SnippetSchema);