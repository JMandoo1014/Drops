const { CommandInteraction, Client, MessageEmbed, InteractionWebhook } = require('discord.js')
const IfDB = require('../../models/Infractions')

module.exports = {
    name : 'infractions',
    description : 'Infraction system',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "target",
            description: "Select a member to show infraction",
            type: "USER",
            required: true,
        },
        {
            name: "check",
            description: "Select a specific type of infraction to check",
            type: "STRING",
            required: true,
            choices: [
                {
                    name: "ALL",
                    value: "all"
                },
                {
                    name: "WARNINGS",
                    value: "warnings"
                },
                {
                    name: "BANS",
                    value: "bans"
                },
                {
                    name: "KICKS",
                    value: "kicks"
                },
                {
                    name: "MUTES",
                    value: "mutes"
                },
            ]
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, member, options } = interaction;

        const Target = options.getMember("target")
        const choice = options.getString("check")

        const Response = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: "Infraction System", iconURL: guild.iconURL({ dynamic: true })})

        switch(choice) {
            case "all" : {
                IfDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
                    if(err) throw err;
                    if(data) {
                        const W = data.BanData.length;
                        const B = data.BanData.length;
                        const K = data.KickData.length;
                        const M = data.MuteData.length;

                        Response.setDescription(`
                        Member: ${Target} | ${Target.id}\nWarnings: ${W}\nBans: ${B}\nKicks: ${K}\nMutes: ${M}`)

                        interaction.reply({ embeds: [Response] })
                    } else {
                        // noData
                        Response.setDescription(`${Target} has no Infractions`)
                        interaction.reply({ embeds: [Response] })
                    }
                })
            }
            break;

            case "warnings" : {
                IfDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
                    if(err) throw err;
                    if(data) {
                        if (data.WarnData.length < 1) {
                            Response.setDescription(`${Target} has no Warnings`)
                            interaction.reply({ embeds: [Response] })
                            return;
                        }
                        Response.setDescription(`${Target}'s Warnings\n`
                        + `${data.WarnData.map((w, i) => `ID: ${i + 1}\nDate: <t:${w.Date}:R>\nStaff: <@${w.ExecuterID}>\nReason: ${w.Reason}
                        \n`).join(" ").slice(0, 4000)}`)
                        interaction.reply({ embeds: [Response] })
                    } else {
                        // noData
                        Response.setDescription(`${Target} has no Warnings`)
                        interaction.reply({ embeds: [Response] })
                    }
                })
            }
            break;

            case "bans" : {
                IfDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
                    if(err) throw err;
                    if(data) {
                        if (data.BanData.length < 1) {
                            Response.setDescription(`${Target} has no Bans`)
                            interaction.reply({ embeds: [Response] })
                            return;
                        }
                        Response.setDescription(`${Target}'s Bans\n`
                        + `${data.BanData.map((w, i) => `ID: ${i + 1}\nDate: <t:${w.Date}:R>\nStaff: <@${w.ExecuterID}>\nReason: ${w.Reason}\nMessages Delete: ${w.Messages}
                        \n`).join(" ").slice(0, 4000)}`)
                        interaction.reply({ embeds: [Response] })
                    } else {
                        // noData
                        Response.setDescription(`${Target} has no Bans`)
                        interaction.reply({ embeds: [Response] })
                    }
                })
            }
            break;


            case "kicks" : {
                IfDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
                    if(err) throw err;
                    if(data) {
                        if (data.KickData.length < 1) {
                            Response.setDescription(`${Target} has no Kicks`)
                            interaction.reply({ embeds: [Response] })
                            return;
                        }
                        Response.setDescription(`${Target}'s Kicks\n`
                        + `${data.KickData.map((w, i) => `ID: ${i + 1}\nDate: <t:${w.Date}:R>\nStaff: <@${w.ExecuterID}>\nReason: ${w.Reason}
                        \n`).join(" ").slice(0, 4000)}`)
                        interaction.reply({ embeds: [Response] })
                    } else {
                        // noData
                        Response.setDescription(`${Target} has no Kicks`)
                        interaction.reply({ embeds: [Response] })
                    }
                })
            }
            break;

            case "mutes" : {
                IfDB.findOne({ GuildID: guild.id, UserID: Target.id }, async(err, data) => {
                    if(err) throw err;
                    if(data) {
                        if (data.MuteData.length < 1) {
                            Response.setDescription(`${Target} has no Mutes`)
                            interaction.reply({ embeds: [Response] })
                            return;
                        }
                        Response.setDescription(`${Target}'s Mutes\n`
                        + `${data.MuteData.map((w, i) => `ID: ${i + 1}\nDate: <t:${w.Date}:R>\nStaff: <@${w.ExecuterID}>\nReason: ${w.Reason}\nDuration: ${w.Duration}
                        \n`).join(" ").slice(0, 4000)}`)
                        interaction.reply({ embeds: [Response] })
                    } else {
                        // noData
                        Response.setDescription(`${Target} has no Mutes`)
                        interaction.reply({ embeds: [Response] })
                    }
                })
            }
            break;
        }
    }
}