const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const LockDB = require('../../models/LockDown');

module.exports = {
    name : 'unlock',
    description : 'Lift a lockdown from a channel',
    userPermissions : ['MANAGE_CHANNELS'],
    botPermissions : ['MANAGE_CHANNELS'],
    options: [
        {
            name: "channel",
            description: "the channel you want to unlock",
            required: true,
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"]
        }, 
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, options } = interaction;
        const channel = options.getChannel("channel");
        const Lockrole = await LockDB.findOne({ GuildID: guild.id, ChannelID: channel.id })
        let role = Lockrole.RoleID

        const Embed = new MessageEmbed();

        if(!Lockrole) {
            return interaction.reply({ embeds: [
                Embed
                .setColor('RED')
                .setDescription('⛔ | This channel is not locked')
            ], ephemeral: true })
        }

        if(channel.permissionsFor(role).has("SEND_MESSAGES")) {
            return interaction.reply({ embeds: [
                Embed
                .setColor('RED')
                .setDescription('⛔ | This channel is not locked')
            ], ephemeral: true })
        }

        channel.permissionOverwrites.edit(role, {
            SEND_MESSAGES: null
        })

        // await LockDB.findOne({ GuildID: guild.id, ChannelID })
        await LockDB.findOneAndDelete({ GuildID: guild.id, ChannelID: channel.id })

        interaction.reply({ embeds: [
            Embed
            .setColor('GREEN')
            .setDescription('🔓 | The lockdown has been lifted')
        ] })
    }
}