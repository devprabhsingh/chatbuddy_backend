const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();


async function mailer(rEmail, code) {
    console.log('fn called')

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS:true,
        auth: {
          user: process.env.Nodemailer_email, // generated email user
          pass: process.env.Nodemailer_password, // generated email password
        },
    });
    
    let info = await transporter.sendMail({
        from: 'ChatBuddy',
        to: `${rEmail}`,
        subject: 'Email Verification',
        text: `Your verification code is ${code}`,
        html:`<b>Your verification code is ${code}</b>`
    })

    console.log("Message sent: %s", info.messageId);
}


router.post('/verify', (req, res) => {
    const { email } = req.body;
    console.log('got email')
    if (!email) {
        return res.status(404).json({msg:"email not found"})
    }
    else {
        User.findOne({ email })
            .then(async (savedUser) => {
                // // console.log(savedUser);
                // // return res.status(200).json({msg:"Email sent"})
                if (savedUser) {
                    return res.status(422).json({ msg: "Invalid Credentials" });
                }
                try {
                    let vCode = Math.floor(100000 + Math.random() * 900000);
                    await mailer(email, vCode)
                    return res.status(200).json({msg:'Email sent', vCode, email})
                }
                catch (err) {
                    return res.status(422).json({msg:"Error sending email"})
                }
            })
        //return res.status(200).json({msg:"Email sent"})
    } 
})

router.post('/checkUsername', (req, res) => {
    const { username, email } = req.body;
    
    User.find({ username })
        .then(async (savedUser) => {
            if (savedUser.length > 0) {
            return res.status(422).json({msg:"Username already exists"})
            }
            else {
                return res.status(200).json({msg:'Username available', username, email})
            }
    })
})

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(422).json({msg:'Please fill all the fields'})
    }
    else {
        const user = new User({
            username,
            email,
            password
        })

        try {
            await user.save();
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
            return res.status(200).json({msg:"user registered successfully",token})
        }
        catch (err) {
            console.log(err);
            return res.status(422).json({err:'user not registered'})
        }
    }
})
module.exports = router