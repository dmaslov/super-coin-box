window.onload = function () {
  'use strict';

  var states = window['super-coin-box'],
    game = new Phaser.Game(500, 340, Phaser.AUTO, 'game');

  game.global = {
    score: 0,
    levelScore: 0,
    playerLives: 3,
    currentLevel: 1
  };

  game.state.add('boot', states.bootState);
  game.state.add('load', states.loadState);
  game.state.add('menu', states.menuState);
  game.state.add('game', states.gameState);

  game.state.start('boot');
};
