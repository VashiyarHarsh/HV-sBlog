const express = require('express');
const { sendMail, verifyOTP } = require('../services/mail'); 
const User = require('../models/user');
const router = express.Router();
const { createTokenForUser } = require('../services/authentication');

router.get('/forgotpassword', async (req, res) => {
    const email = req.query.email || (req.user ? req.user.email : '');
    res.render('forgotpassword', { email });
});

router.post('/sendotp', async (req, res) => {
    const { email } = req.body;
    try {
        await sendMail(req, res);
        res.render('verifyOTP', { email }); 
    } catch (error) {
        res.status(500).send('Error sending OTP, please try again.');
    }
});

router.post('/verifyotp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const verification = verifyOTP(email, otp);
    if (verification.valid) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).send('User not found.');
            }
            user.password = newPassword; 
            await user.save();
            const token = createTokenForUser(user);
            res.cookie('token', token).redirect('/');
        } catch (error) {
            console.error('Error during password update:', error); 
            res.status(500).send('Error updating password.');
        }
    } else {
        console.log('OTP verification failed:', verification.message);  
        res.status(400).send(verification.message);
    }
});

module.exports = router;