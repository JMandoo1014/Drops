const { ButtonInteraction, MessageEmbed } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');
const client = require('../../index');

const DB = require('../../models/Ticket');
const TicketSetupData = require('../../models/TicketSetup');

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isButton()) return;
    const { guild, customId, channel, member } = interaction
    if(!['close', 'lock', 'unlock'].includes(customId)) return;

    const TicketSetup = await TicketSetupData.findOne({ GuildID: guild.id });
    if(!TicketSetup) return interaction.reply({ content: "The data for this system is outdated.", ephemeral: true });

    if(!member.roles.cache.find((r) => r.id === TicketSetup.Handlers)) return interaction.reply({
        content: "You can't use these buttons",
        ephemeral: true,
    })

    const Embed = new MessageEmbed()
    .setColor('BLUE')

    DB.findOne({ ChannelID: channel.id }, async(err, docs) => {
        if(err) throw err;
        if(!docs) return interaction.reply({ content: "No data was found related to this ticket, please delete manual.", ephemeral: true })

        switch(customId) {
            case "lock" :
                if(docs.Locked == true) return interaction.reply({ content: 'The ticket is already locked', ephemeral: true })
                await DB.updateOne({ ChannelID: channel.id }, { Locked: true })
                Embed.setDescription('🔒 | This ticket is now locked for reviewing.');

                docs.MembersID.forEach((m) => {
                    channel.permissionOverwrites.edit(m, {
                        SEND_MESSAGES: false,
                    });
                });

                interaction.reply({ embeds: [Embed] })
                break;

            case "unlock" :
                if(docs.Locked == false) return interaction.reply({ content: 'The ticket is already unlocked', ephemeral: true })
                await DB.updateOne({ ChannelID: channel.id }, { Locked: false })
                Embed.setDescription('🔓 | This ticket is now unlocked.');
                docs.MembersID.forEach((m) => {
                    channel.permissionOverwrites.edit(m, {
                        SEND_MESSAGES: true,
                    });
                });
                interaction.reply({ embeds: [Embed] })
                break;

            case "close" :
                if(docs.Closed == true) return interaction.reply({ content: 'Ticket is already closed, Please wait for it to get delete', ephemeral: true })
                const attachment = await createTranscript(channel, {
                    limit: -1,
                    returnBuffer: false,
                    fileName: `${docs.Type}-${docs.TicketID}.html`
                });

                const Message = await guild.channels.cache.get(TicketSetup.Transcripts).send({
                    embeds: [Embed.setTitle(`Transcript Type: ${docs.Type}\nID: ${docs.TicketID}`)],
                    files: [attachment]
                });
                
                interaction.reply({ embeds: [Embed.setDescription(`The transcript is now saved [TRANSCRIPT](${Message.url})`)] })

                setTimeout(() => {
                    interaction.channel.delete();
                    DB.updateOne({ ChannelID: channel.id }, { Closed: true })
                }, 10 * 1000);
                setTimeout(() => {
                    DB.findOneAndDelete({ GuildID: guild.id, ChannelID: channel.id })
                }, 10 * 1500);
        }
    })
})