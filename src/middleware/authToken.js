const jwt = require('jsonwebtoken')

module.exports = (req,res, next) => {
    const allValue = req.headers.authorization

    console.log(req.headers)

    if(!allValue)
        return res.status(404).json('Nothing has been found')
    
    const parts = allValue.split(' ')
    // console.log(parts)
    if(!parts.length === 2)
        return res.status(404).send('Invalid')

    const [scheme, token] = parts

    if(!/Bearer$/i.test(scheme))
        return res.status(404).send('Misunderstood')
    
    jwt.verify(token, process.env.FIFA, (err, decoded) => {
        if(err)
            res.status(404).send(err)

        req.userId = decoded.id
        return next()
    })

}