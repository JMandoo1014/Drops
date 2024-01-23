const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    UserID: String,
    WarnData: Array,
    BanData: Array,
    KickData: Array,
    MuteData: Array,
    LogChannel: String,
})

module.exports = mongoose.model('Infraction', Schema) 