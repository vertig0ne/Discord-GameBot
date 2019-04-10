const command = require('./base');

module.exports = class pingCommand extends command {
    constructor(client) {
        const info = {
            "name": "ping",
            "type": "guild"
        }
        super(client, info);
    }

    async run(message, args = []) {
        const msg = await message.say('Ping?');
        return msg.edit(`I\'m still working! (It took me ${msg.createdTimestamp - message.createdTimestamp}ms to respond)`);
    }
}