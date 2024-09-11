layers([
    "background",
    "game",
    "ui"
], "game");

add([
    sprite("background"),
    layer("background")
])

const directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

let current_direction = directions.RIGHT;
let pending_direction = current_direction;
let run_loop = false;
let snake_length = 3;
let snake_body = [];
let food = null;
var highscore = 0;

const block_size = 20;

const map = addLevel([
    "==============",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "=            = ",
    "==============",
  ], {
  width: block_size,
  height: block_size,
  pos: vec2(0, 0),
  "=": [
    rect(block_size, block_size),
    color(255,0,0),
    "wall"
  ]
});

const score = add([
  pos(1, 1),
  text("0", 20),
  layer("ui"),
  {
    value: 0,
  },
]);

// spawn snake
function respawn_snake(){
  snake_body.forEach(segment => {
    destroy(segment);
  });
  snake_body = [];
  snake_length = 3;

  for (let i = 1; i <= snake_length; i++) {
    snake_body.push(add([
      sprite('snek'),
      pos(block_size  ,block_size * i),
      "snake"
    ]));
  }
  current_direction = directions.RIGHT;
  pending_direction = current_direction;
}

// spawn food
function respawn_food(){
    let new_pos = rand(vec2(1,1), vec2(13,13));
    new_pos.x = Math.floor(new_pos.x);
    new_pos.y = Math.floor(new_pos.y);
    new_pos = new_pos.scale(block_size);

    if (food){
      destroy(food);
    }
    food = add([
      sprite(choose(["apple", "banana", "cherry", "green_apple", "kiwi", "orange", "pear", "pomegranate", "raspberry", "strawberry", "watermelon"])),
      pos(new_pos),
      scale(vec2(block_size / 26, block_size / 27)),
      "food"
    ]);
}

function respawn_all(){
  run_loop = false;
  if (score.value > highscore) {
    highscore = score.value;
  }

  add([
    text(`SNEK`, 32),
    pos(140, 60),
    origin("center"),
    color(0.3, 0, 0.3),
    "death",
  ]);

  add([
    text(`Your score: ${score.value}`, 12),
    pos(140, 140),
    origin("center"),
    "death",
  ]);
  
  add([
		text(`Highscore: ${highscore}`, 12),
		pos(140, 165),
		origin("center"),
    "death",
	]);

	add([
    text("Press space start!", 10),
    pos(140, 230),
    origin('center'),
    color(0.7, 0.7, 0.7),
    "death",
  ]);
    
  keyPress('space', () => {
    destroyAll("death");
    score.value = 0;
    score.text = score.value;
    respawn_snake();
    respawn_food();
    run_loop = true;
  });
}

respawn_all();



// eat food
overlaps("snake", "food", (s, f) => {
    snake_length++;
    score.value++;
		score.text = score.value;
    respawn_food();
});

// hit a wall
overlaps("snake", "wall", (s, w) => {
    run_loop = false;
    camShake(12);
    respawn_all();
});

// hit self
overlaps("snake", "snake", (s, t) => {
    run_loop = false;
    camShake(12);
    respawn_all();
});

// send pending movement
keyPress("up", () => {
  pending_direction = directions.UP;
});

keyPress("down", () => {
  pending_direction = directions.DOWN;
});

keyPress("left", () => {
  pending_direction = directions.LEFT;
});

keyPress("right", () => {
  pending_direction = directions.RIGHT;
});


// snake movement
loop(0.2, ()=> {
  if (!run_loop) return;

  let move_x = 0;
  let move_y = 0;

  // to fix making a 180 turn by clicking 2 buttons quickly
  switch (pending_direction) {
    case directions.DOWN:
      if (current_direction != directions.UP){
        current_direction = directions.DOWN;
      }
      break;
    case directions.UP:
      if (current_direction != directions.DOWN){
        current_direction = directions.UP;
      }
      break;
    case directions.LEFT:
      if (current_direction != directions.RIGHT){
        current_direction = directions.LEFT;
      }
      break;
    case directions.RIGHT:
      if (current_direction != directions.LEFT){
        current_direction = directions.RIGHT;
      }
      break;
  }

  switch (current_direction) {
    case directions.DOWN:
      move_x = 0;
      move_y = block_size;
      break;
    case directions.UP:
      move_x = 0;
      move_y = -1*block_size;
      break;
    case directions.LEFT:
      move_x = -1*block_size;
      move_y = 0;
      break;
    case directions.RIGHT:
      move_x = block_size;
      move_y = 0;
      break;
  }

  // Get the last element (the snake head)
  let snake_head = snake_body[snake_body.length - 1];

  snake_body.push(add([
    sprite('snek'),
    pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
    "snake"
]));

  if (snake_body.length > snake_length){
    let tail = snake_body.shift(); // Remove the last of the tail
    destroy(tail);
  }
});