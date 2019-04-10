const Discord = require('discord.js');
const Deck = require('../model/Deck');
const command = require('./base');

module.exports = class blackjackCommand extends command {
    constructor(client) {
        const info = {
            "name": "blackjack",
            "type": "guild"
        }
        super(client, info);
    }

    async run(message, args) {
        // Setup deck
        this.deck = new Deck();
        this.deck.shuffle();

        // Spam Users
        await message.reply('Game of BlackJack Started. Type `join` to join in');

        // Listen for joins
        const filter = (response) => response.content == 'join';
        let joinMessages;
        try {
            const collector = await message.channel.awaitMessages(filter, { max: 4, time: 10 * 1000, errors: ['time'] });
            joinMessages = collector;
        } catch (collector) { joinMessages = collector; }

        if (joinMessages.size === 0) throw new Error('Noone joined the game');

        // process joins
        console.log(joinMessages.size);
        const players = [];

        joinMessages.forEach(async (m) => {
            players.push(m.author);
            await message.reply(`Adding ${m.author}`);
        });

        this.startGame({ message, players });

        // if (players.length < 4) {
        //     // Add computer players until 4;
        //     while (players.length < 4) {
        //         await message.reply('Adding AI Player');
        //         players.push('AI Player');
        //     }
        // }


    }

    async startGame({ message, players }) {
        // Create Hands for Players
        let hands = new Array(players.length + 1);
        for (let i = 0; i < hands.length; i++) {
            hands[i] = new Array();
        }

        // Deal initial cards
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < hands.length; j++) {
                hands[j].push(this.deck.getCard());
            }
        }

        console.log(hands);

        for (let i = 0; i < hands.length - 1; i++) {
            let endTurn = false;
            while (!endTurn) {
                const player = players[i];
                let cards = '';
                for (let j = 0; j < hands[i].length; j++) {
                    cards += `${hands[i][j].name} `;
                }
                await message.reply(`${player} You're up! Your hand is currently \`\`${cards}\`\`, \`hit\` or \`stay\`?`);

                const filter = (x) => (x.content == 'hit' || x.content == 'stay') && x.author.id === player.id;
                let cmdMessages;
                try {
                    const collector = await message.channel.awaitMessages(filter, { max: 1, time: 10 * 1000, errors: ['time'] });
                    cmdMessages = collector;
                } catch (collector) { cmdMessages = collector; }

                if (cmdMessages.size == 0) {
                    endTurn = true;
                    await message.reply('Timed out. Final hand: `' + cards + '` Value: ' + this.calcValue(hands[i]));
                } else {
                    const cmd = cmdMessages.values().next().value;
                    switch (cmd.content) {
                        case 'hit':
                            hands[i].push(this.deck.getCard());
                            cards += hands[i][hands[i].length - 1].name;
                            await message.reply('Player Hits.');
                            if (this.calcValue(hands[i]) > 21) {
                                endTurn = true;
                                await message.reply('Final hand: `' + cards + '` Value: ' + this.calcValue(hands[i]));
                            }
                            break;

                        case 'stay':
                            endTurn = true;
                            await message.reply('Final hand: `' + cards + '` Value: ' + this.calcValue(hands[i]));
                            break;
                        default:
                            throw new RangeError('Must be `hit` or `stay`');
                    }
                }
            }
        }

        const d = this.dealer(hands[hands.length - 1]);
        await message.reply(d);

        for (let i = 0; i < hands.length - 1; i++) {
            const a = this.compareHands(hands[i], hands[hands.length - 1]);
            await message.reply(`${players[i]}, ${a}`);
        }
    }

    calcValue(hand) {
        let hasAce = false;
        let value = 0;
        let secondLoop = false;
        for (let i = 0; i < hand.length; i++) {
            if (hand[i].value == '1' && hasAce == false) {
                value += 11;
                hasAce = true;
            } else if (hand[i].value == '1' && hasAce == true) {
                // can only have 1 Ace with value 11, or loop second time through because busted with Ace = 11
                value += 1;
            } else if (hand[i].value == '11' || hand[i].value == '12' || hand[i].value == '13') {
                // Face cards, add 10
                value += 10;
            } else {
                value += hand[i].value;
            }
            if (value > 21 && hasAce == true && secondLoop == false) {
                // busted, loop again but only count Aces as 1
                i = 0;
                value = 0;
                secondLoop = true;
            }
        }
        return value;
    }

    dealer(hand) {
        let finalString = '';
        let value = this.calcValue(hand);
        let str1 = "";
        for (let i = 0; i < hand.length; i++) {
            str1 += hand[i].name + " ";
        }
        while (value < 17) {
            hand.push(this.deck.getCard());
            str1 += hand[hand.length - 1].name + " ";
            finalString += `Dealer hits. Hand: \`${str1}\`\n`;
            value = this.calcValue(hand);
        }
        let str = "";
        for (let i = 0; i < hand.length; i++) {
            str += hand[i].name + " ";
        }
        finalString += `Dealer stays. Final hand: \`${str1}\` Value: ${value}\n`;
        if (value > 21) {
            finalString += `Dealer busts.\n`;
        }
        return finalString;
    }

    compareHands(playerHand, dealerHand) {
        if (this.calcValue(playerHand) > 21) {
            return 'Player busted';
        } else if (this.calcValue(dealerHand) > 21) {
            return 'Dealer busted. Player wins.';
        } else if (this.calcValue(playerHand) == 21 && this.calcValue(dealerHand) == 21 && playerHand.length == 2 && dealerHand.length == 2) {
            return 'Both Blackjack. Push.';
        } else if (this.calcValue(dealerHand) == 21 && dealerHand.length == 2) {
            return 'Dealer Blackjack. Dealer wins.';
        } else if (this.calcValue(playerHand) == 21 && playerHand.length == 2) {
            return 'Player Blackjack. Player wins.';
        } else if (this.calcValue(playerHand) == this.calcValue(dealerHand)) {
            return 'Tie. Push.';
        } else if (this.calcValue(playerHand) > this.calcValue(dealerHand)) {
            return 'Player hand higher. Player wins.';
        } else {
            return 'Dealer Hand higher. Dealer wins.';
        }
    }
}
