(function(Phaser){
  'use strict';

  function menuState(){}

  menuState.prototype = {

    create: function(){
      this.game.add.image(0, 0, 'background');
      //this.game.stage.backgroundColor = '#3498db';

      this.initMuteButton();
      this.initTitle();
      this.initScore();
      this.playMusic();
      this.createMoovie();

      var upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
      upKey.onDown.addOnce(this.start, this);

      if(!this.game.device.desktop){
        this.game.input.onDown.addOnce(this.start, this); //for mobile devices
      }
    },

    update: function(){
      this.game.physics.arcade.collide(this.introPlayer, this.introLayer);
      this.playMoovie();
    },

    start: function(){
      this.stopMusic();
      this.game.state.start('game');
    },

    initMuteButton: function(){
      this.muteButton = this.game.add.button(20, 20, 'mute', this.toggleSound, this);
      this.muteButton.input.useHandCursor = true;

      var muteKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
      muteKey.onDown.add(this.toggleSound, this);

      if(this.game.sound.mute){
        this.muteButton.frame = 1;
      }
    },

    toggleSound: function(){
      this.game.sound.mute = !this.game.sound.mute;
      this.muteButton.frame = this.game.sound.mute ? 1 : 0;
    },

    initTitle: function(){
      var nameLabel = this.game.add.text(this.game.world.centerX, -50,
        'Super Coin Box',
        {font: '60px Arcade', fill: '#fff'});
      nameLabel.anchor.setTo(0.5, 0.5);

      //game title animation
      var nameLabelTween = this.game.add.tween(nameLabel);
      nameLabelTween
      .to({y: 80}, 1000)
      .easing(Phaser.Easing.Bounce.Out)
      .start();

      //mute hint
      var muteLabel = this.game.add.text(150, this.game.world.height - 10,
        'press M button or click on the volume icon to toggle sound',
        { font: '11px Arial', fill: '#fff' });
      muteLabel.anchor.setTo(0.5, 0.5);
    },

    initScore: function(){
      this.initBestScore();
      var startText;
      if(this.game.device.desktop){
        startText = 'press the up arrow key to start';
      }
      else{
        startText = 'touch the screen to start';
      }

      var scoreLabel= this.game.add.text(this.game.world.centerX, this.game.world.centerY,
        'score: ' + this.game.global.score +
        '\nbest score: ' + this.bestScoreValue,
        { font: '25px Arcade', fill: '#fff', align: 'center' });
      scoreLabel.anchor.setTo(0.5, 0.5);

      var startLabel= this.game.add.text(this.game.world.centerX, this.game.world.height - 110,
        startText,
        { font: '25px Arcade', fill: '#fff' });
      startLabel.anchor.setTo(0.5, 0.5);
      startLabel.alpha = 0;

      this.game.add.tween(startLabel).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    },

    initBestScore: function(){
      var storagePrefix = 'phaserGame::';
      var bestScore = storagePrefix + 'bestScore';
      this.bestScoreValue = localStorage.getItem(bestScore);

      if(!this.bestScoreValue){
        localStorage.setItem(bestScore, 0);
        this.bestScoreValue = 0;
      }

      if(this.game.global.score > this.bestScoreValue){
        localStorage.setItem(bestScore, this.game.global.score);
        this.bestScoreValue = this.game.global.score;
      }
    },

    playMusic: function(){
      this.introMusic = this.game.add.audio('intro', 1, true);
      this.introMusic.volume = 0.5;
      this.introMusic.loop = true;
      this.introMusic.play();
    },

    stopMusic: function(){
      if(this.introMusic){
        this.introMusic.stop();
      }
    },

    createMoovie: function(){
      /* Player */
      this.introPlayer = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player');
      this.game.physics.arcade.enable(this.introPlayer);

      this.introPlayer.alpha = 1;
      this.introPlayer.anchor.setTo(0.5, 1);
      this.introPlayer.body.gravity.y = 500;
      this.introPlayer.body.velocity.x = 100 * Phaser.Math.randomSign();
      this.introPlayer.body.bounce.x = 1;
      this.introPlayer.checkWorldBounds = true;
      this.introPlayer.outOfBoundsKill = true;

      this.introPlayer.animations.add('right', [1, 2], 8, true);
      this.introPlayer.animations.add('left', [3, 4], 8, true);

      /* World */
      this.introMap = this.game.add.tilemap('intro_map');
      this.introMap.addTilesetImage('tileset_intro');
      this.introLayer = this.introMap.createLayer('main');
      this.introLayer.resizeWorld();
      this.introMap.setCollision([1,2]);
    },

    playMoovie: function(){
      if(this.introPlayer.body.velocity.x > 0){
        this.introPlayer.animations.play('right');
      }
      else if(this.introPlayer.body.velocity.x < 0){
        this.introPlayer.animations.play('left');
      }
      else{
        this.introPlayer.animations.stop();
        this.introPlayer.frame = 0;
      }
    }

  };

  window['super-coin-box'] = window['super-coin-box'] || {};
  window['super-coin-box'].menuState = menuState;

})(Phaser);
