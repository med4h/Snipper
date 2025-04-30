require('dotenv').config();

const mongoose = require('mongoose');
const crypto = require('crypto');

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
    _id: { type: Number },
    language: { type: String, required: true },
    code: { type: String, required: true },
});

SnippetSchema.pre('save', function (next) {
    if (this.isModified('code')) {
        console.log('Original Code:', this.code);
        this.code = encrypt(this.code);
        console.log('Encrypted Code:', this.code);
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