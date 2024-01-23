// const token = process.env['TOKEN']
const config = require('./config.json') 

const { Client, Collection, Intents, Util } = require("discord.js");
const fs = require('fs');
// require('dotenv').config();
const token = config.token

const intent = new Intents().add([
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_INTEGRATIONS",
    "GUILD_WEBHOOKS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGE_TYPING",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING",
])
const client = new Client({
    partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER", "REACTION"],
    intents: intent,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true,
    },
});

module.exports = client;

client.commands = new Collection();
client.contextMenu = new Collection();
client.aliases = new Collection();

client.snipes = new Collection();

require("./handler")(client);
client.login(token);