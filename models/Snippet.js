require('dotenv').config()

const mongoose = require('mongoose');
const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
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
    const decipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
const SnippetSchema = new mongoose.Schema({
    _id: { type: Number }, // Explicitly allow _id to be a Number
    language: { type: String, required: true },
    code: { type: String, required: true },
});

SnippetSchema.pre('save', function (next) {
    if (this.isModified('code')) {
        this.code = encrypt(this.code);
    }
    next();
})

SnippetSchema.set('toJSON' , {
    transform: (doc, ret) => {
        ret.code = decrypt(ret.code);
        delete ret.__v;
        return ret;
    },
});


module.exports = mongoose.model('Snippet', SnippetSchema);