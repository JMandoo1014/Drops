const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const LockDB = require('../../models/LockDown');
const ms = require('ms')

module.exports = {
    name : 'lock',
    description : 'Locks a channel',
    userPermissions : ['MANAGE_CHANNELS'],
    botPermissions : ['MANAGE_CHANNELS'],
    options: [
        {
            name: "channel",
            description: "the channel you want to lock",
            required: true,
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"]
        }, 
        {
            name: "role",
            description: "the role which can't type in the channel",
            required: false,
            type: "ROLE"
        },
        {
            name: "time",
            description: "Expire date for this lockdown (1m, 1h, 1d)",
            type: "STRING",
            required: false
        },
        {
            name: "reason",
            description: "Provied a reason for this lockdown",
            type: "STRING",
            required: false
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, options } = interaction;
        const channel = options.getChannel("channel");
        const Reason = options.getString('reason') || 'No Reason';

        let role = interaction.options.getRole("role") || channel.guild.roles.everyone;

        const Embed = new MessageEmbed();

        channel.permissionOverwrites.edit(role, {
            SEND_MESSAGES: false
        });

        if(!channel.permissionsFor(role).has('SEND_MESSAGES')) {
            return interaction.reply({ embeds: [
                Embed
                .setColor('RED')
                .setDescription('⛔ | This channel is already locked.')
            ], ephemeral: true })
        }

        await interaction.reply({ embeds: [
            Embed
            .setColor('RED')
            .setAuthor({ name: `channel locked by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`🔒 | locked ${channel} for ${role} | Reason : ${Reason}`)
        ] })

        const Time = options.getString('time');
        if(Time) {
            const ExpireDate = Date.now() + ms(Time);
            LockDB.create({ GuildID: guild.id, ChannelID: channel.id, RoleID: role.id, Time: ExpireDate }, async (err, data) => {
                if(err) throw err;

                setTimeout(async () => {
                    channel.permissionOverwrites.edit(role, {
                        SEND_MESSAGES: null,
                    });
                    interaction.editReply({ embeds: [
                        Embed.setAuthor({ name: '' })
                        .setDescription('🔓 | The lockdown has been lifted')
                        .setColor('GREEN')
                    ] }).catch(() => {});
                    await LockDB.findOneAndDelete({ GuildID: guild.id, ChannelID: channel.id })
                }, ms(Time));

                data.save();
            })
        } else {
            LockDB.create({ GuildID: guild.id, ChannelID: channel.id, RoleID: role.id, Time: "No time given" }, async(err, data) => {
                if(err) throw err;
                data.save();
            })
        }
    }
}