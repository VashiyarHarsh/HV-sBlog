const express = require('express');
const router = express.Router();

router.get('/signin', (req, res) => {
    res.render('signin', { user: req.user || null });
});

router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

const User = require('../models/user');

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', {
                error: 'An account already exists with the provided email.'
            });
        }
        await User.create({
            fullName,
            email,
            password,
        });
        return res.redirect('/');
    } 
    catch (error) {
        return res.render('signup', {
            error: 'An error occurred during signup. Please try again.'
        });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie('token', token).redirect('/');
    } 
    catch(error) {
        return res.render('signin', {
            error: 'Incorrect password or email'
        });
    }
});

module.exports = router;
