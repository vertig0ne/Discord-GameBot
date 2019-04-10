const Discord = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');

module.exports = class commandRepository {
    constructor(client) {
        this.client = client;
        this.commands = new Enmap();
        this.loadCommands('commands');
    }

    getCommands() {
        return this.commands.keyArray();
    }

    addCommand(command) {
        const cmd = new command(this.client);

        if (this.commands.some(x => x.name === cmd.info.name)) {
            throw new Error(`Command "${cmd.info.name}" already exists`);
        }
        this.commands.set(cmd.info.name, command);
        this.client.logService.info(`Loaded command: ${cmd.info.name}`);
    }

    getCommand(key) {
        return this.commands.get(key);
    }

    loadCommands(path) {
        fs.readdir(`${process.cwd()}/${path}`, (err, files) => {
            if (err) throw err;
            files.forEach(f => {
                if (f == 'base.js') return;
                const props = require(`${process.cwd()}/${path}/${f}`);
                this.client.logService.debug(`Attempting to load ${f}`);
                this.addCommand(props);
            });
        });
    }
}