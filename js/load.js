(function(Phaser){
  'use strict';

  function loadState(){}

  loadState.prototype = {

    preload: function(){
      var loadingLabel = this.game.add.text(this.game.world.centerX, 150, 'loading...',
        {font: '25px Arcade', fill: '#fff'});
      loadingLabel.anchor.setTo(0.5, 0.5);

      var progressBar = this.game.add.sprite(this.game.world.centerX, 200, 'progressBar');
      progressBar.anchor.setTo(0.5, 0.5);

      this.game.load.setPreloadSprite(progressBar);

      this.game.load.spritesheet('player', 'assets/images/player.png', 20, 20);
      this.game.load.spritesheet('enemy', 'assets/images/enemy.png', 20, 20);
      this.game.load.spritesheet('mute', 'assets/images/muteButton.png', 28, 22);

      this.game.load.image('coin', 'assets/images/coin.png');
      this.game.load.image('pixel', 'assets/images/pixel.png');
      this.game.load.image('live', 'assets/images/live.png');

      this.game.load.image('cloud1', 'assets/images/cloud1.png');
      this.game.load.image('cloud2', 'assets/images/cloud2.png');
      this.game.load.image('cloud3', 'assets/images/cloud3.png');

      this.game.load.image('jumpButton', 'assets/images/jumpButton.png');
      this.game.load.image('rightButton', 'assets/images/rightButton.png');
      this.game.load.image('leftButton', 'assets/images/leftButton.png');

      this.game.load.image('tileset', 'assets/images/tileset.png');
      this.game.load.image('tileset_intro', 'assets/images/tileset_intro.png');
      this.game.load.tilemap('map', 'assets/images/map.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('intro_map', 'assets/images/intro_map.json', null, Phaser.Tilemap.TILED_JSON);

      this.game.load.audio('jump', ['assets/sounds/jump.ogg', 'assets/sounds/jump.mp3']);
      this.game.load.audio('coin', ['assets/sounds/coin.ogg', 'assets/sounds/coin.mp3']);
      this.game.load.audio('dead', ['assets/sounds/dead.ogg', 'assets/sounds/dead.mp3']);
      this.game.load.audio('intro', ['assets/sounds/intro.ogg', 'assets/sounds/intro.mp3']);
      this.game.load.audio('enemyKill', ['assets/sounds/kill_the_enemy.ogg', 'assets/sounds/kill_the_enemy.mp3']);
    },

    create: function(){
      this.game.state.start('menu');
    }

  };

  window['super-coin-box'] = window['super-coin-box'] || {};
  window['super-coin-box'].loadState = loadState;

})(Phaser);
