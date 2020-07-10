const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/fifa', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.promise = global.promise

module.exports = mongoose