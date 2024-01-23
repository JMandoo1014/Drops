const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const KickDB = require('../../models/Infractions');
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'kick',
    description : 'Kick a target',
    userPermissions : ['KICK_MEMBERS'],
    botPermissions : ['KICK_MEMBERS'],
    options: [
        {
            name: "target",
            description: "Select a member to Kick",
            type: "USER",
            required: true,
        },
        {
            name: "reason",
            description: "Provide a reason for this kick",
            type: "STRING",
            required: true
        },
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, member, options } = interaction

        const Target = options.getMember('target')
        const Reason = options.getString('reason')

        const Response = new MessageEmbed()
        .setColor("RED")
        .setAuthor({ name: "Kick System", iconURL: guild.iconURL({ dynamic: true }) })

        if (Target.id === member.id) {
            Response.setDescription("⛔ | You cannot kick yourself")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.id === client.user.id) {
            Response.setDescription("⛔ | I cannot kick myself. _lmao_")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.roles.highest.posotion > member.roles.highest.posotion) {
            Response.setDescription(`⛔ | You cannot kick someone with a superior role than yours.`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.permissions.has('ADMINISTRATOR')) {
            Response.setDescription(`⛔ | You cannot kick an administrator`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        const userEmbed = new MessageEmbed()
        .setColor('BLUE')
        .setAuthor({ name: "Kick System", iconUSL: guild.iconURL({ dynamic: true }) })
        .setDescription(`You have been kicked in **${guild.name}**\nReason : "${Reason}"`)
        .setThumbnail(guild.iconURL())
        .setTimestamp()
        await Target.send({ embeds: [userEmbed] })
        .catch(() => { console.log(`Could not send the kick noticed to ${Target.user.tag}.`) })

        const serverEmbed = new MessageEmbed()
        .setColor('BLUE')
        .setAuthor({ name: "Kick System", iconURL: guild.iconURL({ dynamic: true }) })
        .setDescription(`**${Target.user.tag}** has been kicked\nStaff : ${member.user.tag}\nReason : "${Reason}"`)
        .setThumbnail(Target.user.displayAvatarURL())
        .setTimestamp()

        LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                interaction.reply({ embeds: [serverEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't kick this user", ephemeral: true })
                })
            } else {
                const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)

                const embed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`${Target.user.tag} has bees successfully kicked\nchecked log channel`)

                interaction.reply({ embeds: [embed] })
                LogChannel.send({ embeds: [serverEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't kick this user", ephemeral: true })
                })
            }
        })

        setTimeout(() => {
            Target.kick({ reason: Reason })
            .catch((err) => { console.log(err) });
        }, 500);

        KickDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                data = new KickDB({
                    GuildID: guild.id,
                    UserID: Target.id,
                    KickData: [
                        {
                            ExecuterID: member.id,
                            ExecuterTag: member.user.tag,
                            TargetID: Target.id,
                            TargetTag: Target.user.tag,
                            Reason: Reason,
                            Date: parseInt(interaction.createdTimestamp / 1000)
                        }
                    ],
                })
            } else {
                const newKickDataObject = 
                    {
                        ExecuterID: member.id,
                        ExecuterTag: member.user.tag,
                        TargetID: Target.id,
                        TargetTag: Target.user.tag,
                        Reason: Reason,
                        Date: parseInt(interaction.createdTimestamp / 1000)
                    }
                data.KickData.push(newKickDataObject)
            }
            data.save()
        });
    }
}