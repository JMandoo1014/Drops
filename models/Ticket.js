const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    MembersID: [String],
    TicketID: String,
    ChannelID: String,
    Closed: Boolean,
    Locked: Boolean,
    Type: String,
})

module.exports = mongoose.model('Tickets', Schema) 
