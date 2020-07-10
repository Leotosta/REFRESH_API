const jwt = require('jsonwebtoken')

function generateToken(params = {}){
    return jwt.sign(params, process.env.FIFA, {
        expiresIn: '1d'
    })
}

function createRefreshToken(params = {}){
    return jwt.sign(params, process.env.FIFA_2, {
        expiresIn: '30m'
    })
}

module.exports = { generateToken, createRefreshToken }
