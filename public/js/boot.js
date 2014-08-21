(function(Phaser){
  'use strict';

  function bootState(){}

  bootState.prototype = {

    preload: function(){
      this.game.load.image('progressBar', 'assets/images/progressBar.png');
    },

    create: function(){
      this.game.stage.backgroundColor = '#3498db';
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      if(!this.game.device.desktop){
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.game.scale.minWidth = 250;
        this.game.scale.minHeight = 170;
        this.game.scale.maxWidth = 1000;
        this.game.scale.maxHeight = 680;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.setScreenSize(true);
      }

      this.game.state.start('load');
    }

  };

  window['super-coin-box'] = window['super-coin-box'] || {};
  window['super-coin-box'].bootState = bootState;

})(Phaser);
