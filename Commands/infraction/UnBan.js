const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const LogDB = require('../../models/Inf-Log');

module.exports = {
    name : 'unban',
    description : 'Unban a Target',
    userPermissions : ['BAN_MEMBERS'],
    botPermissions : ['BAN_MEMBERS'],
    options: [
        {
            name: "userid",
            description: "User id that you want to unban",
            type: "STRING",
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

        const userId = options.getString('userid');
        
        await guild.members.unban(userId).then((user) => {
            const unbanEmbed = new MessageEmbed()
            .setColor('RED')
            .setAuthor({ name: "Ban System", iconURL: guild.iconURL({ dynamic: true })})
            .setDescription(`**${user.tag}** has been unbanned\nStaff : ${member.user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()

            LogDB.findOne({ GuildID: interaction.guild.id }, async(err, data) => {
                if(err) throw err;
                if(!data) {
                    interaction.reply({ embeds: [unbanEmbed] })
                } else {
                    const LogChannel = interaction.guild.channels.cache.get(data.ChannelID)
    
                    const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`**${user.tag}** has bees successfully unbanned\nchecked log channel`)
    
                    interaction.reply({ embeds: [embed] })
                    LogChannel.send({ embeds: [unbanEmbed] })
                }
            })
        }).catch((err) => {
            interaction.reply({ content: "Please specify a valid banned member's id", ephemeral: true })
        })
    }
}