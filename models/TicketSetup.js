const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    GuildID: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Description: String,
    Buttons: [String],
})

module.exports = mongoose.model('TicketSetup', Schema) 