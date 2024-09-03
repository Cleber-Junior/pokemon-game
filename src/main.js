const canvas = document.getElementById("screengame");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
let gameOver = false;
ctx.font = "40px Tiny5";

// Controle do Ashe (personagem)
let positionCanvas = canvas.getBoundingClientRect();

// Controle do teclado
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

window.addEventListener("keydown", function (event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  }
});

window.addEventListener("keyup", function (event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
  }
});
console.log(keys);
// Personagem
const playerSprite = new Image();
playerSprite.src = "./img/sprites/hero.png";
class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 20;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.qtFrames = 4;
    this.spriteWidth = 61;
    this.spriteHeight = 65;
    this.frameInterval = 10;
    this.frameTimer = 0;
    this.moving = false;
  }
  update() {
    if (keys.ArrowUp && !keys.ArrowLeft && !keys.ArrowRight) {
      if (this.y - this.radius > 0) {
        this.y -= 5;
      }
      this.frameY = 3;
      this.moving = true;
    } else if (keys.ArrowDown && !keys.ArrowLeft && !keys.ArrowRight) {
      if (this.y + this.radius < canvas.height) {
        this.y += 5;
      }
      this.frameY = 0;
      this.moving = true;
    } else if (keys.ArrowLeft && !keys.ArrowUp && !keys.ArrowDown) {
      if (this.x - this.radius > 0) {
        this.x -= 5;
      }
      this.frameY = 1;
      this.moving = true;
    } else if (keys.ArrowRight && !keys.ArrowUp && !keys.ArrowDown) {
      if (this.x + this.radius < canvas.width) {
        this.x += 5;
      }
      this.frameY = 2;
      this.moving = true;
    }

    if (!this.moving) {
      this.frameX = 0;
    } else {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        this.frameX = (this.frameX + 1) % 4;
      }
    }
  }

  draw() {
    const zoom = 1.25;
    ctx.drawImage(
      playerSprite,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - (this.spriteWidth * zoom) / 2,
      this.y - (this.spriteHeight * zoom) / 2,
      this.spriteWidth * zoom,
      this.spriteHeight * zoom
    );
  }
}

const player = new Player();

// Inimigos (Cachorros)
const dogsArray = [];
const colisaoSom = new Audio("./sounds/game_over.mp3");
const spriteDog = new Image();
spriteDog.src = "./img/sprites/wolf.png";
class Dogs {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 50 + Math.random() * canvas.height;
    this.speed = Math.random() * 5 + 1;
    this.radius = 10;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 3;
    this.frame = 0;
    this.qtFrames = 5;
    this.spriteWidth = 32;
    this.spriteHeight = 35;
    this.frameInterval = 10;
    this.frameTimer = 0;
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);

    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % this.qtFrames;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.stroke();

    const zoom = 2.5;
    ctx.drawImage(
      spriteDog,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - (this.spriteWidth * zoom) / 2,
      this.y - (this.spriteHeight * zoom) / 2,
      this.spriteWidth * zoom,
      this.spriteHeight * zoom
    );
  }
}

function dogsGenerate() {
  if (gameFrame % 50 == 0) {
    dogsArray.push(new Dogs());
    console.log(dogsArray.length);
  }
  for (let i = 0; i < dogsArray.length; i++) {
    dogsArray[i].update();
    dogsArray[i].draw();
  }

  for (let i = dogsArray.length - 1; i >= 0; i--) {
    if (dogsArray[i].y < 0 - dogsArray[i].radius * 2) {
      dogsArray.splice(i, 1);
      continue;
    }
    const dx = dogsArray[i].x - player.x;
    const dy = dogsArray[i].y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < dogsArray[i].radius + player.radius) {
      gameOver = true;
      colisaoSom.play();
    }
  }
}

// Classe Pokebola
const pokebolaSprite = new Image();
pokebolaSprite.src = "./img/sprites/pokebola.png";
class Pokebola {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = 20;
    this.collected = false;
    this.spriteWidth = 30;
    this.spriteHeight = 30;
    this.sound = new Audio("./sounds/getPoint.mp3");
  }

  update() {
    if (!this.collected) {
      const dx = this.x - player.x;
      const dy = this.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      ctx.drawImage(
        pokebolaSprite,
        this.x - this.radius,
        this.y - this.radius,
        this.spriteWidth,
        this.spriteHeight
      );
      if (distance < this.radius + player.radius) {
        this.collected = true;
        score += 1;
        this.sound.play();
        console.log("Pokebola coletada!");
      }
    }
  }

  draw() {
    if (!this.collected) {
      ctx.beginPath();

      ctx.closePath();
    }
  }
}

const pokebolasArray = [];

function pokebolaGenerate() {
  if (gameFrame % 200 == 0) {
    pokebolasArray.push(new Pokebola());
  }
  for (let i = 0; i < pokebolasArray.length; i++) {
    pokebolasArray[i].update();
    pokebolasArray[i].draw();
  }
}

// Carregar a imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = "./img/grees.png";
backgroundImage.onload = () => {
  const pattern = ctx.createPattern(backgroundImage, "repeat");
  function drawBackground() {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  let animation;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    dogsGenerate();
    pokebolaGenerate();
    player.update();
    player.draw();
    ctx.fillStyle = "black";
    ctx.fillText("Pokebolas: " + score, 10, 50);
    gameFrame++;
    animation = requestAnimationFrame(animate);

    if (gameOver) {
      ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
      ctx.fillText(
        "Pressione Enter para reiniciar",
        canvas.width / 2 - 250,
        canvas.height / 2 + 50
      );
      cancelAnimationFrame(animation);
    }

    function resetGame() {
      score = 0;
      gameFrame = 0;
      gameOver = false;
      dogsArray.length = 0;
      pokebolasArray.length = 0;
      player.x = canvas.width / 2;
      player.y = canvas.height / 2;
      animate();
    }

    window.addEventListener("keydown", function (event) {
      if (gameOver && event.key === "Enter") {
        resetGame();
      }
    });
  }

  const trilhaSonora = new Audio("./sounds/trilhaSonora.mp3");
  trilhaSonora.loop = true;
  trilhaSonora.volume = 0.1;

  // Função para iniciar o jogo
  function startGame() {
    document.getElementById("startScreen").style.display = "none";
    trilhaSonora.play();
    animate();
  }

  // Adicionar evento ao botão de início
  document.getElementById("startButton").addEventListener("click", startGame);
};
