const { ContextMenuInteraction, Client, MessageEmbed } = require('discord.js')

module.exports = {
    name : 'avatar',
    type: 'USER',

    /**
     * @param {Client} client
     * @param {ContextMenuInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const member = await client.users.fetch(interaction.targetId);

        const embed = new MessageEmbed()
            .setColor('e6e6e6')
            .setTitle(`${member.tag}'s avatar`)
            .setDescription(`**[\[256\]](${member.displayAvatarURL({ dynamic: true, size: 256 })})** , **[\[512\]](${member.displayAvatarURL({ dynamic: true, size: 512 })})** , **[\[1024\]](${member.displayAvatarURL({ dynamic: true, size: 1024 })})** , **[\[2048\]](${member.displayAvatarURL({ dynamic: true, size: 2048 })})** , **[\[4096\]](${member.displayAvatarURL({ dynamic: true, size: 4096 })})**`)
            .setImage(member.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter(`${interaction.member.user.tag}`, interaction.member.user.displayAvatarURL())
        interaction.followUp({ embeds: [embed] })
    
    }
}