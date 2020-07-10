const express = require('express')
const router = express.Router()
const User = require('../config/schema')
// const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { createRefreshToken, generateToken } = require('../auth')
const {sendEmail} = require('../email/send')

router.get('/SignUp', async (req, res) => {
    try{
        const users = await User.find()
        return res.json(users)

    }catch(e){
        console.log(e)
        return res.status(404).json(e)
    }
})

router.post('/SignUp', async (req, res) => {
    
    const { username, email, password, confirmPass } = req.body
    
    try{
         const user = await User.findOne({$or: [{ username }, {email}  ]})

        const active = false

        if(user)
            return res.status(404).json('Already exits.')

        if(password !== confirmPass)
            return res.status(404).json('Passwords are differents ')

        let autheticationToken = crypto.randomBytes(10).toString('hex')

        const tokenSecurityTest = await User.findOne({ autheticationToken })
        
            if(tokenSecurityTest){
                let newCrypt =  crypto.randomBytes(10).toString('hex')
                 autheticationToken = newCrypt
                 newCrypt = undefined
                 return autheticationToken
            }
        


        const newUser = new User({ username, email, password, active, autheticationToken })
        const createEntry = await newUser.save()

        createEntry.password = undefined

        const mailOptions = typeEmail(email, autheticationToken, 'Confirm your account', 'Your account needs to be activated', 'valid')

        sendEmail(mailOptions)

        return res.json(createEntry)

    }catch(e){
        console.log(e)
        return res.status(400).json(e)
    }
})

router.post('/Authetication', async (req, res) => {
    const { autheticationToken } = req.body
    try{
        const user = await User.findOne({autheticationToken})
    
        if(!user)
            return res.status(404).json('Error invalid token!')
    
        if(user.autheticationToken !== autheticationToken)
            return res.status(404).json('Error token invalid') 
            
        await User.findByIdAndUpdate(user._id, {
            "$set": {
                active: true
            }
        })
    
        return res.json('Verified')
    }

    catch(e){
        console.log(e)
        return res.status(404).send(e)
    }


})

router.post('/SignIn', async (req, res) => {
    const { username, password } = req.body

    try{
        const user = await User.findOne({ username }).select('+password')
        if(!user)
            return res.status(404).json('User or password invalid!')

        if(user.active === false)
            return res.status(404).json(' Your account is not valid!')
        
        if(!await bcrypt.compare(password, user.password))
            return res.status(404).json(' User or password invalid!')

        user.password = undefined

          res.cookie('jid', createRefreshToken({ id: user._id }), { maxAge: 60000,
             httpOnly: true, path: '/' })   
       
         return res.json({
             user,
             token: generateToken({id: user._id})
        })      

    }catch(e){
        console.log(e)
        return res.status(404).json('Erro test')
    }
})

function typeEmail(email,data, subject, text, template){
    let arroba = email.indexOf('@')
    let dotCom = email.indexOf('.com') 

    let emailType = email.slice(arroba + 1, dotCom)

    let whichOne = emailType === 'gmail' ? process.env.GMAIL_EMAIL : process.env.OUTLOOK_EMAIL
    return {
        to: email,
        from: whichOne,
        subject,
        text,
        context: {data},
        template
    }

}

router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body

    try{
        const user = await User.findOne({email}).select('+resetPasswordToken')

        if(!user)
            return res.status(404).json('User or invalid!')

        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date() 

        now.setHours(now.getHours() + 2 )
       
        await User.findOneAndUpdate(user._id, {
            "$set" : {
                resetPasswordToken : token,
                resetPasswordExpires: now,
            }    
        })
        
        let obj = Object.assign({}, user._doc)
      

        const mailOptions = typeEmail(email, obj, 'Password has been forgotten', ' New Pass', 'index' )
        
        sendEmail(mailOptions)
        
        return res.json({
            now,
            token
        })

    }catch(e){
        console.log(e)
        return res.status(404).json(e)
    }

})

router.post('/NewPass', async (req, res) => {
    const { email, token, newPass, confirmNewPass } = req.body
    
    const user = await User.findOne({email}).select('+resetPasswordToken resetPasswordExpires')

    if(!user)
        return res.status(404).json('Invalid token! Probably it may have been expiredd!')

    if(user.resetPasswordToken !== token)
        return res.status(404).json('Invalid token! Probably it may have been expired!')
        

    if(user.resetPasswordToken === undefined || user.resetPasswordToken === null)
        return res.status(404).json('Error')

    if(newPass !== confirmNewPass)
        return res.status(404).json('Passwords are different!')
    
    const now = new Date()

    if(now > user.resetPasswordExpires){
        user.resetPasswordExpires = undefined
        return res.status(404).json('Your token has been expired!')
    }

    user.password = newPass

    await user.save()

    return res.json('Password sucessfully changed!')

})


module.exports  = app => app.use('/', router)