const { 
    CommandInteraction, 
    Client, 
    MessageActionRow, 
    MessageButton , 
    MessageEmbed,
    MessageSelectMenu,
    CachedManager,
    Message
} = require('discord.js')

module.exports = {
    name : 'help',
    description : 'help command for bot',

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const emojis = {
            info: 'ℹ️',
            infraction: '🛠️',
            other: '🗂️',
            tickets: '🎫'
        }

        const directories = [...new Set(client.commands.map(cmd => cmd.directory))]
        
        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands= client.commands.filter(
                (cmd) => cmd.directory === dir
            ).map(cmd => {
                return {
                    name: cmd.name || 'There is no name for this command',
                    description: cmd.description || 'There is no description for this command',
                };
            });

            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });

        const helpEmbed = new MessageEmbed()
        .setTitle('Drops Help Commands')
        .setThumbnail(`${client.user.avatarURL({ dynamic: true })}`)
        .setDescription('Please choose a category in the dropdown menu');

        const components = (state) => [
            new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId("help-menu")
                .setPlaceholder('Please select a category')
                .setDisabled(state)
                .addOptions(
                    categories.map((cmd) => {
                        return {
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `Commands from ${cmd.directory} category`,
                            emoji: emojis[cmd.directory.toLowerCase()] || null
                        }
                    })
                )
            )
        ]

        const initialMessage = await interaction.reply({
            embeds: [helpEmbed],
            components: components(false),
        });

        const filter = (int) => int.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU' });

        collector.on('collect', (interaction) => {
            const [ directory ] = interaction.values;
            const category = categories.find((x) => x.directory.toLowerCase() === directory);

            const categoryEmbed = new MessageEmbed()
            .setTitle(`${directory} commands`)
            .setThumbnail(`${client.user.avatarURL({ dynamic: true })}`)
            .setDescription('Commands list')
            .addFields(
                category.commands.map((cmd) => {
                    return {
                        name: `\`${cmd.name}\``,
                        value: cmd.description,
                        inline: false,
                    }
                })
            )

            interaction.update({ embeds: [categoryEmbed] })
        });

        collector.on('end', () => {
            initialMessage.edit({ components: components(true) })
        })
    }
}