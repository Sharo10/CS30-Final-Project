let x = 100;
let spacex = 120; 
let spacey = 120; 
let spaceCraft;
let bullets = [];
let enemies = [];
let score = 0;
let bg;
let enemyImages = [];
let enemyTypes = ["rock1", "rock2", "moon", "moon2", "purpleEnemy", "spaceShip"];
let highScore = localStorage.getItem('highScore') || 0;
let bulletImage; 
let gamePaused = false; 
let coinImage;
let coins = [];
let savedStateCoins;
let coinsCollected = 0;




function preload() {
  for (let i = 0; i < enemyTypes.length; i++) {
    let img = loadImage(enemyTypes[i] + ".png");
    enemyImages[i] = img;
  }
  spaceCraft = loadImage("Spacecraft.png");
  bulletImage = loadImage("bullet2.png"); // renamed to bulletImage
  coinImage = loadImage("coin1.png");
}

class Enemy {
  constructor(x, y, img, enemySize, enemyType) {  // Add a new parameter for enemy type
    this.x = x;
    this.y = y;
    this.img = img;
    this.enemySize = enemySize;
    this.type = enemyType;  // Store the enemy type
    this.width = enemySize;
    this.height = enemySize;
  }

  saveState() {
    return {
      x: this.x,
      y: this.y,
      enemySize: this.enemySize,
      img: this.img,
      type: this.type,
    };
  }

  draw() {
    image(this.img, this.x, this.y, this.enemySize, this.enemySize);
    this.y += 2;
  }

  isOffScreen() {
    return this.y > height;
  }

  collidesWith(bullet) {
    return dist(this.x, this.y, bullet.x, bullet.y) < this.enemySize;
}
  reset() {
    this.x = random(this.enemySize*2, width - this.enemySize*2);
    this.y = random(-1200, 0);
    this.img = random(enemyImages);
  }

  collidesWithSpacecraft(spacecraftX, spacecraftY, spacecraftWidth, spacecraftHeight) {
    let tipBoxHeight = spacecraftHeight / 4;  
    let tipBoxWidth = spacecraftWidth / 2;
    let tipBoxX = spacecraftX + spacecraftWidth / 4;
    let tipBoxY = spacecraftY;
  
    let wingBoxHeight = spacecraftHeight / 2;
    let wingBoxWidth = spacecraftWidth;
    let wingBoxX = spacecraftX;
    let wingBoxY = spacecraftY + tipBoxHeight;
  
    let collidesWithTip = tipBoxX < this.x + this.enemySize &&
      tipBoxX + tipBoxWidth > this.x &&
      tipBoxY < this.y + this.enemySize &&
      tipBoxY + tipBoxHeight > this.y;
  
    let collidesWithWings = wingBoxX < this.x + this.enemySize &&
      wingBoxX + wingBoxWidth > this.x &&
      wingBoxY < this.y + this.enemySize &&
      wingBoxY + wingBoxHeight > this.y;
  
    return collidesWithTip || collidesWithWings;
  }  
}



class Coin {
  constructor(x, y, img, coinSize) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.coinSize = coinSize;
    this.width = coinSize;
    this.height = coinSize;
  }

  saveState() {
    return {
      x: this.x,
      y: this.y,
      coinSize: this.coinSize,
      img: this.img
    };
  }

  draw() {
    image(this.img, this.x, this.y, this.coinSize, this.coinSize);
    this.y += 2;
  }

  isOffScreen() {
    return this.y > height;
  }

  collidesWith(bullet) {
    return dist(this.x, this.y, bullet.x, bullet.y) < this.coinSize;
  }
  
  reset() {
    this.x = random(this.coinSize*2, width - this.coinSize*2);
    this.y = random(-1200, 0);
  }

  collidesWithSpacecraft(spacecraftX, spacecraftY, spacecraftWidth, spacecraftHeight) {
    return (
      this.x < spacecraftX + spacecraftWidth &&
      this.x + this.coinSize > spacecraftX &&
      this.y < spacecraftY + spacecraftHeight &&
      this.y + this.coinSize > spacecraftY
    );
  }
}


function setup() {
  bg = loadImage("space shooter background.png");
  createCanvas(1500, 1000);
  spaceCraft.resize(spacex, spacey); 
  x = width/2 - spacex/2;
  noCursor();

  for (let i = 0; i < 10; i++) {
    let enemySize = map(width, 500, 2000, 20, 50); 
    let enemyType = random(enemyTypes);
    let enemy = new Enemy(random(60, width -60), random(-1200, 0), loadImage(enemyType + ".png"), 70, enemyType);
    enemies.push(enemy);
  }
  for (let i = 0; i < 7; i++) {
    let coinSize = 80
    let coin = new Coin(random(60, width -60), random(-1200, 0), coinImage, coinSize);
    coins.push(coin);
  }
}

let savedStateEnemies, savedStateBullets;

function toggleGamePlay() {
  gamePaused = !gamePaused;
  if (gamePaused) {
    noLoop();
    savedStateEnemies = enemies.map(enemy => enemy.saveState());
    savedStateBullets = bullets.map(bullet => bullet.saveState());
    savedStateCoins = coins.map(coin => coin.saveState());
  } else {
    loop();
    for (let i = 0; i < enemies.length; i++) {
      Object.assign(enemies[i], savedStateEnemies[i]);
    }
    for (let i = 0; i < bullets.length; i++) {
      Object.assign(bullets[i], savedStateBullets[i]);
    }
    for (let i = 0; i < coins.length; i++) {
      Object.assign(coins[i], savedStateCoins[i]);
    }
  }
}



function draw() {
  textSize(28);
  textStyle(BOLD);
  stroke(100);
  background(bg);
  fill(0);
  rectMode(CENTER);
  moveCraft();
  stroke(226, 204, 0);
  image(spaceCraft, x, height - 155);

  if(gamePaused){
    return;
    
  }

  for (let bullet of bullets) {
    bullet.y -= 10;
    image(bulletImage, bullet.x, bullet.y, 10) // renamed to bulletImage
    if (bullet.y < 0) {
      bullets.splice(bullets.indexOf(bullet), 1);
    }
  }

  for (let coin of coins) {
    coin.draw();
    if (coin.isOffScreen()) {
      coin.reset();
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].draw();
    if (enemies[i].isOffScreen()) {
      enemies[i].reset();
    }
  }

  // Bullet collisions with coins
  for (let i = coins.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (coins[i].collidesWith(bullets[j])) {
        coins[i].reset();
        bullets.splice(j, 1);
        coinsCollected++;
      }
    }
  }


  // Coins collision with spacecraft
  for (let i = coins.length - 1; i >= 0; i--) {
    if (coins[i].collidesWithSpacecraft(x, height - spacey, spacex, spacey)) {
      coins[i].reset();
      coinsCollected++;
    }
  }


  for (let enemy of enemies) {
    if (enemy.collidesWithSpacecraft(x, height - spacey, spacex, spacey)) {
      fill(225);
      text("Game Over!", width/2 - 53, 60);
      text("Your score was" + " " + score, width/2 - 94, 100);
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      text("The highest score is: " + highScore, width/2 - 94, 140);
      score = " ";
      noLoop();
    }
  }
  
  // Drawing the coin counter
  image(coinImage, width - 103, 9, 60, 60);
  fill(225);
  text(coinsCollected, width - 50, 48);


  // Bullet collisions with enemies
for (let i = enemies.length - 1; i >= 0; i--) {
  for (let j = bullets.length - 1; j >= 0; j--) {
    if (enemies[i].collidesWith(bullets[j])) {
      // Skip if the enemy is of type 'rock1' or 'rock2'
      if (enemies[i].type !== 'rock1' && enemies[i].type !== 'rock2') {
        enemies[i].reset();
        bullets.splice(j, 1);
        score++;
      } else if (enemies[i].type === 'rock1' || enemies[i].type === 'rock2') {
        // Remove the bullet but don't reset the rock
        bullets.splice(j, 1);
      }
    }
  }
}
  
  
  fill(225);
  text(score, width/2, 50);
  
  if (x <= 0) {
    x = 0;
  }
  
  if (x >= width - spacex) {
    x = width - spacex;
  }
}

function moveCraft() {
  if(gamePaused){
    return;
  }

  if (keyIsDown(68) || keyIsDown(39)) { //d or right arrow
    x += 5;
  }

  if (keyIsDown(65) || keyIsDown(37)) { //a or left arrow
    x -= 5;
  }
}

function mousePressed() {
  if(gamePaused){
    return;
  }

  let bulletx = x + spacex / 2 - 5; // To align with the center of the spacecraft horizontally
  let bullety = height - spacey - 157; // Set the bullet's y-position to be at the spacecraft's y-position
  let bullet = {
    x: bulletx,
    y: bullety,
    size: 10,
    saveState: function() {
      return {
        x: this.x,
        y: this.y,
        size: this.size
      };
    }
  };
}
  

// A function for detecting mouse clicks to shoot bullets out of the space craft
function mousePressed() {
  let bulletx = x + spacex / 2 - 5; // To align with the center of the spacecraft horizontally
  let bullety = height - spacey - 157; // Set the bullet's y-position to be at the spacecraft's y-position
  let bullet = {
    x: bulletx,
    y: bullety,
    size: 10,
  };
  bullets.push(bullet);
}

// A function for detecting space bar presses to shoot bullets out of the space craft
function keyPressed() {
  if (keyCode === 32) { // the number 32 refers to the ASCII code for the space bar
    let bulletx = x + spacex / 2 - 5; // To align with the center of the spacecraft horizontally
    let bullety = height - spacey - 157; // Set the bullet's y-position to be at the spacecraft's y-position
    let bullet = {
      x: bulletx,
      y: bullety,
      size: 10,
    };
    bullets.push(bullet);
  } 
  else if (keyCode === 27) {
    toggleGamePlay();
  }
}

