const mongoose = require('mongoose');
const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: '/images/default.jpg',
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    
    const salt = randomBytes(16).toString('hex'); 
    const hashedPassword = createHmac('sha256', salt)
                            .update(user.password)
                            .digest('hex');
    
    user.salt = salt;
    user.password = hashedPassword;
    next();
});

userSchema.static('matchPasswordAndGenerateToken', async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User Not Found');
    
    const userProvidedHash = createHmac('sha256', user.salt)
                            .update(password)
                            .digest('hex');
    if (user.password !== userProvidedHash) throw new Error('Incorrect Password');
    
    const token = createTokenForUser(user);
    return token;
});

const User = mongoose.model('user', userSchema);

module.exports = User;