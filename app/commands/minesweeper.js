// Shout out to HalianElf#6003
const Discord = require('discord.js');
const command = require('./base');
module.exports = class minesweeperCommand extends command {
    constructor(client) {
        const info = {
            "name": "minesweeper",
            "type": "guild"
        }
        super(client, info);
    }
    
    async help(message) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Minesweeper');
        embed.setColor(3568138);
        embed.setAuthor(`GameBot`, 'https://github.com/vertig0ne/Discord-GameBot/blob/master/app.png?raw=true');
        embed.setDescription(`Plays a game of Minesweeper!\n\nUses Discord spoiler tag\n\n**Available Difficulties** easy/medium/hard/xhard\n\n**Default** medium`);
        embed.addField('Usage', `${message.guild.settings.prefix}${this.info.name} *difficulty*`);
        embed.setFooter(`Called by ${message.author.username}`, message.author.avatarURL);
        embed.setTimestamp();
        await message.reply({ embed });
    }

    async run(message, args) {
        let bombs = 0;
        switch (args) {
            case 'easy':
                bombs = 10;
                break;
            case 'medium':
                bombs = 25;
                break;
            case 'hard':
                bombs = 50;
                break;
            case 'xhard':
                bombs = 75;
                break;
            case 'insane':
                bombs = 195;
                break;
            case 'dead':
                bombs = 196;
                break;
            default:
                bombs = 25;
                break;
        }

        const size = 14;
        this.board = this.createBoard(size);
        this.addBombToBoard(bombs);
        this.addPointersToBombs();
        const result = this.boardString;
        await message.reply(`Lets play Minesweeper!\n${result}`);
    }

    get boardString() {
        const printable = new Array(this.board.length + 1);
        for (let i = 0; i < this.board.length; i++) {
            printable[i] = "";
            for (let j = 0; j < this.board[i].length; j++) {
                
                switch (this.board[i][j]) {
                    case -1:
                        printable[i] += "||:bomb:||";
                        break;
                    case 0:
                        printable[i] += "||:zero:||";
                        break;
                    case 1:
                        printable[i] += "||:one:||";
                        break;
                    case 2:
                        printable[i] += "||:two:||";
                        break;
                    case 3:
                        printable[i] += "||:three:||";
                        break;
                    case 4:
                        printable[i] += "||:four:||";
                        break;
                    case 5:
                        printable[i] += "||:five:||";
                        break;
                    case 6:
                        printable[i] += "||:six:||";
                        break;
                    case 7:
                        printable[i] += "||:seven:||";
                        break;
                    case 8:
                        printable[i] += "||:eight:||";
                        break;
                    case 9:
                        printable[i] += "||:nine:||";
                        break;
                }
            }
        }
        return printable.join('\n');
    }

    createBoard(size) {
        const board = new Array(size);
        for (let i = 0; i < board.length; i++) {
            board[i] = new Array(size);
        }
        return board;
    }

    addBombToBoard(bombs) {
        let i = 0;
        while (i < bombs) {
            let x = Math.floor(Math.random() * this.board.length);
            let y = Math.floor(Math.random() * this.board[0].length);
            if (this.board[x][y] != -1) {
                this.board[x][y] = -1;
                i++;
            }
        }
    }

    addPointersToBombs() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let count = 0;
                //make sure it's not a bomb
                if (this.board[i][j] != -1) {
                    //count bombs in 3x3 grid around location
                    for (let k = -1; k <= 1; k++) {
                        for (let l = -1; l <= 1; l++) {
                            //make sure we're within the of bounds of board
                            if (i + k >= 0 && j + l >= 0 && i + k < this.board.length && j + l < this.board[i].length) {
                                if (this.board[i + k][j + l] == -1) {
                                    count++;
                                }
                            }
                        }
                    }
                    this.board[i][j] = count;
                }
            }
        }
    }
}