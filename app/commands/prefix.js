const command = require('./base');

module.exports = class prefixCommand extends command {
    constructor(client) {
        const info = {
            "name": "prefix",
            "type": "guild"
        }
        super(client, info);
    }

    run(message, args = []) {
        args = args.toString();
        if (args == '') return message.reply('No Prefix found');
        message.guild.settings = this.client.settingsService.get(message.guild.id);
        message.guild.settings.prefix = args;
        this.client.settingsService.set(message.guild.id, message.guild.settings);
        message.channel.send(`Prefix was sucessfully changed to \`${args}\``);
    }
}