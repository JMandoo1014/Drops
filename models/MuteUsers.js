const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    Users: Array
})

module.exports = mongoose.model('MuteUser', Schema) 