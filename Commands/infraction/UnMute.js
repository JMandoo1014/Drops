const { CommandInteraction, Client, MessageEmbed, UserFlags } = require('discord.js')

const UsersDB = require('../../models/MuteUsers')
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'unmute',
    description : 'Unmute a target',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "target",
            description: "Select a member to unmute",
            type: "USER",
            required: true
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, member, options } = interaction

        const Target = options.getMember('target');
        const Mute = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted')

        const Response = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: "Mute System", iconURL: guild.iconURL({ dynamic: true }) })

        if(!Target.roles.cache.has(Mute.id)) {
            Response.setDescription('⛔ | Target is not muted')
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        const unmuteEmbed = new MessageEmbed()
        .setColor('YELLOW')
        .setAuthor({ name: "Mute System", iconURL: interaction.guild.iconURL() })
        .setDescription(`${Target.user.tag} has been unmuted\nStaff : ${member.user.tag}`)
        .setThumbnail(Target.user.displayAvatarURL())
        .setTimestamp()

        UsersDB.findOne({ GuildID: guild.id }, async(err, data) => {
            if(err) throw err;
            if (!data) {
                Response.setDescription('⛔ | Target is not muted')
                return interaction.reply({ embeds: [Response], ephemeral: true })
            }

            const user = data.Users.findIndex((prop) => prop === Target.id)
            if(user == -1) {
                Response.setDescription('⛔ | Target is not muted')
                return interaction.reply({ embeds: [Response], ephemeral: true })
            }
            data.Users.splice(user, 1);
            data.save();
            await Target.roles.remove(Mute);

            LogCH = await LogDB.findOne({ GuildID: guild.id })
            if(!LogCH) {
                interaction.reply({ embeds: [unmuteEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't unmute this user", ephemeral: true })
                })
            } else {
                const LogChannel = guild.channels.cache.get(LogCH.ChannelID)

                const embed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`${Target.user.tag} has bees successfully unmuted\nchecked log channel`)

                interaction.reply({ embeds: [embed] })
                LogChannel.send({ embeds: [unmuteEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't unmute this user", ephemeral: true })
                })
            }
        })
    }
}