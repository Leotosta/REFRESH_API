const express = require('express')
const router = express()
const { verify } = require('jsonwebtoken')
const authMiddleware = require('../middleware/authToken')

// router.use(authMiddleware)

router.get('/', authMiddleware,(req, res) => {
    return res.json(
        req.userId
    )
})

router.post('/refreshToken',authMiddleware, async (req, res) => {
    try {
        const token  = req.cookies.jid
        console.log(token)
        if(!token)
            return res.status(404).json('token not found')

        let payload = null

        try{
            payload = verify(token, process.env.FIFA_2)
        }catch(e){
            console.log(e)
            return res.status(404).json(e)
        }

        const user = await User.findOne({ id: payload.userId.id })

        if(!user)
            return res.status(404).json('token invalid')
        
        return res.json({ok: true, token: generateToken({id: user})})

    }catch(e){
        console.log(e)
    }
    
} )


module.exports = app => app.use('/menu', router)