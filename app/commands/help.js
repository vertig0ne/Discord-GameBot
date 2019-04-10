const Discord = require('discord.js');
const command = require('./base');

module.exports = class helpCommand extends command {
    constructor(client) {
        const info = {
            "name": "help",
            "type": "guild"
        }
        super(client, info);
    }

    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Available commands');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`${this.client.commandRepository.getCommands().join('\n')}`);
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} *command*`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();
        await message.reply({ embed });
    }

    async run(message, args) {
        if (!args) {
            const embed = new Discord.RichEmbed();
            embed.setTitle('Available commands');
            embed.setColor(3568138);
            embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
            embed.setDescription(`${this.client.commandRepository.getCommands().join('\n')}`);
            embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} *command*`);
            embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
            embed.setTimestamp();
            await message.reply({ embed });
        } else {
            let cmd = await this.client.commandRepository.getCommand(args);
            if (!cmd) throw new Error('Unable to find command');
            cmd = new cmd(this.client);
            if (!cmd.help) throw new Error('Command has no help');
            return await cmd.help(message);
        }
    }
}