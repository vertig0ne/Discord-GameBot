const Discord = require('discord.js');
const command = require('./base');

module.exports = class prefixCommand extends command {
    constructor(client) {
        const info = {
            "name": "prefix",
            "type": "guild"
        }
        super(client, info);
    }

    async hasPermission(message) {
        return message.member.hasPermission('ADMINISTRATOR');
    }

    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Prefix');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`Changes the command prefix for the server\n\n**Only Server Administrators can run this command**`);
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} *prefix*`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();
        await message.reply({ embed });
    }

    async run(message, args = []) {
        args = args.toString();
        if (args == '') return message.reply('No Prefix found');
        message.guild.settings = this.client.settingsService.get(message.guild.id);
        message.guild.settings.prefix = args;
        this.client.settingsService.set(message.guild.id, message.guild.settings);

        const embed = new Discord.RichEmbed();
        embed.setTitle('Change Prefix');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`Prefix was sucessfully changed to \`${args}\``);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();

        await message.reply({ embed });
    }
}