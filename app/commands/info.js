const Discord = require('discord.js');
const humanizeDuration = require('humanize-duration')
const command = require('./base');

const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: 'shortEn',
    languages: {
        shortEn: {
            y: () => 'y',
            mo: () => 'mo',
            w: () => 'w',
            d: () => 'd',
            h: () => 'h',
            m: () => 'm',
            s: () => 's',
            ms: () => 'ms',
        }
    }
});

module.exports = class infoCommand extends command {
    constructor(client) {
        const info = {
            "name": "info",
            "type": "guild"
        }
        super(client, info);
    }

    async run(message, args) {
        const uptime = Math.floor(process.uptime()) * 1000;
        const embed = new Discord.RichEmbed()
            .setTimestamp()
            embed.setColor(3568138);
            embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
            embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
            embed.addField('Uptime', shortEnglishHumanizer(uptime), true);
            embed.addField('Discord Servers', this.client.guilds.size, true)
            embed.addField('Version', this.client.version, true)
            embed.setColor(6583245);
        return message.reply({ embed });
    }
}