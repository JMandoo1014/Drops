const { CommandInteraction, Client, MessageEmbed } = require('discord.js')

module.exports = {
    name : 'avatar',
    description : 'Show profile',
    usage: '/avatar <target>',
    options: [
        {
            name: "user",
            description: "specified the user you want to see avatar",
            type: "USER",
            required: false,
        },
    ],
    
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const member = interaction.guild.members.cache.get(args[0])

        if (!member) {
            const embed = new MessageEmbed()
            .setColor('e6e6e6')
            .setTitle(`${interaction.member.user.tag}'s avatar`)
            .setDescription(`**[\[256\]](${interaction.member.user.displayAvatarURL({ dynamic: true, size: 256 })})** , **[\[512\]](${interaction.member.user.displayAvatarURL({ dynamic: true, size: 512 })})** , **[\[1024\]](${interaction.member.user.displayAvatarURL({ dynamic: true, size: 1024 })})** , **[\[2048\]](${interaction.member.user.displayAvatarURL({ dynamic: true, size: 2048 })})** , **[\[4096\]](${interaction.member.user.displayAvatarURL({ dynamic: true, size: 4096 })})**`)
            .setImage(interaction.member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter({ text: `${interaction.member.user.tag}`, iconURL: interaction.member.user.displayAvatarURL() })

            interaction.reply({ embeds: [embed] })
        } else {
            const embed = new MessageEmbed()
            .setColor('e6e6e6')
            .setTitle(`${member.user.tag}'s avatar`)
            .setDescription(`**[\[256\]](${member.user.displayAvatarURL({ dynamic: true, size: 256 })})** , **[\[512\]](${member.user.displayAvatarURL({ dynamic: true, size: 512 })})** , **[\[1024\]](${member.user.displayAvatarURL({ dynamic: true, size: 1024 })})** , **[\[2048\]](${member.user.displayAvatarURL({ dynamic: true, size: 2048 })})** , **[\[4096\]](${member.user.displayAvatarURL({ dynamic: true, size: 4096 })})**`)
            .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter({ text: `${interaction.member.user.tag}`, iconURL: interaction.member.user.displayAvatarURL()})
    
            interaction.reply({ embeds: [embed] })
        }    
    }
}