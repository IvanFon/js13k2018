// warning: this code is bad

kontra.init(document.querySelector('#game'));

// Globals
// =======
// Screen dimensions
const width = 640;
const height = 480;

let curLvl = 1;

const playerSpeed = 4;
// Player attack radius
const playerRad = kontra.sprite({ width: 60, height: 60 });
// If player is in dialogue
let inDialogue = false;
// Current character's dialogue
let curDialogue;
let curDialogueIndex = 0;
// Current dialogue character
let curDialogueChar = 0;
let weapon = false;
let health = 10;
const charSize = 30;
const bulletSpeed = 7;
const enemySpeed = 2.5;
let kills = 0;
let fight = true;
let lvl5BoxShown = false;

// Timers
// timers[0]: interact
// timers[1]: attack
// timers[2]: enemy spawn
let timers = [ 0, 0, 0 ];

// Bullets
let bullets = [];
// Enemies
let enemies = [];


// Levels
// ======
// player: kontra.vector
// world: [x, y, width, height, colour]
// text: [x, y, text, size, colour]
// triggers: [x, y, width, height, level, enabled]
let levels = [
  // Level 1 (start)
  {
    player: kontra.vector(
      (width - charSize) / 2,
      (height - charSize) / 2
    ),
    world: [],
    text: [
      [(width - 125) / 2, 10, '^ Town ^', 4, 'white'],
    ],
    triggers: [
      [(width - 100) / 2, 0, 100, 30, 2]
    ],
    chars: {
      blue: {
        sprite: [(width - charSize) / 2, 100, charSize, charSize, 'blue'],
        dialogue: [
          'Hey Red!',
          'What are you doing all the way down\\here? It\'s dangerous to go alo- err...\\unaccompanied! You need a weapon!',
          'Go up into town, I\'ll meet you there\\in front of the shop.',
        ],
      },
    },
  },
  // Level 2 (town 1)
  {
    player: kontra.vector(
      (width - charSize) / 2,
      400,
    ),
    world: [
      // House 1 (top left)
      [100, 100, 100, 70, 'white'],
      [100, 170, 30, 30, 'white'],
      [170, 170, 30, 30, 'white'],
      // House 2 (top right)
      [440, 100, 100, 70, 'white'],
      [440, 170, 30, 30, 'white'],
      [510, 170, 30, 30, 'white'],
      // House 3 (bottom left)
      [100, 280, 100, 70, 'white'],
      [100, 350, 30, 30, 'white'],
      [170, 350, 30, 30, 'white'],
      // House 4 (bottom right)
      [440, 280, 100, 70, 'white'],
      [440, 350, 30, 30, 'white'],
      [510, 350, 30, 30, 'white'],
    ],
    text: [
      [(width - 125) / 2, 10, '^ Town ^', 4, 'white'],
    ],
    triggers: [
      [(width - 100) / 2, 0, 100, 20, 3]
    ],
    chars: {
      green: {
        sprite: [(width - charSize) / 2, 100, charSize, charSize, 'green'],
        dialogue: [
          'The shop?',
          'It\'s just up North, be careful...',
        ],
      },
    },
  },
  // Level 3 (town 2)
  {
    player: kontra.vector(
      (width - charSize) / 2,
      400,
    ),
    world: [
      []
    ],
    text: [
      [(width - 125) / 2, 450, '& Town &', 4, 'white'],
      [10, (height - 50) / 2, '<- Shop', 4, 'white'],
      [(width - 140) / 2, 10, '^ Internet ^', 4, 'white'],
    ],
    triggers: [
      [(width - 100) / 2, 460, 100, 20, 2],
      [0, 0, 20, height, 4],
      [(width - 100) / 2, 0, 100, 30, 5, false],
    ],
    chars: {},
  },
  // Level 4 (shop)
  {
    player: kontra.vector(
      width - charSize - 75,
      (height - charSize) / 2,
    ),
    world: [],
    text: [
      [(width - 125), (height - 50) / 2, 'Town ->', 4, 'white'],
    ],
    triggers: [
      [(width - 20), 0, 20, height, 3],
    ],
    chars: {
      blue: {
        sprite: [400, 100, charSize, charSize, 'blue'],
        dialogue: [
          'Hi again!',
          'Go talk to the shopkeeper, he can\\give you a weapon!',
        ],
      },
      orange: {
        sprite: [100, 300, charSize, charSize, 'orange'],
        dialogue: [
          'Hello there adventurer! What are\\you looking for?',
          'You\'re looking for a weapon? Lucky\\for you, I have a data blaster, last\\one in stock! That\'ll be 400 bits!',
          'You don\'t have any money? ...\\Well, why don\'t we make a deal?',
          'The Internet went down this\\morning. I\'ll give you this data\\blaster, and in exchange you fix it.',
          'How does that sound? ...',
          'Great! You can find the Internet\\up to the north. Press Z to\\shoot the blaster. Good luck!',
        ],
      },
    },
  },
  // Level 5 (Internet)
  {
    player: kontra.vector(
      (width - charSize) / 2,
      400,
    ),
    world: [],
    text: [
      [75, 50, 'Defeat    enemies to progress!', 4, 'white'],
    ],
    triggers: [],
    chars: {},
  },
  // Level 6 (end)
  {
    player: kontra.vector(
      (width - charSize) / 2,
      400,
    ),
    world: [
      [(width - 100) / 2, 75, 100, 50, 'white'],
      [(width - 90) / 2, 80, 90, 40, 'black'],
    ],
    text: [
      [150, 25, 'Turn on the Internet!', 4, 'white'],
    ],
    triggers: [],
    chars: {},
  },
];

// Create sprite from array of values
// [x, y, width, height, (colour | level)]
function createSprite(vals) {
  return kontra.sprite({ x: vals[0], y: vals[1], width: vals[2], height: vals[3], color: vals[4], level: vals[4]});
}

// Generate levels
function genLevels() {
  for (let lvl = 0; lvl < levels.length; lvl++) {
    // World
    for (let n = 0; n < levels[lvl].world.length; n++) {
      const tmp = levels[lvl].world[n];
      // Create sprite
      levels[lvl].world[n] = createSprite(tmp);
    }

    // Triggers
    for (let n = 0; n < levels[lvl].triggers.length; n++) {
      const tmp = levels[lvl].triggers[n];
      // Create sprite
      levels[lvl].triggers[n] = createSprite(tmp);
      levels[lvl].triggers[n].enabled = tmp[5] == undefined ? true : tmp[5];
    }

    // Characters
    for (const key in levels[lvl].chars) {
      const tmp = levels[lvl].chars[key].sprite;
      // Create sprite
      levels[lvl].chars[key].sprite = createSprite(tmp);
    }
  }
}

// Get specific level
function getLevel(lvl) {
  let level = levels[lvl - 1];
  // Get colliders
  level.colliders = [];
  // Get world sprites
  for (const sprite of level.world) {
    level.colliders.push(sprite);
  }
  // Get character sprites
  for (const key in level.chars) {
    level.colliders.push(level.chars[key].sprite);
  }

  // Draw text
  clearAllText();
  for (const text of level.text) {
    drawText(text[2], text[3], text[0], text[1], text[4]);
  }

  return level;
}


// Title screen
// ============
{
  let x = 10;
  drawText('Internet Quest', 10, x, 10, 'white');
  drawText('arrow keys to move', 7, x, 125, 'white');
  drawText('z to interact', 7, x, 175, 'white');
  let y1 = 275;
  drawText('made by', 7, x, y1, 'white');
  drawText('Ivan Fonseca', 7, 230, y1, '#0891db');
  let y2 = 325;
  drawText('for js    games 2018', 7, x, y2, 'white');
  drawText('13k', 7, 170, y2, 'red');
  drawText('press z to start', 7, x, 430, '#03c123');
}


// Game
// ====
document.body.addEventListener('keydown', game);
function game(e) {
if (e.keyCode != 90) return;
document.body.removeEventListener('keydown', game);

// Clear title screen
clearAllText();

genLevels();
let level = getLevel(1);

let player = kontra.sprite({
  x: (width - charSize) / 2,
  y: (height - charSize) / 2,
  color: 'red',
  width: charSize,
  height: charSize,

  update() {
    // Draw health & enemies
    if (curLvl == 5) {
      clearLvl5();
      drawText(`Health: ${health}`, 4, 5, 5, 'white');
      drawText(String(25 - kills), 4, 180, 50, 'white');

      // DIe
      if (health <= 0) {
        health = 10;
        curLvl = 3;
        level = getLevel(3);
        this.position = level.player;
        kills = 0;
      }

      // End game
      if (kills >= 25) {
        loop.stop();
        enemies = [];
        bullets = [];
        fight = false;
        weapon = false;
        timers[2] = -1;
        loop.start();
        loop.stop();
        curLvl = 6;
        level = getLevel(6);
        this.position = level.player;
        setTimeout(() => loop.start(), 3000);
      }
    }

    if (curLvl == 6) {
      if (this.y < 130) {
        loop.stop();
        this.render = () => {};
        clearAllText();
        setTimeout(() => {
          const light = new Path2D();
          light.arc((width - 7) / 2, 100, 7, 0, 2 * Math.PI);
          kontra.context.fillStyle = '#dc143c';
          kontra.context.fill(light);
        }, 2000);
        setTimeout(() => {
          kontra.context.clearRect(0, 0, width, height);
        }, 4000);
        setTimeout(() => {
          kontra.context.clearRect(0, 0, width, height);
          textBox('Thanks for playing!\\github.com/IvanFon\\<3', 6, 'white');
        }, 6000);
      }
    }

    // Move
    if (!inDialogue) {
      // Horizontal
      if (kontra.keys.pressed('left')) {
        this.x -= playerSpeed;
        level.colliders.forEach(val => this.x += this.collidesWith(val) ? playerSpeed : 0);
      } else if (kontra.keys.pressed('right')) {
        this.x += playerSpeed;
        level.colliders.forEach(val => this.x -= this.collidesWith(val) ? playerSpeed : 0);
      }
      // Vertical
      if (kontra.keys.pressed('up')) {
        this.y -= playerSpeed;
        level.colliders.forEach(val => this.y += this.collidesWith(val) ? playerSpeed : 0);
      } else if (kontra.keys.pressed('down')) {
        this.y += playerSpeed;
        level.colliders.forEach(val => this.y -= this.collidesWith(val) ? playerSpeed : 0);
      }
    }

    // Keep on-screen
    this.position.clamp(0, 0, width - this.width, height - this.height);

    // Collide with triggers
    for (const trigger of level.triggers) {
      if (this.collidesWith(trigger)) {
        if (trigger.enabled) {
          // Switch level
          curLvl = trigger.level;
          level = getLevel(trigger.level);
          this.position = level.player;

          if (curLvl == 5) {
            // Start fight
            timers[2] = 120;
          }
          break;
        } else {
          if (trigger.level == 5) {
            textBox('You need a weapon first!', 4, 'white');
            lvl5BoxShown = true;
          }
        }
      } else if (lvl5BoxShown) {
        clearTextBox();
        lvl5BoxShown = false;
      }
    }

    // Talk to others
    if (timers[0] <= 0 && kontra.keys.pressed('z')) {
      timers[0] = 30;

      if (!inDialogue) {
        // Check for collision with characters
        playerRad.x = this.x - (charSize / 2);
        playerRad.y = this.y - (charSize / 2);
        for (const key in level.chars) {
          if (level.chars[key].sprite.collidesWith(playerRad)) {
            // Start dialogue
            inDialogue = true;
            curDialogueIndex = 0;
            curDialogue = level.chars[key].dialogue;
            curDialogueChar = key;
            // Unlock weapon
            if (key == 'orange') {
              weapon = true;
              levels[2].triggers[2].enabled = true;
            }
            textBox(curDialogue[0], 6, 'white');
            break;
          }
        }
      } else {
        clearTextBox();
        if (curDialogueIndex < curDialogue.length) {
          // Unlock area
          if (curDialogue[curDialogueIndex].indexOf('Area unlocked') >= 0) {
            const tmp = curDialogue[curDialogueIndex].split('$');
            level.triggers[tmp[1]].enabled = true;
            level.chars[curDialogueChar].dialogue.splice(curDialogueIndex, 1);
            textBox('Area unlocked!', 6, '#0891db');
          } else {
            textBox(curDialogue[curDialogueIndex], 6, 'white');
          }

          curDialogueIndex++;
        } else {
          inDialogue = false;
          timers[1] = 60;
        }
      }
    }

    // Attack
    if (timers[1] <= 0 && kontra.keys.pressed('z')) {
      if (!inDialogue && weapon) {

        // Create bullets
        for (let i = 0; i < 4; i++) {
          if (Math.random() >= 0.5) {
            bullets.push(kontra.sprite({
              x: player.x,
              y: player.y,
              width: 3,
              height: 12,
              color: 'white',
              update() {
                switch (i) {
                  case 0:
                    this.y += bulletSpeed;
                    break;
                  case 1:
                    this.y -= bulletSpeed;
                    break;
                  case 2:
                    this.x += bulletSpeed;
                    break;
                  case 3:
                    this.x -= bulletSpeed;
                    break;
                }
              }
            }));
          } else {
            bullets.push(kontra.sprite({
              x: player.x - 5,
              y: player.y - 5,
              width: 10,
              height: 10,
              color: 'white',
              update() {
                switch (i) {
                  case 0:
                    this.y += bulletSpeed;
                    break;
                  case 1:
                    this.y -= bulletSpeed;
                    break;
                  case 2:
                    this.x += bulletSpeed;
                    break;
                  case 3:
                    this.x -= bulletSpeed;
                    break;
                }
              }
            }));
            bullets.push(kontra.sprite({
              x: player.x - 2,
              y: player.y - 2,
              width: 4,
              height: 4,
              color: 'black',
              update() {
                switch (i) {
                  case 0:
                    this.y += bulletSpeed;
                    break;
                  case 1:
                    this.y -= bulletSpeed;
                    break;
                  case 2:
                    this.x += bulletSpeed;
                    break;
                  case 3:
                    this.x -= bulletSpeed;
                    break;
                }
              }
            }));
          }
        }

        // Reset cooldown
        timers[1] = 20;
      }
    }
  },
});

let loop = kontra.gameLoop({
  update(dt) {
    player.update();

    // Bullets
    // Destroy when offscreen
    bullets = bullets.filter((x, i) => {
      x.update();
      if (x.x < 0 || x.x > width || x.y < 0 || x.y > height) {
        return false;
      }
      return true;
    });

    // Enemies
    enemies.map(x => x.update());

    // Update timers
    timers = timers.map(val => --val);
    // Enemies
    if (timers[2] == 0) {
      enemies.push(kontra.sprite({
        x: Math.random() >= 0.5 ? (width / 6) : (width / 6) * 5,
        y: Math.random() >= 0.5 ? (height / 6) : (height / 6) * 5,
        width: charSize - 10,
        height: charSize - 10,
        color: '#ff00f1',
        health: 2,
        update() {
          if (this.health <= 0) return;
          // Move towards player
          if (this.x > player.x) this.x -= enemySpeed;
          if (this.x < player.x) this.x += enemySpeed;
          if (this.y > player.y) this.y -= enemySpeed;
          if (this.y < player.y) this.y += enemySpeed;

          // Collide with player
          if (this.collidesWith(player)) {
            health--;
            this.health = 0;
            kills++;
          }

          // Collide with bullets
          for (let i = 0; i < bullets.length; i++) {
            if (this.collidesWith(bullets[i])) {
              bullets.splice(i, 1);
              this.health--;
              if (this.health <= 0) kills++;
            }
          }
        },
        render() {
          if (this.health > 0) this.draw();
        },
      }));
      // Reset enemy spawn timer
      if (fight) timers[2] = (200 - (25 - kills)) - (8 * kills);
    }
  },
  render() {
    player.render();

    // Bullets
    bullets.map(x => x.render());

    // Enemies
    enemies.map(x => x.render());

    // Render level
    level.world.map(x => x.render());
    // Render characters
    Object.keys(level.chars).map(x => level.chars[x].sprite.render());
  }
});

loop.start();
}
