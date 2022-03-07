const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];

var score = 0;
var boatAnim = [];
var boatSpriteData, boatSpriteSheet;
var boatBreakAnim =  [];
var boatBreakSpriteData, boatBreakSpriteSheet;
var splash = [];
var splashSpriteData, splashSpriteSheet;
var isGameOver = false;
var backgroundMusic, waterSound, pirateLaugh, cannonExplosion;
var score = 0;
var isLaughing = false;


function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpriteData = loadJSON("./assets/boat/boat.json");
  boatSpriteSheet = loadImage("./assets/boat/boat.png");
  boatBreakSpriteData = loadJSON("./assets/boat/brokenBoat.json");
  boatBreakSpriteSheet = loadImage("./assets/boat/brokenBoat.png");
  splashSpriteData = loadJSON("./assets/waterSplash/waterSplash.json");
  splashSpriteSheet = loadImage("./assets/waterSplash/waterSplash.png");

  backgroundMusic = loadSound("./assets/background_music.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  pirateLaugh = loadSound("./assets/pirate_laugh.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES)
  angle = 15


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);
  var boatFrames = boatSpriteData.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnim.push(img);
  }
  var boatBreakFrames = boatBreakSpriteData.frames;
  for (var i = 0; i < boatBreakFrames.length; i++) {
    var pos = boatBreakFrames[i].position;
    var img = boatBreakSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatBreakAnim.push(img);
  }
  var splashFrames = splashSpriteData.frames;
  for (var i = 0; i < splashFrames.length; i++) {
    var pos = splashFrames[i].position;
    var img = splashSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    splash.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  
  fill("brown");
  textSize(40);
  text("SCORE: " + score, width-230, 30);

  Engine.update(engine);
  backgroundMusic.play();
  backgroundMusic.setVolume(0.01);
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();


}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        boats[i].remove(i);
        score += 2;
        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      ball.remove(index);
      waterSound.play();
      waterSound.setVolume(0.01);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(width, height - 100, 170, 170, position, boatAnim);

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(tower, boats[i].body);
        if (collision.collided && !boats[i].isBroken) {
          isGameOver = true;
          gameOver();
            pirateLaugh.play();
            pirateLaugh.setVolume(0.1);
            backgroundMusic.stop();
        }
      } else {
        boats[i];
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnim);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    cannonExplosion.play();
    cannonExplosion.setVolume(0.1);
  }
}

function gameOver() {
  swal({
    title: "GAME OVER, MIHARTY!",
    text: "THANKS FOR PLAYING",
    imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize: "150x150",
    confirmButtonText: "PLAY AGAIN"
  },
  function(isConfirm) {
    if (isConfirm) {
      location.reload();
    }
  }
  );
}
