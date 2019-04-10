module.exports = class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        if (suit == 'D' || suit == 'H') {
            this.red = true;
        }
        this.name = value + "" + suit;
    }

    get value() {
        return this._value;
    }

    get suit() {
        return this._suit;
    }

    get red() {
        return this._red;
    }

    get name() {
        return this._name;
    }

    set value(value) {
        if (value < 1 && value > 13) {
            console.log("Invalid card. " + value);
            return;
        }
        this._value = value;
    }

    set suit(suit) {
        if (suit != 'S' && suit != 'H' && suit != 'D' && suit != 'C') {
            console.log("Invalid suit. " + suit);
            return;
        }
        this._suit = suit;
    }

    set red(red) {
        if (red) {
            this._red = red;
        } else {
            this._red = false;
        }
    }

    set name(string) {
        this._name = string;
    }

    static toString() {
        return this._value + "" + this._suit + ", Red? " + this._red;
    }
}
