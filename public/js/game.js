(function(Phaser){
  'use strict';

  function gameState(){}

  gameState.prototype = {

    create: function(){
      this.createBackground();
      this.addGlobalVars(); //some global vars init
      this.initSounds();
      this.addControls(); //create move actions
      this.createWorld();
      this.createPlayer();
      this.createEnemies();
      this.createCoin();
      this.createExplosion();
      this.displayScore();
      this.displayLives();
      this.initMobileControls(); //display virtual keyboard for mobile devices
    },

    update: function(){
      this.game.physics.arcade.collide(this.player, this.layer);
      this.game.physics.arcade.collide(this.enemies, this.layer, this.enemyVsLayer, null, this);
      this.game.physics.arcade.collide(this.player, this.enemies, this.playerVsEnemy, null, this);
      this.game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
      this.movePlayer();
      this.resetCloudsPosition();

      if(!this.player.inWorld){
        this.playerDie();
      }

      if(this.nextEnemy < this.game.time.now){
        var start = 4000; //easiest dificulty (add enemies every 4 seconds)
        var end = 1000; //hardest dificulty (add enemies every 1 second)
        var score = 100; //hardest dificulty when the player has 100+ pts score
        var delay = Math.max(start - (start - end) * this.game.global.score / score, end); //formula for linear increas dificulty

        this.addEnemy();
        this.nextEnemy = this.game.time.now + delay;
      }
    },

    createPlayer: function(){
      this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player');
      this.game.physics.arcade.enable(this.player);
      this.player.anchor.setTo(0.5, 0.5);
      this.player.body.gravity.y = 500;

      this.player.animations.add('right', [1, 2], 8, true);
      this.player.animations.add('left', [3, 4], 8, true);
    },

    movePlayer: function() {
      if (this.cursor.left.isDown || this.altKeys.left.isDown || this.moveLeft) {
        this.player.body.velocity.x = -200;
        this.player.animations.play('left');
      }
      else if (this.cursor.right.isDown || this.altKeys.right.isDown || this.moveRight) {
        this.player.body.velocity.x = 200;
        this.player.animations.play('right');
      }
      else {
        this.player.body.velocity.x = 0;
        this.player.animations.stop();
        this.player.frame = 0;
      }

      if (this.cursor.up.isDown || this.altKeys.up.isDown) {
        this.jumpPlayer();
      }
    },

    jumpPlayer: function(){
      if(this.player.body.onFloor()){
        this.player.body.velocity.y = -300;
        this.jumpSound.play();
      }
    },

    playerVsEnemy: function(player, enemy){
      if(player.body.touching.down && enemy.body.touching.up){
        this.enemyDie(enemy);
      }
      else{
        this.playerDie(enemy);
      }
    },

    enemyDie: function(enemy){
      var tweenEnemy = this.game.add.tween(enemy);
      tweenEnemy.to({alpha: 0}, 400, Phaser.Easing.Linear.None, true);
      this.time.events.add(300, function(){
        enemy.kill();
        tweenEnemy.stop();
        this.addEnemy();
      }, this);

      this.player.body.velocity.y = -100;
      this.enemyKillSound.play();
      this.game.global.score += 2;
      this.updateScoreText();
    },

    playerDie: function(enemy){
      if(!this.player.alive){
        return;
      }
      if(typeof enemy !== 'undefined'){
        this.enemyStop(enemy);
      }
      this.player.kill(); //dissapears the player from the world
      this.playerLives -= 1;
      this.deadSound.play();
      this.jumpSound.stop();
      this.startExplosion();

      this.time.events.add(1000, function(){
        if(this.playerLives < 1){
          this.game.state.start('menu'); //delayed return to main menu (we need to see explosion!)
        }
        else{
          this.player.reset(this.game.world.centerX, this.game.world.centerY);
          this.updateLives();

          this.enemies.destroy();
          this.createEnemies();

          this.coin.kill();
          this.createCoin();
        }
      }, this);
    },

    createWorld: function(){
      this.map = this.game.add.tilemap('map');
      this.map.addTilesetImage('tileset');
      this.layer = this.map.createLayer('main');
      this.layer.resizeWorld();
      this.map.setCollision([1,2]);
    },

    createCoin: function(){
      var randomPos = this.getCoinRandomPosition();
      this.coin = this.game.add.sprite(randomPos.x, randomPos.y, 'coin');
      this.game.physics.arcade.enable(this.coin);
      this.coin.anchor.setTo(0.5, 0.5);
    },

    takeCoin: function(){
      this.game.global.score += 5;
      this.updateScoreText();
      this.updateCoinPosition();
      this.coinSound.play();

      /* Animations */
      //scale up/down the player when he got the coin
      this.game.add.tween(this.player.scale)
      .to({x:1.3, y:1.3}, 50)
      .to({x:1, y:1}, 150)
      .start();
    },

    getPossibleCoinCoordinates: function(){
      return [
        {x: 140, y: 70}, {x: 250, y: 30}, {x: 360, y: 70}, //top row
        {x: 60, y: 150}, {x: 250, y: 130}, {x: 440, y: 150}, //middle row
        {x: 110, y: 230}, {x: 380, y: 230}, //middle2 row
        {x: 90, y: 310}, {x: 250, y: 270}, {x: 350, y: 310}, //bottom row
      ];
    },

    getCoinRandomPosition: function(){
      if(!this.coinPos.length){
        this.coinPos = this.getPossibleCoinCoordinates();
      }
      return this.coinPos[this.game.rnd.integerInRange(0, this.coinPos.length - 1)];
    },

    updateCoinPosition: function(){
      if(!this.coinPos.length){
        this.coinPos = this.getPossibleCoinCoordinates();
      }

      for (var i = 0; i < this.coinPos.length; i++){
        if(this.coinPos[i].x === this.coin.x){
          this.coinPos.splice(i, 1);
        }
      }

      var newPos = this.getCoinRandomPosition();
      this.coin.reset(newPos.x, newPos.y);
      /* Animations */
      //smoothly appears the coin on new pos
      this.coin.scale.setTo(0, 0);
      this.game.add.tween(this.coin.scale)
      .to({x: 1, y: 1}, 300).
      start();
    },

    createEnemies: function(){
      this.enemies = this.game.add.group();
      this.enemies.enableBody = true;
      this.enemies.createMultiple(10, 'enemy');
    },

    addEnemy: function(){
      var enemy = this.enemies.getFirstDead();
      if(!enemy){
        return;
      }

      enemy.alpha = 1;
      enemy.anchor.setTo(0.5, 1);
      enemy.reset(this.game.world.centerX, 0);
      enemy.body.gravity.y = 500;
      enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
      enemy.body.bounce.x = 1;
      enemy.checkWorldBounds = true;
      enemy.outOfBoundsKill = true;

      enemy.animations.add('right', [1, 2], 8, true);
      enemy.animations.add('left', [3, 4], 8, true);

      if(enemy.body.velocity.x > 0){
        enemy.animations.play('left');
      }
      else if(enemy.body.velocity.x < 0){
        enemy.animations.play('right');
      }
      else{
        enemy.animations.stop();
        enemy.frame = 0;
      }
    },

    enemyVsLayer: function(enemy, layer){
      if(enemy.body.velocity.x > 0){
        enemy.animations.play('right');
      }else{
        enemy.animations.play('left');
      }
    },

    enemyStop: function(enemy){
      enemy.body.velocity.x = 0; //stop enemy
      enemy.animations.paused = true;
      enemy.frame = 0;
    },

    createExplosion: function(){
      /* Explode the player when he hits the enemy */
      this.emitter = this.game.add.emitter(0, 0, 15);
      this.emitter.makeParticles('pixel');
      this.emitter.setYSpeed(-150, 150);
      this.emitter.setXSpeed(-150, 150);
      this.emitter.gravity = 0;
    },

    startExplosion: function(){
      this.emitter.x = this.player.x;
      this.emitter.y = this.player.y;
      this.emitter.start(true, 600, null, 15);
    },

    displayScore: function(){
      this.scoreLabel = this.game.add.text(30, 30, 'score: 0', { font: '21px Arcade', fill: '#ffffff' });
      // Initialise the score variable
      this.game.global.score = 0;
    },

    updateScoreText: function(){
      this.scoreLabel.text = 'score: ' + this.game.global.score;
    },

    displayLives: function(){
      this.lives = this.game.add.group();
      for (var i = 0; i < this.maxPlayerLives; i++) {
        this.lives.create(420 + 17 * i, 30, 'live');
      }
    },

    updateLives: function(){
      //remove lives
      this.lives.remove(this.lives.children[this.playerLives]);
    },

    initSounds: function(){
      this.jumpSound = this.game.add.audio('jump');
      this.coinSound = this.game.add.audio('coin');
      this.deadSound = this.game.add.audio('dead');
      this.enemyKillSound = this.game.add.audio('enemyKill');
      this.jumpSound.volume = 0.1;
      this.coinSound.volume = 0.2;
      this.deadSound.volume = 0.3;
      this.enemyKillSound.volume = 1;
    },

    addControls: function(){
      this.cursor = this.game.input.keyboard.createCursorKeys();
      //prevent to move the game frame by pushing control buttons
      this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.SPACEBAR,
      ]);

      this.altKeys = {
        up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
      };
    },

    addMobileControls: function(){
      this.moveLeft = false;
      this.moveRight = false;

      this.jumpButton = this.game.add.sprite(420, 260, 'jumpButton');
      this.jumpButton.inputEnabled = true;

      this.jumpButton.events.onInputDown.add(this.jumpPlayer, this);

      this.jumpButton.alpha = 0.5;



      this.leftButton = this.game.add.sprite(-20, 260, 'leftButton');
      this.leftButton.inputEnabled = true;

      this.leftButton.events.onInputOver.add(function(){this.moveLeft = true;}, this);
      this.leftButton.events.onInputOut.add(function(){this.moveLeft = false;}, this);
      this.leftButton.events.onInputDown.add(function(){this.moveLeft = true;}, this);
      this.leftButton.events.onInputUp.add(function(){this.moveLeft = false;}, this);

      this.leftButton.alpha = 0.5;



      this.rightButton = this.game.add.sprite(50, 260, 'rightButton');
      this.rightButton.inputEnabled = true;

      this.rightButton.events.onInputOver.add(function(){this.moveRight = true;}, this);
      this.rightButton.events.onInputOut.add(function(){this.moveRight = false;}, this);
      this.rightButton.events.onInputDown.add(function(){this.moveRight = true;}, this);
      this.rightButton.events.onInputUp.add(function(){this.moveRight = false;}, this);

      this.rightButton.alpha = 0.5;
    },

    initMobileControls: function(){
      if(!this.game.device.desktop){
        this.addMobileControls();
      }
    },

    addGlobalVars: function(){
      this.game.global.score = 0;
      this.nextEnemy = 0;
      this.playerLives = 3;
      this.maxPlayerLives = 3;
      this.coinPos = [];
    },

    createBackground: function(){
      //this.game.stage.backgroundColor = '#3498db';
      var bitmap = this.game.add.bitmapData(500, 340);
      var gradient = bitmap.context.createLinearGradient(0, 0, 0, 340);
      gradient.addColorStop(0, '#3498db');
      gradient.addColorStop(0.7, '#5eaadd');
      gradient.addColorStop(1, '#87bbdd');
      bitmap.context.fillStyle = gradient;
      bitmap.context.fillRect(0, 0, 500, 340);
      this.game.add.sprite(0, 0, bitmap);

      this.clouds = [
        this.game.add.sprite(this.game.world.centerX - 200, this.game.world.centerY - 130, 'cloud1'),
        this.game.add.sprite(this.game.world.centerX + 70, this.game.world.centerY - 140, 'cloud2'),
        this.game.add.sprite(this.game.world.centerX - 70, this.game.world.centerY - 100, 'cloud3'),
      ];
      var cloudsCnt = this.clouds.length;

      for(var i = 0; i < cloudsCnt; i++){
        this.clouds[i].alpha = 0.4;
        this.game.physics.arcade.enable(this.clouds[i]);
        this.clouds[i].body.velocity.x = 50 + ((i % 2) ? i*2: i*3);
      }
    },

    resetCloudsPosition: function(){
      var cloudsCnt = this.clouds.length;
      for(var i = 0; i < cloudsCnt; i++){
        if(!this.clouds[i].inWorld){
          this.clouds[i].x = -20;
          this.clouds[i].body.velocity.x = 50 + ((i % 2) ? i*2: i*3);
        }
      }
    }
  };

  window['super-coin-box'] = window['super-coin-box'] || {};
  window['super-coin-box'].gameState = gameState;

})(Phaser);
