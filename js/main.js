let tileSize = 40;
let rows = 20;
let columns = 20;

// Board
let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

// Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = (tileSize * columns) / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;
let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

let shipImg;
let shipVelocityX = tileSize;

// aliens

let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

// Bullets

let bulletArray = [];
let bulletVelocityY = -10;

// Score

let score = 0;
let gameOver = false;

// Audio

let shootAudio = new Audio("./sound/shoot.wav");
shootAudio.volume = 0.2;
let deathAudio = new Audio("./sound/enemy-death.wav");
deathAudio.volume = 0.2;
let bgAudio = new Audio("./sound/Game.mp3");
bgAudio.loop = true;
bgAudio.volume = 0.5;
bgAudio.autoplay = true;
bgAudio.muted = true;

window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  // Draw ship
  shipImg = new Image();
  shipImg.src = "./images/ship.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };
  randomAlien = new Array(
    "./images/alien.png",
    "./images/alien-cyan.png",
    "./images/alien-magenta.png",
    "./images/alien-yellow.png"
  );
  var randomNum = Math.floor(Math.random() * randomAlien.length);
  //alien images
  alienImg = new Image();
  alienImg.src = randomAlien[randomNum];

  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip, bgAudio.play());
  document.addEventListener("keyup", shoot);
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //Ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  //alien
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        // move all aliens up by one row
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  // bullets
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        deathAudio.play();
        alienCount--;
        score += 50;
      }
    }
  }

  // clear bullets
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift(); // remove the first element of the array
  }

  // next level
  if (alienCount == 0) {
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    alienVelocityX += 0.2;
    alienArray = [];
    bulletArray = [];
    createAliens();
    var randomNum = Math.floor(Math.random() * randomAlien.length);
    alienImg.src = randomAlien[randomNum];
  }

  //score
  context.fillStyle = "white";
  context.font = "50px courier";
  context.fillText(score, 20, 50);
}

function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (
    (e.code == "ArrowLeft" || e.code == "KeyA") &&
    ship.x - shipVelocityX >= 0
  ) {
    ship.x -= shipVelocityX; //Move Left
  } else if (
    (e.code == "ArrowRight" || e.code == "KeyD") &&
    ship.x + shipVelocityX + ship.width <= board.width
  ) {
    ship.x += shipVelocityX; //MoveRight
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      var randomNum = Math.floor(Math.random() * randomAlien.length);
      //alien images
      alienImg.src = randomAlien[randomNum];
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function shoot(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "Space") {
    let bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    shootAudio.play();
    bulletArray.push(bullet);
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y // a's bottom left corner passes b's top left corner
  );
}
