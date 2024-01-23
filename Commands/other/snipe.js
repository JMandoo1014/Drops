const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const moment = require('moment')

module.exports = {
    name : 'snipe',
    description : 'Snipe the lastest deleted message.',
    options: [
        {
            name: "page",
            description: "page",
            type: "NUMBER",
            required: false
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const snipes = client.snipes.get(interaction.channel.id);
        if(!snipes) return interaction.reply({ content: "I can't find any deleted messages", ephemeral: true });

        const page = interaction.options.getNumber('page');
        if(!page) {
            const snipe = 0;
            const target = snipes[snipe];
            if(!target) return interaction.reply({ content: `There is only ${snipes.length} messages`, ephemeral: true })

            const { msg, time, image } = target

            const SnipeEmbed = new MessageEmbed()
            .setAuthor({ name: `${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
            .setImage(image)
            .setDescription(`Content : ${msg.content}`)
            .setFooter({ text: `${moment(time).fromNow()}  ||  ${snipe + 1} / ${snipes.length}` })
            .setColor('RANDOM')

            interaction.reply({ embeds: [SnipeEmbed] })
        } else {
            const snipe = page -1;
            const target = snipes[snipe];
            if(!target) return interaction.reply({ content: `There is only ${snipes.length} messages`, ephemeral: true })

            const { msg, time, image } = target

            const SnipeEmbed = new MessageEmbed()
            .setAuthor({ name: `${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
            .setImage(image)
            .setDescription(`Content : ${msg.content}`)
            .setFooter({ text: `${moment(time).fromNow()}  ||  ${snipe + 1} / ${snipes.length}` })
            .setColor('RANDOM')

            interaction.reply({ embeds: [SnipeEmbed] })
        }
    }
}