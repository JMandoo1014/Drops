const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const InfLogBD = require('../../models/Inf-Log')

module.exports = {
    name : 'logchannel',
    description : 'Select a infraction log channel',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "channel",
            description: "select a infraction log channel",
            type: "CHANNEL",
            required: true,
            channelTypes: ["GUILD_TEXT"]
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const channel = interaction.options.getChannel('channel')

        InfLogBD.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
            if(err) throw err;
            if(data) {
                data.ChannelID = channel.id;
                data.save();
            } else {
                new InfLogBD({
                    GuildID: interaction.guild.id,
                    ChannelID: channel.id,
                }).save();
            }

            const Response = new MessageEmbed()
            .setDescription(`Done! The log channel is <#${channel.id}>`)
            .setColor('GREEN')
            .setTimestamp()
            .setFooter({ text: `${interaction.member.user.tag}`, iconURL: interaction.member.user.displayAvatarURL()})

            interaction.reply({ embeds: [Response] })
        })
    }
}