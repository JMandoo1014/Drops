const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");
const mongoose = require("mongoose");
const globPromise = promisify(glob);
const config = require('../config.json')
const mongooseConnectionString = config.mongoose
// const mongooseConnectionString = process.env['MONGOOSE']
// require('dotenv').config();

/**
 * @param {Client} client
 */
module.exports = async (client) => {

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*/*.js`);
    eventFiles.map((value) => require(value));

    // Slash Commands
    const slashCommands = await globPromise(
        `${process.cwd()}/Commands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];
        if (file?.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
        arrayOfSlashCommands.push(file);
    });

    // Context Menu
    const contextMenu = await globPromise(
        `${process.cwd()}/ContextMenu/*/*.js`
    );

    contextMenu.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];
        if (file?.name) {
            const properties = { directory, ...file };
            client.contextMenu.set(file.name, properties);
        }

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });

    client.on("ready", async () => {
        await client.application.commands.set(arrayOfSlashCommands).then((cmd) => { })
    });

    // mongoose
    if (mongoose.connection.readyState !== 1) {
        if (!mongooseConnectionString) throw new Error("A mongoose connection is required because there is no established connection with mongoose!" );

        mongoose.connect(mongooseConnectionString, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true
        }).then((x) => console.log(`Connected! Database name: "${x.connections[0].name}"`));
    };
};