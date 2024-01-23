const { MessageEmbed } = require('discord.js')
const client = require("../../index");
const prefix = process.env['PREFIX']

client.on("messageCreate", async (message) => {
    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(prefix)
    )
        return;

    const Response = new MessageEmbed()
    .setColor('DARK_RED')
    .setAuthor({ name: "Error", iconURL: message.guild.iconURL({ dynamic: true })})
    .setDescription("This Bot made of discord.js v13\nSo please use slash command\nIf you want to see a command use `/help`")

    message.reply({ embeds: [Response] })
});




