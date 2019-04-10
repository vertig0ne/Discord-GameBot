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

                        const a = await this.getPlayerData(args.username, this.platform[i]);
                        if (!a.results || !a.results[0]) throw new Error('Search yeilded no results');
                        const pid = a.results[0].pid;
                        const b = await this.getPlayer(pid);
                        const embed = this.embedMe(b);
                        await reply.edit({ embed });
                    } catch (err) {  }
                });
            }
        } else {
            const a = await this.getPlayerData(args.username, args.platform);
            if (!a.results || !a.results[0]) throw new Error('Search yeilded no results');
            const pid = a.results[0].pid;
            const b = await this.getPlayer(pid);
            const embed = this.embedMe(b);
            await message.reply({ embed });
        }
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

    async getPlayerData(name, patform) {
        try {
            const req = await axios({ method: 'GET', url: `https://thedivisiontab.com/api/search.php?name=${encodeURIComponent(name)}&platform=${patform}` });
            return req.data;
        } catch (err) { throw new Error('Unable to get player information') };
    }

    async getPlayer(playerId) {
        try {
            const req = await axios({ method: 'GET', url: `https://thedivisiontab.com/api/player.php?pid=${playerId}` });
            return req.data;
        } catch (err) { throw new Error('Unable to get player information') };
    }

    embedMe(player) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Stats for ${player.name}`);
        embed.setDescription(`**Gear Score**: ${player.gearscore}\n**Level**: ${player.level_pve}\n**Last Mission**: ${player.lastmission}`);
        embed.setTimestamp();
        embed.setColor(9851947);
        embed.setFooter(`Called by ${this.message.author.username}`, this.message.author.avatarURL);
        embed.setThumbnail(player.avatar_256);
        embed.setImage(`https://m.media-amazon.com/images/S/aplus-media/vc/77d0ef34-a53b-4bcb-af13-d57094720c3d._CR0,0,970,300_PT0_SX970__.png`);
        embed.setAuthor('The Division 2', 'https://pbs.twimg.com/profile_images/1005914879817994241/3CgOVaS7_400x400.jpg', 'https://tomclancy-thedivision.ubisoft.com/');

        embed.addField('Personal Stats', `**PvP Kills**: ${player.kills_pvp}\n**NPC Kills**: ${player.kills_npc}\n**Skill Kills**: ${player.kills_skill}\n**Headshots**: ${player.kills_headshot}\n**Items looted**: ${player.looted}\n**E-Credits**: ${player.ecredits}`);
        embed.addField('DarkZone Stats', `**Level**: ${player.level_dz}\n**XP**: ${player.xp_dz}\n**Time Played**: ${shortEnglishHumanizer(player.timeplayed_dz * 1000)}\n**While Rogue**: ${shortEnglishHumanizer(player.timeplayed_rogue * 1000)}\n**Hyenas Killed**: ${player.kills_pve_dz_hyenas}\n**OutCasts Killed**: ${player.kills_pve_dz_outcasts}\n**TrueSons Killed**: ${player.kills_pve_dz_truesons}\n**BlackTusks Killed**: ${player.kills_pve_dz_blacktusk}`);
        embed.addField('PvE Stats', `**XP**: ${player.xp_ow}\n**Time Played**: ${shortEnglishHumanizer(player.timeplayed_pve * 1000)}\n**Elite Kills**: ${player.kills_pvp_elitebosses}\n**Named Kills**: ${player.kills_pvp_namedbosses}\n**Hyena Kills**: ${player.kills_pve_hyenas}\n**OutCasts Kills**: ${player.kills_pve_outcasts}\n**TrueSons Kills**: ${player.kills_pve_truesons}\n**BlackTusk Kills**: ${player.kills_pve_blacktusk}`)
        return embed;
    }
}