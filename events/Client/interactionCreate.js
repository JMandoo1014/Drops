const { MessageEmbed } = require('discord.js')
const client = require("../../index");

client.on("interactionCreate", async (interaction) => {
    // Slash Command Handling
    if (interaction.isCommand()) {
        // await interaction.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = client.commands.get(interaction.commandName);
        if (!cmd)
            return interaction.followUp({ content: "An error has occured " });

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        const PermsEmbed = new MessageEmbed()
        .setColor("RED")
        .setAuthor("NO Permissions", interaction.guild.iconURL())

        if (!interaction.member.permissions.has(cmd.userPermissions || [])) {
            PermsEmbed.setDescription("⛔ You don't have permission to use this command")
            return interaction.followUp({ embeds: [PermsEmbed] })
        }
    
        if (!interaction.guild.me.permissions.has(cmd.botPermissions || [])) {
            PermsEmbed.setDescription("⛔ I don't have permission to use this command")
            return interaction.followUp({ embeds: [PermsEmbed] })
        }

        cmd.run(client, interaction, args);
    }

    // Context Menu Handling
    // if (interaction.isContextMenu()) {
    //     await interaction.deferReply({ ephemeral: false });
    //     const command = client.contextMenu.get(interaction.commandName);
    //     if (command) command.run(client, interaction);
    // }
});