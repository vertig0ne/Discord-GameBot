const Card = require('./Card.js');
module.exports = class Deck {
  constructor(numDecks) {
    if(!Number.isInteger(numDecks)){
      numDecks = 1;
    }
    this.deck = new Array(numDecks*52);
    this.index = 0;
    for(let i = 0; i < numDecks; i++) {
      for (let j = 0; j < 4; j++) {
        let suit = 'X';
        switch(j) {
          case 0:
            suit = 'S';
            break;
          case 1:
            suit = 'H';
            break;
          case 2:
            suit = 'D';
            break;
          case 3:
            suit = 'C';
            break;
        }
        for (let k = 1; k <= 13; k++) {
          let card = new Card(k, suit);
          this.deck.push(card);
        }
      }
    }
  }

  shuffle() {
    for(let i = this.deck.length-1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  getCard() {
    let tempCard = this.deck[this.index];
    this.index++;
    return tempCard;
  }

  printDeck() {
    let print = "";
    for(let i = 0; i < this.deck.length; i++) {
      print += this.deck[i].name + " ";
    }
    return print;
  }

  get deck() {
    return this._deck;
  }

  get index() {
    return this._index;
  }

  set deck(length) {
    this._deck = new Array();
  }

  set index(value) {
    this._index = value;
  }
}
