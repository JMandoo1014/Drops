const client = require('../../index');

client.on('ready', () => {
    console.log(`Rogin by ${client.user.username}.`),

    client.user.setPresence({ activities: [{ name: '/help' }], status: 'online' })
})