const { CommandInteraction, Client, MessageEmbed } = require('discord.js')

module.exports = {
    name : 'ping',
    description : 'Returns latency and API ping',
    usage: '/ping',
    
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const msg = await interaction.reply(`🏓 Pinging...`)
        const embed = new MessageEmbed()
            .setTitle('Pong!')
            .setDescription(`WebSocket ping is ${client.ws.ping}MS`)
        interaction.followUp({ embeds: [embed] })
    }
}