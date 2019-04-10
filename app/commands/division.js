const axios = require('axios');
const Discord = require('discord.js');
const humanizeDuration = require('humanize-duration')
const command = require('./base');

/*
 * https://github.com/Tabwire/TheDivisionTab-API
 */

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

const replaceAll = (str, find, replace) => { return str.replace(new RegExp(find, 'g'), replace); }

module.exports = class divisionCommand extends command {
    constructor(client) {
        const info = {
            "name": "division",
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

    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Division Command Help`);
        embed.setDescription(`The Division command shows stats for a player from the division game`);
        embed.setTimestamp();
        embed.setColor(9851947);
        embed.setAuthor('The Division 2', 'https://pbs.twimg.com/profile_images/1005914879817994241/3CgOVaS7_400x400.jpg', 'https://tomclancy-thedivision.ubisoft.com/');
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} [platform:xbl/psn/uplay] *Username*`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        await message.reply({ embed });
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
            const pid = player.pid;
            const stats = await this.getPlayerStats(pid);
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

    async getPlayer(name, patform) {
        try {
            const req = await axios({ method: 'GET', url: `https://thedivisiontab.com/api/search.php?name=${encodeURIComponent(name)}&platform=${patform}` });
            if (!req.data || !req.data.results || !req.data.results[0]) throw new Error('No User');
            return req.data.results[0];
        } catch (err) { throw new Error('Unable to find player') };
    }

    async getPlayerStats(playerId) {
        try {
            const req = await axios({ method: 'GET', url: `https://thedivisiontab.com/api/player.php?pid=${playerId}` });
            return req.data;
        } catch (err) { throw new Error('Unable to obtain player data') };
    }

    statsEmbed({ player, stats }) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Stats for ${player.name}`);
        embed.setDescription(`**Gear Score**: ${stats.gearscore}\n**Level**: ${stats.level_pve}\n**Last Mission**: ${stats.lastmission}`);
        embed.setTimestamp();
        embed.setColor(9851947);
        embed.setFooter(`Called by ${this.message.author.username}`, this.message.author.avatarURL);
        embed.setThumbnail(player.avatar_256);
        embed.setImage(`https://m.media-amazon.com/images/S/aplus-media/vc/77d0ef34-a53b-4bcb-af13-d57094720c3d._CR0,0,970,300_PT0_SX970__.png`);
        embed.setAuthor('The Division 2', 'https://pbs.twimg.com/profile_images/1005914879817994241/3CgOVaS7_400x400.jpg', 'https://tomclancy-thedivision.ubisoft.com/');

        embed.addField('Personal Stats', `**PvP Kills**: ${stats.kills_pvp}\n**NPC Kills**: ${stats.kills_npc}\n**Skill Kills**: ${stats.kills_skill}\n**Headshots**: ${stats.kills_headshot}\n**Items looted**: ${stats.looted}\n**E-Credits**: ${stats.ecredits}`);
        embed.addField('DarkZone Stats', `**Level**: ${stats.level_dz}\n**XP**: ${stats.xp_dz}\n**Time Played**: ${shortEnglishHumanizer(stats.timeplayed_dz * 1000)}\n**While Rogue**: ${shortEnglishHumanizer(stats.timeplayed_rogue * 1000)}\n**Hyenas Killed**: ${stats.kills_pve_dz_hyenas}\n**OutCasts Killed**: ${stats.kills_pve_dz_outcasts}\n**TrueSons Killed**: ${stats.kills_pve_dz_truesons}\n**BlackTusks Killed**: ${stats.kills_pve_dz_blacktusk}`);
        embed.addField('PvE Stats', `**XP**: ${stats.xp_ow}\n**Time Played**: ${shortEnglishHumanizer(stats.timeplayed_pve * 1000)}\n**Elite Kills**: ${stats.kills_pvp_elitebosses}\n**Named Kills**: ${stats.kills_pvp_namedbosses}\n**Hyena Kills**: ${stats.kills_pve_hyenas}\n**OutCasts Kills**: ${stats.kills_pve_outcasts}\n**TrueSons Kills**: ${stats.kills_pve_truesons}\n**BlackTusk Kills**: ${stats.kills_pve_blacktusk}`)
        return embed;
    }
}