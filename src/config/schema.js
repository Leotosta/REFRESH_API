const mongoose = require('./db')
const bcrypt = require('bcryptjs')

const stringRequired = {
    type: String,
    require: true
}

const numberRequired = {
    type: Number
}

const userSchema = new mongoose.Schema({

    username: {
        ...stringRequired,
        trim: true,
        minlength: [6, ' Username must be more than 6 caracters!'],
        createIndex: true,       
    },

    email: {
        ...stringRequired,
        createIndex: true
    }, 

    password: {
        ...stringRequired,
        select: false
    },

    resetPasswordToken:{
        type: String,
        select: false,
        createIndex: true

    },

    resetPasswordExpires: {
        type: Date,
        select: false
    },

    autheticationToken: {
        type: String,
        createIndex: true
    },

    token: {
        type: String
    },

    active: false,

    victories: {
        ...numberRequired,
        min: 0
    },

    drawn: {
        ...numberRequired,
        min: 0
    },

    defeats: {
        ...numberRequired,
        min: 0
    }

}, {
    timestamps: true
}) 


userSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
} )

const User = mongoose.model('User', userSchema)

module.exports = User