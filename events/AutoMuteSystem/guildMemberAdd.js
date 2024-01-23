const client = require('../../index');
const UsersDB = require('../../models/MuteUsers');

client.on("guildMemberAdd", async(member) => {
    const data = await UsersDB.findOne({ GuildID: member.guild.id });
    if(!data) return;
    const user = data.Users.findIndex((prop) => prop === member.id);
    if(user == -1) return;
    const role = member.guild.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
    member.roles.add(role.id)
})