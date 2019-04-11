const Discord = require('discord.js');
const axios = require('axios');
const humanizeDuration = require('humanize-duration');
const command = require('./base');

const replaceAll = (str, find, replace) => { return str.replace(new RegExp(find, 'g'), replace); }

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

module.exports = class pubgCommand extends command {
    constructor(client) {
        const info = {
            "name": "rainbow6",
            "type": "guild"
        }
        super(client, info);
        this.platform = ['xbl', 'psn', 'uplay'];
        this.platformNames = ['Xbox Live', 'PlayStation Network', 'uPlay'];
        this.platformEmojis = [];
        this.platformEmojis.push(client.emojis.get("565323600735764490")); // xbl
        this.platformEmojis.push(client.emojis.get("565324150399303698")); // psn
        this.platformEmojis.push(client.emojis.get("565323810388049926")); // uplay
    }

    async run(message, args = []) {
        args = this._parse(args);
        this.message = message;
        if (!args.username) throw new Error('Username not provided');
        if (!args.platform) {
            const embed = this._platformEmbed();
            const reply = await message.reply({ embed });
            const collectors = [];
            for (let i = 0; i < this.platformEmojis.length; i++) {
                await reply.react(this.platformEmojis[i]);
                const filter = (reaction, user) => reaction.emoji.name === this.platformEmojis[i].name && user.id === message.author.id;
                const collector = await reply.createReactionCollector(filter, {});
                collectors.push(collector);
                collector.on('collect', async (reaction, collector) => {
                    try {
                        for (let i = 0; i < collectors.length; i++) {
                            collectors[i].stop();
                        }

                        const embed = await this._run(args.username, this.platform[i]);
                        await reply.edit({ embed });

                        reply.reactions.forEach((r) => { r.remove(); });
                        reaction.remove();
                    } catch (err) {
                        const embed = this._err(err);
                        await reply.edit({ embed });
                    }
                });
            }
        } else {
            const embed = await this._run(args.username, this.platform[i]);
            await message.reply({ embed });
        }
    }

    async _run(username, platform) {
        try {
            const player = await this.getPlayer(username, platform);
            const pid = player.p_id;
            const stats = await this.getPlayerStats(pid);
            console.log(stats);
            const embed = this.statsEmbed({ player, stats });
            return embed;
        } catch (err) { throw err; }
    }

    _parse(args) {
        const r = { platform: false, username: false }
        let query = false;
        args.split(',').forEach(arg => {
            if (arg.startsWith('platform:')) {
                r.platform = arg.split(':')[1];
                query = args.replace(`${arg},`, '');
            }
        });
        if (!query) r.username = replaceAll(args, ',', ' ');
        else r.username = replaceAll(query, ',', ' ');
        if (r.username == `platform:${r.platform}`) r.username = false;
        return r;
    }

    _err(err) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Error');
        embed.setColor(16711680);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`${err.message}`);
        embed.setFooter(`Called by ${this.message.author.username}`, this.message.author.avatarURL);
        embed.setTimestamp();
        return embed;
    }

    _platformEmbed() {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Select Platform');
        embed.setDescription('Please select which platform to search for user under');
        embed.setColor(16711680);
        embed.setTimestamp();
        return embed;
    }

    _platformLong(shortPlatform) {
        switch (shortPlatform) {
            case 'xbl':
                return 'Xbox Live';
            case 'psn':
                return 'Playstation Network';
            case 'uplay':
                return 'Uplay';
            default:
                throw new RangeError('Platform does not exist');
        }
    }

    async getPlayer(name, platform) {
        try {
            const req = await axios({ method: 'GET', url: `https://r6tab.com/api/search.php?search=${encodeURIComponent(name)}&platform=${platform}` });
            console.log(req.data);
            if (req.data.totalResults === 0) throw new Error();
            return req.data.results[0];
        } catch (err) { throw new Error('Unable to find player') };
    }

    async getPlayerStats(playerId) {
        try {
            const req = await axios({ method: 'GET', url: `https://r6tab.com/api/player.php?p_id=${playerId}` });
            const p_data = {};
            // req.data.p_data
            const dataName = ['rankedtimeplayed', 'rankedkills', 'rankeddeaths', 'rankedwins', 'rankedlosses', 'casualtimeplayed', 'casualkills', 'casualdeaths', 'casualwins', 'casuallosses', 'bombwins', 'bomblosses',
        'securewins', 'securelosses', 'hostagewins', 'hostagelosses', 'totalbullets', 'headshots', 'totalmelees', 'totalrevives', 'totalsuicides', 'NA_wins', 'NA_losses', 'NA_abandons', 'NA_maxmmr', 'NA_maxrank', 'EU_wins', 
        'EU_losses', 'EU_abandons', 'EU_maxmmr', 'EU_maxrank', 'AS_wins', 'AS_losses', 'AS_abandons', 'AS_maxmmr', 'AS_maxrank'];

            for (let i = 0; i < dataName.length; i++) {
                p_data[dataName[i]] = req.data.data[i];
            }
            req.data.data = p_data;
            return req.data;
        } catch (err) { throw new Error('Unable to obtain player data') };
    }

    statsEmbed({ player, stats }) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Stats for ${player.p_name}`);
        embed.setAuthor('Rainbow Six: Siege', 'https://i.imgur.com/DvBP8Xy.png', 'https://rainbow6.ubisoft.com/siege/');
        embed.setTimestamp();
        embed.setColor(9851947);
        embed.setImage('https://i.imgur.com/g2S0lTs.jpg');
        embed.addField('General', `**Kills**: ${stats.data.rankedkills + stats.data.casualkills}\n**Deaths**: ${stats.data.rankeddeaths + stats.data.casualkills}\n**Wins**: ${stats.data.rankedwins + stats.data.casualwins}\n**Losses**: ${stats.data.rankedlosses + stats.data.casuallosses}\n**K/D**: ${((stats.data.rankedkills + stats.data.casualkills)/(stats.data.rankeddeaths + stats.data.casualkills)).toFixed(2)}\n**Melee Kills**: ${stats.data.totalmelees}\n**Headshots**: ${stats.data.headshots}\n**Time Played**: ${shortEnglishHumanizer((stats.data.rankedtimeplayed + stats.data.casualtimeplayed) * 1000)}`);
        embed.addField('Ranked', `**Time Played**: ${shortEnglishHumanizer(stats.data.rankedtimeplayed * 1000)}\n**Wins**: ${stats.data.rankedwins}\n**Losses**: ${stats.data.rankedlosses}\n**Deaths**: ${stats.data.rankeddeaths}\n**Kills**: ${stats.data.rankedkills}\n**K/D**: ${(stats.data.rankedkills/stats.data.rankeddeaths).toFixed(2)}`);
        embed.addField('Casual', `**Time Played**: ${shortEnglishHumanizer(stats.data.casualtimeplayed * 1000)}\n**Wins**: ${stats.data.casualwins}\n**Losses**: ${stats.data.casuallosses}\n**Deaths**: ${stats.data.casualdeaths}\n**Kills**: ${stats.data.casualkills}\n**K/D**: ${(stats.data.casualkills/stats.data.casualdeaths).toFixed(2)}`);
        embed.setFooter(`Called by ${this.message.author.username}`, this.message.author.avatarURL);
        return embed;
    }
}
