const Discord = require('discord.js');
const axios = require('axios');
const command = require('./base');

const replaceAll = (str, find, replace) => { return str.replace(new RegExp(find, 'g'), replace); }

module.exports = class pubgCommand extends command {
    constructor(client) {
        const info = {
            "name": "pubg",
            "type": "guild"
        }
        super(client, info);
        this.platform = ['steam', 'psn', 'xbox'];
        this.platformNames = ['Steam', 'PlayStation Network', 'Xbox Live'];
        this.platformEmojis = [];
        this.platformEmojis.push(client.emojis.get("565406272237731850")); // steam
        this.platformEmojis.push(client.emojis.get("565324150399303698")); // psn
        this.platformEmojis.push(client.emojis.get("565323600735764490")); // xbl
    }

    async run(message, args) {
        if (!process.env.PUBG_TOKEN) throw new Error('PUBG Token not set');
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

    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`PUBG Command Help`);
        embed.setDescription(`The PUBG command shows stats for a player from the game`);
        embed.setTimestamp();
        embed.setColor(16752651);
        embed.setAuthor('PlayerUnknown\'s Battlegrounds', 'https://i.imgur.com/sHOBfxi.png', 'https://www.pubg.com/');
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} [platform:xbox/psn/steam] *Username*`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        await message.reply({ embed });
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

    async _run(username, platform) {
        try {
            const player = await this.findPlayer(username, platform);
            const pid = player.id;
            const stats = await this.getPlayerData(pid, platform);
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

    _platformEmbed() {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Select Platform');
        embed.setDescription('Please select which platform to search for user under');
        embed.setColor(16711680);
        embed.setTimestamp();
        return embed;
    }

    statsEmbed({ player, stats }) {
        console.log(stats.data.attributes.gameModeStats);
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Player Stats for ${player.attributes.name}`);
        embed.setAuthor('PlayerUnknown\'s Battlegrounds', 'https://i.imgur.com/sHOBfxi.png', 'https://www.pubg.com/');
        embed.setImage('https://www.killping.com/blog/wp-content/uploads/2018/01/PUBG-Tips-and-Tricks-Banner.jpg');
        embed.addField('Solo', `**Kills** ${stats.data.attributes.gameModeStats.solo.kills} (${stats.data.attributes.gameModeStats.solo.killPoints} pts)\n**Wins** ${stats.data.attributes.gameModeStats.solo.wins} - **Losses** ${stats.data.attributes.gameModeStats.solo.losses} - **Top 10** ${stats.data.attributes.gameModeStats.solo.top10s}\n**Avg Damage** ${Math.floor(stats.data.attributes.gameModeStats.solo.damageDealt)}`)
        embed.addField('Duo', `**Kills** ${stats.data.attributes.gameModeStats.duo.kills} (${stats.data.attributes.gameModeStats.duo.killPoints} pts) - **Revives** ${stats.data.attributes.gameModeStats.duo.revives}\n**Wins** ${stats.data.attributes.gameModeStats.duo.wins} - **Losses** ${stats.data.attributes.gameModeStats.duo.losses} - **Top 10** ${stats.data.attributes.gameModeStats.duo.top10s}\n**dBNOs** ${stats.data.attributes.gameModeStats.duo.dBNOs}\n**Avg Damage** ${Math.floor(stats.data.attributes.gameModeStats.duo.damageDealt)}`)
        embed.addField('Squads', `**Kills** ${stats.data.attributes.gameModeStats.squad.kills} (${stats.data.attributes.gameModeStats.squad.killPoints} pts) - **Revives** ${stats.data.attributes.gameModeStats.squad.revives}\n**Wins** ${stats.data.attributes.gameModeStats.squad.wins} - **Losses** ${stats.data.attributes.gameModeStats.squad.losses} - **Top 10** ${stats.data.attributes.gameModeStats.squad.top10s}\n**dBNOs** ${stats.data.attributes.gameModeStats.squad.dBNOs}\n**Avg Damage** ${Math.floor(stats.data.attributes.gameModeStats.squad.damageDealt)}`)
        embed.setColor(16752651);
        embed.setTimestamp();
        embed.setFooter(`Called by ${this.message.author.username}`, this.message.author.avatarURL);
        return embed;
    }

    async findPlayer(name, platform) {
        try {
            console.log(`https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${encodeURIComponent(name)}`);
            const req = await axios({ method: 'GET', url: `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${encodeURIComponent(name)}`, headers: { Authorization: process.env.PUBG_TOKEN, Accept: 'application/vnd.api+json' } });
            if (!req.data.data || !req.data.data[0]) throw new Error('Unable to find user');
            return req.data.data[0];
        } catch (err) { throw new Error('Unable to find player'); }
    }

    async getPlayerData(playerId, platform) {
        try {
            console.log(`https://api.pubg.com/shards/${platform}/players/${playerId}/seasons/lifetime`);
            const req = await axios({ method: 'GET', url: `https://api.pubg.com/shards/${platform}/players/${playerId}/seasons/lifetime`, headers: { Authorization: process.env.PUBG_TOKEN, Accept: 'application/vnd.api+json' } });
            return req.data;
        } catch (err) { throw new Error('Unable to obtain player data'); }
    }
}