const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    ChannelID: String,
    RoleID: String,
    Time: String
})

module.exports = mongoose.model('LockDown', Schema) 