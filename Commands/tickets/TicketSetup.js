const { 
    CommandInteraction, 
    Client, 
    MessageEmbed, 
    MessageActionRow, 
    MessageButton 
} = require('discord.js')
const DB = require('../../models/TicketSetup');

module.exports = {
    name : 'ticketsetup',
    description : 'Setup your ticketing message',
    userPermissions : ['ADMINISTRATOR'],
    botPermissions : ['ADMINISTRATOR'],
    options: [
        {
            name: "channel",
            description: "Select the ticket creation channel",
            required: true,
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"]
        },
        {
            name: "category",
            description: "Select the ticket channel creation category",
            required: true,
            type: "CHANNEL",
            channelTypes: ["GUILD_CATEGORY"]
        },
        {
            name: "transcripts",
            description: "Select the transcripts channel",
            required: true,
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"]
        },
        {
            name: "handlers",
            description: "Select the ticket handler's role",
            required: true,
            type: "ROLE",
        },
        {
            name: "description",
            description: "Set the description of the ticket creation channel.",
            required: true,
            type: "STRING",
        },
        {
            name: "firstbutton",
            description: "Give your first button a name and add an emoji by adding a comma followed by emoji.",
            required: true,
            type: "STRING",
        },
        {
            name: "secondbutton",
            description: "Give your second button a name and add an emoji by adding a comma followed by emoji.",
            required: true,
            type: "STRING",
        },
        {
            name: "thirdbutton",
            description: "Give your third button a name and add an emoji by adding a comma followed by emoji.",
            required: true,
            type: "STRING",
        },
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async(client, interaction, args) => {
        const { guild, options } = interaction;

        try {
            const Channel = options.getChannel('channel');
            const Category = options.getChannel('category');
            const Transcripts = options.getChannel('transcripts');
            const Handlers = options.getRole('handlers');

            const Description = options.getString('description');

            const Button1 = options.getString('firstbutton').split(",");
            const Button2 = options.getString('secondbutton').split(",");
            const Button3 = options.getString('thirdbutton').split(",");

            const Emoji1 = Button1[1];
            const Emoji2 = Button2[1];
            const Emoji3 = Button3[1];

            await DB.findOneAndUpdate(
                { GuildID: guild.id }, 
                { 
                    ChannelID: Channel.id, 
                    Category: Category.id, 
                    Transcripts: Transcripts.id, 
                    Handlers: Handlers.id,
                    Description: Description,
                    Buttons: [Button1[0], Button2[0], Button3[0]],
                },
                {
                    new: true,
                    upsert: true,
                }
            );

            const Buttons = new MessageActionRow()
            Buttons.addComponents(
                new MessageButton()
                    .setCustomId(Button1[0])
                    .setLabel(Button1[0])
                    .setStyle('SECONDARY')
                    .setEmoji(Emoji1),
                new MessageButton()
                    .setCustomId(Button2[0])
                    .setLabel(Button2[0])
                    .setStyle('SECONDARY')
                    .setEmoji(Emoji2),
                new MessageButton()
                    .setCustomId(Button3[0])
                    .setLabel(Button3[0])
                    .setStyle('SECONDARY')
                    .setEmoji(Emoji3)
            );

            const Embed = new MessageEmbed()
            .setAuthor({ name: `${guild.name} Ticket System`, iconURL: guild.iconURL({ dynamic: true })})
            .setDescription(Description)
            .setColor('RANDOM');
    
            guild.channels.cache.get(Channel.id).send({ embeds: [Embed], components: [Buttons] });
    
            await interaction.reply({ content: "Done", ephemeral: true })
        } catch (err) {
            const errEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(
                `⛔ | An error occured while setting up your ticket system\n**what to make sure of?**
                1. Make sure none of your buttons' name are duplicated
                2. Make sure you use this format for your buttons => **[ Name,Emoji ]**
                3. Make sure you button names do not exceed 200 characters
                4. Make sure your buttons emojis, are actually emojis, not ids.`
                );
            //console.log(err)
            interaction.reply({ embeds: [errEmbed] })
        }
    }
}