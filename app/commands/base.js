module.exports = class command {
    // {
    //  "name": "",
    //  "description": "",
    //  "type": "guild"/"dm"
    // }
    constructor(client, info) {
        this.client = client;
        this.info = info;
        this._responses = new Set();
    }

    run(message, args) {
        throw new Error('Base command does nothing');
    }
}