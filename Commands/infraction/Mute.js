const { CommandInteraction, Client, MessageEmbed, Permissions, MessageMentions } = require('discord.js')
const ms = require('ms')

const MuteDB = require('../../models/Infractions')
const UsersDB = require('../../models/MuteUsers')
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'mute',
    description : 'Mute a target.',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "target",
            description: "Select a member to mute",
            type: "USER",
            required: true,
        },
        {
            name: "reason",
            description: "Provide a reason for this mute",
            type: "STRING",
            required: true,
        },
        {
            name: "duration",
            description: "Select a preset time [ 1sec = 1s , 1 min = 1m , 1 hour = 1h , 1 day = 1d]",
            type: "STRING",
            required: false,
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
        const Duration = options.getString('duration') || 'None Duration';
        const Reason = options.getString('reason');
        const Mute = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted')

        const Response = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: "Mute System", iconURL: guild.iconURL({ dynamic: true }) })

        if(Target.id === member.id) {
            Response.setDescription("⛔ | You cannot mute yourself")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if(Target.id === client.user.id) {
            Response.setDescription("⛔ | I cannot mute myself. _lmao_")
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if(Target.roles.highest.position > interaction.member.roles.highest.position) {
            Response.setDescription(`⛔ | You cannot mute someone with a superior role than yours.`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if(Target.permissions.has('ADMINISTRATOR')) {
            Response.setDescription(`⛔ | You cannot mute an administrator`)
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        if(!Mute) {
            try {
                interaction.channel.send({ content: "I cannot find Muted role. I will try make Muted role" })
                const muterole = await interaction.guild.roles.create({
                    name: 'muted',
                    permissions: []
                })
                interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').forEach(async(channel, id) => {
                    await channel.permissionOverwrites.edit(muterole.id, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    })
                })
                interaction.channel.send({ content: "Muted role is successfully created" })
            } catch (err) {
                console.log(err)
            }
        };

        MuteDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                data = new MuteDB({
                    GuildID: guild.id,
                    UserID: Target.id,
                    MuteData: [
                        {
                            ExecuterID: member.id,
                            ExecuterTag: member.user.tag,
                            TargetID: Target.id,
                            TargetTag: Target.user.tag,
                            Duration: Duration,
                            Reason: Reason,
                            Date: parseInt(interaction.createdTimestamp / 1000)
                        }
                    ]
                })
            } else {
                const newMuteDataObject =
                {
                    ExecuterID: member.id,
                    ExecuterTag: member.user.tag,
                    TargetID: Target.id,
                    TargetTag: Target.user.tag,
                    Duration: Duration,
                    Reason: Reason,
                    Date: parseInt(interaction.createdTimestamp / 1000)
                }
                data.MuteData.push(newMuteDataObject)
            }
            data.save()
        })

        const Mute2 = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted')
        if(Target.roles.cache.has(Mute2.id)) {
            Response.setDescription('⛔ | Target has already been muted')
            return interaction.reply({ embeds: [Response], ephemeral: true })
        }

        const userEmbed = new MessageEmbed()
        .setColor('YELLOW')
        .setAuthor({ name: "Mute System", iconURL: interaction.guild.iconURL() })
        .setDescription(`You have been muted in **${interaction.guild.name}**\nReason : "${Reason}"\nDuration : ${Duration}`)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        await Target.send({ embeds: [userEmbed] })

        const serverEmbed = new MessageEmbed()
        .setColor('YELLOW')
        .setAuthor({ name: "Mute System", iconURL: interaction.guild.iconURL() })
        .setDescription(`**${Target.user.tag}** has been muted\nStaff : ${member.user.tag}\nReason : "${Reason}"\nDuration : ${Duration}`)
        .setThumbnail(Target.user.displayAvatarURL())
        .setTimestamp()

        const unmuteEmbed = new MessageEmbed()
        .setColor('YELLOW')
        .setAuthor({ name: "Mute System", iconURL: interaction.guild.iconURL() })
        .setDescription(`${Target.user.tag} has been unmuted (It's due)`)
        .setThumbnail(Target.user.displayAvatarURL())
        .setTimestamp()

        const LogCH = await LogDB.findOne({ GuildID: guild.id });
        if(!LogCH) {
            interaction.reply({ embeds: [serverEmbed] }).catch(() => {
                return interaction.reply({ content: "I can't mute this user", ephemeral: true })
            })

            const d = options.getString('duration')
            if(d) {
                await Target.roles.add(Mute2)

                UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                    if(err) throw err;
                    if(!data) {
                        new UsersDB({
                            GuildID: guild.id,
                            Users: Target.id
                        }).save();
                    } else {
                        data.Users.push(Target.id);
                        data.save();
                    }
                })

                setTimeout(async () => {
                    if(!Target.roles.cache.has(Mute2.id)) return;
                    UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                        const user = data.Users.findIndex((prop) => prop === Target.id);
                        data.Users.splice(user, 1);
                        data.save();
                        await Target.roles.remove(Mute2);
                    })
                    interaction.channel.send({ embeds: [unmuteEmbed] })
                }, ms(Duration));
            } else if(d === null) {
                await Target.roles.add(Mute2)

                UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                    if(err) throw err;
                    if(!data) {
                        new UsersDB({
                            GuildID: guild.id,
                            Users: Target.id
                        }).save();
                    } else {
                        data.Users.push(Target.id);
                        data.save();
                    }
                })
            }
        } else {
            const LogChannel = guild.channels.cache.get(LogCH.ChannelID)

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`${Target.user.tag} has bees successfully muted\nchecked log channel`)

                interaction.reply({ embeds: [embed] })
                LogChannel.send({ embeds: [serverEmbed] }).catch(() => {
                    return interaction.reply({ content: "I can't mute this user", ephemeral: true })
                })

                const d = options.getString('duration')
                if(d) {
                    await Target.roles.add(Mute2)

                    UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                        if(err) throw err;
                        if(!data) {
                            new UsersDB({
                                GuildID: guild.id,
                                Users: Target.id
                            }).save();
                        } else {
                            data.Users.push(Target.id);
                            data.save();
                        }
                    })

                    setTimeout(async () => {
                        if(!Target.roles.cache.has(Mute2.id)) return;
                        UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                            const user = data.Users.findIndex((prop) => prop === Target.id);
                            data.Users.splice(user, 1);
                            data.save();
                            await Target.roles.remove(Mute2);
                        })
                        interaction.channel.send({ embeds: [unmuteEmbed] })
                    }, ms(Duration));
                } else if(d === null) {
                    await Target.roles.add(Mute2)

                    UsersDB.findOne({ GuildID: guild.id }, async (err, data) => {
                        if(err) throw err;
                        if(!data) {
                            new UsersDB({
                                GuildID: guild.id,
                                Users: Target.id
                            }).save();
                        } else {
                            data.Users.push(Target.id);
                            data.save();
                        }
                })
            }
        }
    }
}