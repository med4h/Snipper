const mongoose = require('mongoose');
const bycrypt = require('bycrypt');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bycrypt.genSalt(SALT_ROUNDS);
        this.password = await bycrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bycrypt.compare(candidatePassword, this.password);
}
module.exports = mongoose.model('User', UserSchema);