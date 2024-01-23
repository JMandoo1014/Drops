const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const moment = require('moment');

const verificationLevels = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: '(╯°□°）╯︵ ┻━┻',
	VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};


module.exports = {
    name : 'serverinfo',
    description : 'show server info',

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const roles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
		const members = interaction.guild.members.cache;
		const channels = interaction.guild.channels.cache;
		const emojis = interaction.guild.emojis.cache;
        const owner = await interaction.guild.fetchOwner();

		const embed = new MessageEmbed()
			.setDescription(`**Guild information for __${interaction.guild.name}__**`)
			.setColor('NOT_QUITE_BLACK')
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.addField('**General**', 
				`❯ Name: ${interaction.guild.name}\n❯ ID: ${interaction.guild.id}\n❯ Owner: ${owner} (${owner.id})\n❯ Boost Tier: ${interaction.guild.premiumTier ? `${interaction.guild.premiumTier}` : 'None'}\n❯ Verification Level: ${verificationLevels[interaction.guild.verificationLevel]}\n❯ Time Created: <t:${parseInt(interaction.guild.createdTimestamp / 1000)}:R>\n\n`
			)
			.addField('**Statistics**', 
				`❯ Role Count: ${roles.length - 1}\n❯ Emoji Count: ${emojis.size}\n❯ Regular Emoji Count: ${emojis.filter(emoji => !emoji.animated).size}\n❯ Animated Emoji Count: ${emojis.filter(emoji => emoji.animated).size}\n❯ Member Count: ${interaction.guild.memberCount}\n❯ Humans: ${members.filter(member => !member.user.bot).size}\n❯ Bots: ${members.filter(member => member.user.bot).size}\n❯ Text Channels: ${channels.filter(channel => channel.type === 'GUILD_TEXT').size}\n❯ Voice Channels: ${channels.filter(channel => channel.type === 'GUILD_VOICE').size}\n❯ Boost Count: ${interaction.guild.premiumSubscriptionCount || '0'}`
			)
			.addField('Presence', 
				`❯ Online: ${members.filter(member => member.presence?.status === 'online').size}\n❯ Idle: ${members.filter(member => member.presence?.status === 'idle').size}\n❯ Do Not Disturb: ${members.filter(member => member.presence?.status === 'dnd').size}\n❯ Offline: ${members.filter(member => member.presence?.status === 'offline').size}`
			)
			.setTimestamp();
		interaction.reply({ embeds: [embed] });
    }
}