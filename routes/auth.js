const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

/*router.get('/protected',requireLogin,(req,res)=>{
    res.send("You Unlocked a protected route after login successfully.")
})*/ //testing of protected route

//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

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:"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"
    }
}))


router.post('/signup',(req,res)=>{
    //console.log(req.body)
    const {name,email,password,pic} = req.body
    if(!email || !password || !name){
        return res.status(422).json({error:"please add all the fields"})
    } //res.json({message:"successfully posted"})
    User.findOne({email:email})
    .then((savedUser) =>{
        if(savedUser){
            return res.status(422).json({error:"user already exist with that email"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                pic
            })
    
            user.save()
            .then(user=>{
                transporter.sendMail({
                    to:user.email,
                    from:"noreply@gmail.com",
                    subject:"signup success",
                    html:"<h1>welcome to prashant's instagram</h1>"
                })
                res.json({message:"saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
        
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(422).json({error:"please Add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser =>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:"successfully signedin"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = savedUser
                res.json({token:token,user:{_id,name,email,followers,following,pic}})
            }
            else{
                return res.status(422).json({error:"Invalid email or password"})
            }
        })
        .catch(err=>{
            console.log(err) //to see developer side error
        })
    })
    .catch(err=>{
        console.log(err)
    })
})

module.exports = router