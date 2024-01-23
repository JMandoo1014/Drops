const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const WarnDB = require('../../models/Infractions');
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'warnings',
    description : 'Warning System',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "add",
            description: "Adds a warning.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "Select a member to warn.",
                    type: "USER",
                    required: true
                },
                {
                    name: "reason",
                    description: "Privide a reason.",
                    type: "STRING",
                    required: true
                }
            ],
        },
        {
            name: "check",
            description: "Checks the warnings.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "Select a member to check warnings.",
                    type: "USER",
                    required: true
                },
            ],
        },
        {
            name: "remove",
            description: "Removes a specific warning.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "Select a member to remove warning.",
                    type: "USER",
                    required: true
                },
                {
                    name: "warnid",
                    description: "Privide the warning ID",
                    type: "STRING",
                    required: true
                },
            ],
        },
        {
            name: "clear",
            description: "Clears all warnings.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "Select a member to clear warnings.",
                    type: "USER",
                    required: true
                },
            ],
        },
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { options, guild, member } = interaction;

        const Sub = options.getSubcommand(['add', 'check', 'remove', 'clear']);
        const Target = options.getMember('target');
        const Reason = options.getString('reason');
        const WarnID = options.getString('warnid') - 1;

        const Response = new MessageEmbed()
        .setAuthor({ name: "Warning System", iconURL: guild.iconURL({ dynamic: true }) })
        
        if(Sub === 'add') { 

            WarnDB.findOne({ GuildID: guild.id, UserID: Target.id }, async (err, data) => {
                if(err) throw err;
                if(!data) {
                    data = new WarnDB({
                        GuildID: guild.id,
                        UserID: Target.id,
                        WarnData: [
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
                    const newWarnDataObject = 
                    {
                        ExecuterID: member.id,
                        ExecuterTag: member.user.tag,
                        TargetID: Target.id,
                        TargetTag: Target.user.tag,
                        Reason: Reason,
                        Date: parseInt(interaction.createdTimestamp / 1000)
                    }
                    data.WarnData.push(newWarnDataObject)
                }
                data.save()
            });

            Response.setColor('DARK_PURPLE').setDescription(`Warning Added: ${Target.user.tag} | <@${Target.id}>\nStaff : ${member.user.tag}\nReason: ${Reason}`)
            LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
                if(err) throw err;
                if(!data) {
                    interaction.reply({ embeds: [Response] }).catch(() => {
                        return interaction.reply({ content: "I can't warn this user", ephemeral: true })
                    })
                } else {
                    const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)
    
                    const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`${Target.user.tag} has bees successfully warned\nchecked log channel`)
    
                    interaction.reply({ embeds: [embed] })
                    LogChannel.send({ embeds: [Response] }).catch(() => {
                        return interaction.reply({ content: "I can't warn this user", ephemeral: true })
                    })
                }
            })

        } else if (Sub === 'check') {

            WarnDB.findOne({ GuildID: guild.id, UserID: Target.id }, async (err, data) => {
                if(err) throw err;
                if(data?.WarnData.length) {
                    Response.setColor('DARK_PURPLE').setDescription(`${Target}'s Warnings\n` + 
                    `${data.WarnData.map(
                        (w, i) => `ID: ${i + 1}\nDate: <t:${w.Date}:R>\nStaff: <@${w.ExecuterID}>\nReason: ${w.Reason}
                        \n`).join(" ").slice(0, 4000)}`)
                    interaction.reply({ embeds: [Response] })
                } else {
                    Response.setColor('RED').setDescription(`${Target} has no Warnings`)
                    interaction.reply({ embeds: [Response] })
                }
            })

        } else if (Sub === 'remove') {

            WarnDB.findOne({ GuildID: guild.id, UserID: Target.id }, async (err, data) => {
                if(err) throw err;
                if(data) {
                    Response.setColor('DARK_PURPLE').setDescription(`${Target}'s Warn has been removed.\nStaff : ${member.user.tag}\nWarnID: \"${WarnID + 1}\"`)
                    data.WarnData.splice(WarnID, 1)
                    data.save()

                    LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
                        if(err) throw err;
                        if(!data) {
                            interaction.reply({ embeds: [Response] }).catch(() => {
                                return interaction.reply({ content: "I can't remove warn this user", ephemeral: true })
                            })
                        } else {
                            const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)
            
                            const embed = new MessageEmbed()
                            .setColor('GREEN')
                            .setDescription(`${Target.user.tag} has bees successfully removed warn\nchecked log channel`)
            
                            interaction.reply({ embeds: [embed] })
                            LogChannel.send({ embeds: [Response] }).catch(() => {
                                return interaction.reply({ content: "I can't remove warn this user", ephemeral: true })
                            })
                        }
                    })
                } else {
                    Response.setColor('RED').setDescription(`${Target} has no Warnings`)
                    interaction.reply({ embeds: [Response] })
                }
            })

        }else if (Sub === 'clear') {

            WarnDB.findOne({ GuildID: guild.id, UserID: Target.id }, async (err, data) => {
                if(err) throw err;
                if(data) {
                    await WarnDB.findOneAndDelete({ GuildID: guild.id, UserID: Target.id })
                    Response.setColor('DARK_PURPLE').setDescription(`${Target}'s warnings were cleared\nStaff : ${member.user.tag}`)

                    LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
                        if(err) throw err;
                        if(!data) {
                            interaction.reply({ embeds: [Response] }).catch(() => {
                                return interaction.reply({ content: "I can't clear warnings this user", ephemeral: true })
                            })
                        } else {
                            const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)
            
                            const embed = new MessageEmbed()
                            .setColor('GREEN')
                            .setDescription(`${Target.user.tag} has bees successfully cleared warns\nchecked log channel`)
            
                            interaction.reply({ embeds: [embed] })
                            LogChannel.send({ embeds: [Response] }).catch(() => {
                                return interaction.reply({ content: "I can't clear warnings this user", ephemeral: true })
                            })
                        }
                    })
                } else {
                    Response.setColor('RED').setDescription(`${Target} has no Warnings`)
                    interaction.reply({ embeds: [Response] })
                }
            })
            
        }
    }
}