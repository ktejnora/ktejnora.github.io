var MAIN = 'main';
var HISCORE = 'hiscore';

var mainState = {
  preload: function()
  {
    // Load images and sounds
    game.load.image('bird', 'assets/bird.png');
    game.load.image('pipe', 'assets/pipe.png');
    game.load.audio('jump', 'assets/jump.wav');
  },

  create: function()
  {
    // mobile frendly
    if (game.device.desktop == false) {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      game.scale.setMinMax(game.width/2, game.height/2, game.width, game.height);
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
    }

    game.stage.backgroundColor = '#71c5cf';

    // Physic system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.bird = game.add.sprite(100, 245, 'bird');
    game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;

    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);
    game.input.onDown.add(this.jump, this);

    this.pipes = game.add.group();
    this.timer = game.time.events.loop(Phaser.Timer.SECOND * 1.5,  this.addRowOfPipes, this);
    if( localStorage )
    {
        var hi = localStorage.getItem(HISCORE);
        if( hi )
          this.hiScore = hi;
        else
          this.hiScore = 0;
    }
    else
      this.hiScore = 0;
    this.score = 0;
    this.labelScore = game.add.text(20, 20, "Score: 0\nHi: "+this.hiScore,
        { font: "30px Arial", fill: "#ffffff" });
    this.bird.anchor.setTo(-0.2, 0.5);
    this.jumpSound = game.add.audio('jump');
  },

  update: function()
  {
    // 60s per second, 60 fps
    // Main game logic
    if( this.bird.y < 0 || this.bird.y > 490 )
      this.restartGame();

    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

    if (this.bird.angle < 20)
      this.bird.angle += 1;
  },

  jump: function()
  {
    if( this.bird.alive == false )
      return; // do not jump
    var animation = game.add.tween(this.bird);
    animation.to({angle: -20}, 100);
    animation.start();
    this.bird.body.velocity.y = -350;
    this.jumpSound.play();
  },

  restartGame: function()
  {
    game.state.start(MAIN);
  },

  addOnePipe: function( x, y )
  {
      var pipe = game.add.sprite(x,y,'pipe');
      this.pipes.add(pipe);
      game.physics.arcade.enable(pipe);
      pipe.body.velocity.x = -200;
      pipe.checkWorldBounds = true;
      pipe.outOfBondsKill = true;
  },

  addRowOfPipes: function()
  {
    this.score += 1;
    var hiLabel;
    if( this.score > this.hiScore )
      hiLabel = 'New record';
    else
      hiLabel = this.hiScore;
    this.labelScore.text = "Score: " + this.score + "\nHi: "+hiLabel;

    var hole = Math.floor(Math.random() * 5 ) + 1;
    for( var i = 0; i<8; i++)
      if( i != hole && i != hole + 1 )
        this.addOnePipe(400, i * 60 + 10);
  },

  hitPipe: function()
  {
    if( this.bird.alive == false )
      return;
    this.bird.alive = false;
    if( this.score > this.hiScore && localStorage)
    {
      localStorage.setItem(HISCORE, this.score);
    }
    game.time.events.remove(this.timer);

    this.pipes.forEach( function(p)
    {
      p.body.velocity.x = 0;
    }, this);
  }
};

var game = new Phaser.Game(400, 490);

// Add the 'mastState' and call it main
game.state.add(MAIN, mainState);

// Start the state to actually start the game
game.state.start(MAIN);
