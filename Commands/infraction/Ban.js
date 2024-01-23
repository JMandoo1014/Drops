const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const BanDB = require('../../models/Infractions');
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'ban',
    description : 'Ban a Target.',
    userPermissions : ['BAN_MEMBERS'],
    botPermissions : ['BAN_MEMBERS'],
    options: [
        {
            name: "target",
            description: "Select a member to ban",
            type: "USER",
            required: true,
        },
        {
            name: "reason",
            description: "Provide a reason for this ban",
            type: "STRING",
            required: true
        },
        {
            name: "messages",
            description: "Select number of days to delete messages (0-7)",
            type: "STRING",
            required: false,
            choices: [
                {
                    name: "1 day",
                    value: "1"
                },
                {
                    name: "2 days",
                    value: "2"
                },
                {
                    name: "3 days",
                    value: "3"
                },
                {
                    name: "4 days",
                    value: "4"
                },
                {
                    name: "5 days",
                    value: "5"
                },
                {
                    name: "6 days",
                    value: "6"
                },
                {
                    name: "7 days",
                    value: "7"
                },
            ]
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
        const Amount = options.getString('messages')
        const Reason = options.getString('reason')

        const Response = new MessageEmbed()
        .setColor("RED")
        .setAuthor({ name: "Ban System", iconURL: guild.iconURL({ dynamic: true }) })

        if (Target.id === member.id) {
            Response.setDescription("⛔ | You cannot ban yourself")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.id === client.user.id) {
            Response.setDescription("⛔ | I cannot ban myself. _lmao_")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.roles.highest.posotion > member.roles.highest.posotion) {
            Response.setDescription(`⛔ | You cannot ban someone with a superior role than yours.`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Target.permissions.has('ADMINISTRATOR')) {
            Response.setDescription(`⛔ | You cannot ban an administrator`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if (Amount > 7) {
            Response.setDescription('⛔ | The number of days to delete messages cannot exceed (0-7)')
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        const userEmbed = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: "Ban System", iconURL: guild.iconURL({ dynamic: true }) })
        .setDescription(`You have been banned in **${guild.name}**\nReason : "${Reason}"`)
        .setThumbnail(guild.iconURL())
        .setTimestamp()
        await Target.send({ embeds: [userEmbed] })
        .catch(() => { console.log(`Could not send the ban noticed to ${Target.user.tag}.`) })

        const serverEmbed = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: "Ban System", iconURL: guild.iconURL({ dynamic: true })})
        .setDescription(`**${Target.user.tag}** has been banned\nStaff : ${member.user.tag}\nReason : "${Reason}"`)
        .setThumbnail(Target.user.displayAvatarURL())
        .setTimestamp()

        LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                interaction.reply({ embeds: [serverEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't ban this user", ephemeral: true })
                })
            } else {
                const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)

                const embed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`${Target.user.tag} has bees successfully banned\nchecked log channel`)

                interaction.reply({ embeds: [embed] })
                LogChannel.send({ embeds: [serverEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't ban this user", ephemeral: true })
                })
            }
        })

        setTimeout(() => {
            Target.ban({ days: Amount, reason: Reason })
            .catch((err) => { console.log(err) });
        }, 500);

        BanDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                data = new BanDB({
                    GuildID: guild.id,
                    UserID: Target.id,
                    BanData: [
                        {
                            ExecuterID: member.id,
                            ExecuterTag: member.user.tag,
                            TargetID: Target.id,
                            TargetTag: Target.user.tag,
                            Messages: Amount,
                            Reason: Reason,
                            Date: parseInt(interaction.createdTimestamp / 1000)
                        }
                    ],
                })
            } else {
                const newBanDataObject = 
                    {
                        ExecuterID: member.id,
                        ExecuterTag: member.user.tag,
                        TargetID: Target.id,
                        TargetTag: Target.user.tag,
                        Messages: Amount,
                        Reason: Reason,
                        Date: parseInt(interaction.createdTimestamp / 1000)
                    }
                data.BanData.push(newBanDataObject)
            }
            data.save()
        });
    }
}