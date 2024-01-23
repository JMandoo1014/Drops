const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    ChannelID: String,
})

module.exports = mongoose.model('Inf-Log', Schema) 
