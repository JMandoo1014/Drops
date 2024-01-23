const { CommandInteraction, Client, MessageEmbed } = require('discord.js')

module.exports = {
    name : 'userinfo',
    description : 'show user\'s info',
    options: [
        {
            name: "user",
            description: "specified the user you want to see info",
            type: "USER",
            required: false,
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const user = interaction.options.getUser('user') || interaction.member.user
        const member = interaction.guild.members.cache.get(user.id);

        const InfoEmbed = new MessageEmbed()
        .setAuthor({ name: `${user.username}'s info`, iconURL: `${user.displayAvatarURL({ dynamic: true })}` })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor('NOT_QUITE_BLACK')
        .addField("Tag : ", `${user.tag}`)
        .addField("ID : ", `${user.id}`)
        .addField("Nickname : ", `${member.nickname || "none"}`)
        .addField("Roles : ", `${member.roles.cache.map(r => r).join(' ').replace("@everyone", " ")} [${member.roles.cache.size - 1}]`)
        .addField("Joined server", `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`)
        .addField("Joined Discord : ", `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`)
        interaction.reply({ embeds: [InfoEmbed] })
    }
}