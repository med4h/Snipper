require('dotenv').config();

const mongoose = require('mongoose');
const crypto = require('crypto');
const Counter = require('./Counter');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedText) => {
    const [iv, encrypted] = encryptedText.split(':');
    if (!iv || !encrypted) {
        throw new Error('Invalid encrypted text format');
    }
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

const SnippetSchema = new mongoose.Schema({
    language: { type: String, required: true },
    code: { type: String, required: true },
});

SnippetSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Get the next value from the counter
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'snippetId' }, // Counter name
            { $inc: { seq: 1 } }, // Increment the counter
            { new: true, upsert: true } // Create the counter if it doesn't exist
        );
        this._id = counter.seq; // Assign the incremented value to _id
    }
    if (this.isModified('code')) {
        this.code = encrypt(this.code);
    }
    next();
});

SnippetSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.code = decrypt(ret.code);
        delete ret.__v;
        return ret;
    },
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

module.exports = { Snippet, encrypt };