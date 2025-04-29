const mongoose = require('mongoose');
const crypto = require('crypto');

const SnippetSchema = new mongoose.Schema({
    _id: { type: Number }, // Explicitly allow _id to be a Number
    language: { type: String, required: true },
    code: { type: String, required: true },
});

SnippetSchema.set('toJSON' , {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('Snippet', SnippetSchema);