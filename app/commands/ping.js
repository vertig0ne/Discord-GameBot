const Discord = require('discord.js');
const command = require('./base');

module.exports = class pingCommand extends command {
    constructor(client) {
        const info = {
            "name": "ping",
            "type": "guild"
        }
        super(client, info);
    }

    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Ping');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`Sends a simple ping message`);
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name}`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();
        await message.reply({ embed });
    }

    async run(message, args = []) {
        const reply = await message.say('Ping?');
        const embed = new Discord.RichEmbed();
        embed.setTitle('Ping');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`I\'m still working! (It took me ${reply.createdTimestamp - message.createdTimestamp}ms to respond)`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();
        return reply.edit({ embed });
    }
}