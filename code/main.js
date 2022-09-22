import kaboom from '../lib/kaboom.mjs'
import loadAssets from '../code/assets.js'
import LEVELS from '../code/maps.js'

kaboom({
  background: [35, 35, 35],
  scale: 1,
})

loadAssets()

const block_size = 40

const MAP_WIDTH = 32
const MAP_HEIGHT = 20

let level_pos = vec2(
  (width() - MAP_WIDTH * block_size) / 2,
  (height() - MAP_HEIGHT * block_size) / 2,
)

const levelConf = {
  width: block_size,
  height: block_size,
  pos: vec2(level_pos.x, level_pos.y),
  '=': () => [rect(block_size, block_size), color(255, 0, 0), area(), 'wall'],
  ' ': () => [sprite('ground'), area(), 'ground'],
  t: () => [sprite('fence-top'), area(), 'wall', scale(2)],
  b: () => [sprite('fence-bottom'), area(), 'wall', scale(2)],
  l: () => [sprite('fence-left'), area(), 'wall', scale(2)],
  r: () => [sprite('fence-right'), area(), 'wall', scale(2)],
  '1': () => [sprite('post-top-left'), area(), 'wall', scale(2)],
  '2': () => [sprite('post-top-right'), area(), 'wall', scale(2)],
  '3': () => [sprite('post-bottom-left'), area(), 'wall', scale(2)],
  '4': () => [sprite('post-bottom-right'), area(), 'wall', scale(2)],
}

const directions = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
}

let current_direction = directions.RIGHT
let run_action = false
let snake_length = 3
let snake = []

// initialise un tableau de directions
let snake_direction = [directions.RIGHT, directions.RIGHT, directions.RIGHT]

let move_delay = 0.2
let timer = 0

let food = null

let score = 0
let highScore = 0

// initialise deux tableaux pour placer les objets dans la carte
let food_pos_x = []
let food_pos_y = []

scene('start', () => {
  add([
    text('Press enter to start', { size: 36 }),
    color(255, 255, 255),
    origin('center'),
    pos(width() / 2, height() / 2),
  ])

  keyRelease('enter', () => {
    go('game')
  })
})

go('start')

scene('game', (levelNumber = 0) => {
  score = 0
  layers(['bg', 'game', 'ui'], 'game')

  addLevel(LEVELS[levelNumber], levelConf)

  let score_label = add([
    text('Score: 0', { size: 36 }),
    pos(vec2(level_pos.x, level_pos.y - block_size)),
    color(255, 255, 255),
    layer('ui'),
  ])

  respawn_all()
  onKeyPress('up', () => {
    if (current_direction != directions.DOWN) {
      current_direction = directions.UP
    }
  })

  onKeyPress('down', () => {
    if (current_direction != directions.UP) {
      current_direction = directions.DOWN
    }
  })

  onKeyPress('left', () => {
    if (current_direction != directions.RIGHT) {
      current_direction = directions.LEFT
    }
  })

  onKeyPress('right', () => {
    if (current_direction != directions.LEFT) {
      current_direction = directions.RIGHT
    }
  })

  onUpdate(() => {
    if (!run_action) return
    timer += dt()
    if (timer < move_delay) return
    timer = 0

    score_label.text = 'Score: ' + score

    // ajoute au tableau une saisie direction
    snake_direction.push(current_direction)

    // supprime dernier élément saisie direction du tableau
    destroy(snake_direction.shift())

    // lorsque le serpent s'agrandit
    while (snake_length !== snake.length) {
      snake = add_part_to_snake()
    }

    // construit le serpent
    snake = build_snake()
  })

  onCollide('snake', 'food', (s, f) => {
    play('score')
    score += 1
    snake_length++
    snake_direction = [snake_direction[0]].concat(snake_direction)
    respawn_food()
  })

  onCollide('snake', 'wall', (s, w) => {
    run_action = false
    shake(12)
    go('gameover', score)
  })

  onCollide('snake', 'snake', (s, t) => {
    run_action = false
    shake(12)
    go('gameover', score)
  })
})

scene('gameover', (score) => {
  if (score > highScore) {
    highScore = score
  }

  add([
    text(
      'gameover!\n' +
        'score: ' +
        score +
        '\nhigh score: ' +
        highScore +
        '\nPress enter to start',
      {
        size: 36,
      },
    ),
    color(255, 255, 255),
    origin('center'),
    pos(width() / 2, height() / 2),
  ])

  onKeyPress('enter', () => {
    respawn_all()
    go('game')
  })
})

/**
 * instancie un serpent
 */
function respawn_snake() {
  destroyAll('snake')

  snake = []
  snake_length = 3
  snake_direction = [directions.RIGHT, directions.RIGHT, directions.RIGHT]

  snake.push(
    add([
      sprite('tailRight'),
      pos(level_pos.x + block_size, level_pos.y + block_size),
      area(),
      'snake',
    ]),
  )

  snake.push(
    add([
      sprite('bodyHorizontal'),
      pos(level_pos.x + block_size * 2, level_pos.y + block_size),
      area(),
      'snake',
    ]),
  )

  snake.push(
    add([
      sprite('headRight'),
      pos(level_pos.x + block_size * 3, level_pos.y + block_size),
      area(),
      'snake',
    ]),
  )

  current_direction = directions.RIGHT
}

/**
 * place serpent et objet à collecter
 */
function respawn_all() {
  run_action = false
  wait(0.5, function () {
    respawn_snake()
    calculate_range_list()
    respawn_food()
    run_action = true
  })
}

/**
 * place un objet à collecter
 */
function respawn_food() {
  let new_pos = vec2(
    food_pos_x[Math.floor(Math.random() * food_pos_x.length)],
    food_pos_y[Math.floor(Math.random() * food_pos_y.length)],
  )

  if (food) {
    destroy(food)
  }

  food = add([sprite('gem'), pos(new_pos), area(), 'food'])
}

/**
 * retourne deux listes pour placer les objets dans la carte
 */
function calculate_range_list() {
  food_pos_x = []
  food_pos_y = []

  for (let i = 1; i < MAP_WIDTH - 1; i++) {
    food_pos_x.push(level_pos.x + i * block_size)
  }

  for (let i = 1; i < MAP_HEIGHT; i++) {
    food_pos_y.push(level_pos.y + i * block_size)
  }
}
/**
 * @param {*} current_direction
 * @param {*} previous_direction
 * @returns {Array} move_x, move_y, sprite
 */
function update_snake_tail(current_direction, previous_direction) {
  let move_x = 0
  let move_y = 0
  let sprite

  switch (current_direction) {
    case directions.DOWN:
      move_y = block_size
      switch (previous_direction) {
        case directions.LEFT:
          sprite = 'tailLeft'
          break
        case directions.RIGHT:
          sprite = 'tailRight'
          break
        default:
          sprite = 'tailDown'
      }
      break
    case directions.UP:
      move_y = -1 * block_size
      switch (previous_direction) {
        case directions.LEFT:
          sprite = 'tailLeft'
          break
        case directions.RIGHT:
          sprite = 'tailRight'
          break
        default:
          sprite = 'tailUp'
      }
      break
    case directions.LEFT:
      move_x = -1 * block_size
      switch (previous_direction) {
        case directions.UP:
          sprite = 'tailUp'
          break
        case directions.DOWN:
          sprite = 'tailDown'
          break
        default:
          sprite = 'tailLeft'
      }
      break
    case directions.RIGHT:
      move_x = block_size
      switch (previous_direction) {
        case directions.UP:
          sprite = 'tailUp'
          break
        case directions.DOWN:
          sprite = 'tailDown'
          break
        default:
          sprite = 'tailRight'
      }
      break
  }

  return [move_x, move_y, sprite]
}

/**
 * @param {*} current_direction
 * @param {*} previous_direction
 * @returns {Array} move_x, move_y, sprite
 */
function update_snake_body(current_direction, previous_direction) {
  let move_x = 0
  let move_y = 0
  let sprite

  switch (current_direction) {
    case directions.DOWN:
      switch (previous_direction) {
        case directions.LEFT:
          move_x = -1 * block_size
          sprite = 'fromLeftToDown'
          break
        case directions.RIGHT:
          move_x = block_size
          sprite = 'fromRightToDown'
          break
        default:
          move_y = block_size
          sprite = 'bodyVertical'
      }
      break
    case directions.UP:
      switch (previous_direction) {
        case directions.LEFT:
          move_x = -1 * block_size
          sprite = 'fromLeftToUp'
          break
        case directions.RIGHT:
          move_x = block_size
          sprite = 'fromRightToUp'
          break
        default:
          move_y = -1 * block_size
          sprite = 'bodyVertical'
      }
      break
    case directions.LEFT:
      switch (previous_direction) {
        case directions.UP:
          move_y = -1 * block_size
          sprite = 'fromRightToDown'
          break
        case directions.DOWN:
          move_y = block_size
          sprite = 'fromRightToUp'
          break
        default:
          move_x = -1 * block_size
          sprite = 'bodyHorizontal'
      }
      break
    case directions.RIGHT:
      switch (previous_direction) {
        case directions.UP:
          move_y = -1 * block_size
          sprite = 'fromLeftToDown'
          break
        case directions.DOWN:
          move_y = block_size
          sprite = 'fromLeftToUp'
          break
        default:
          move_x = block_size
          sprite = 'bodyHorizontal'
      }
      break
  }

  return [move_x, move_y, sprite]
}

/**
 * @param {*} current_direction
 * @returns {Array} move_x, move_y, sprite
 */
function update_snake_head(current_direction) {
  let move_x = 0
  let move_y = 0
  let sprite

  switch (current_direction) {
    case directions.DOWN:
      move_y = block_size
      sprite = 'headDown'
      break
    case directions.UP:
      move_y = -1 * block_size
      sprite = 'headUp'
      break
    case directions.LEFT:
      move_x = -1 * block_size
      sprite = 'headLeft'
      break
    case directions.RIGHT:
      move_x = block_size
      sprite = 'headRight'
      break
  }

  return [move_x, move_y, sprite]
}

/**
 * construit le serpent
 * @returns {Array} snake
 */
function build_snake() {
  let temp_snake = []

  let tail = update_snake_tail(snake_direction[0], snake_direction[1])
  // place dernier élément du serpent
  temp_snake.push(
    add([
      sprite(tail[2]),
      pos(snake[0].pos.x + tail[0], snake[0].pos.y + tail[1]),
      area(),
      'snake',
    ]),
  )

  for (let i = 1; i < snake_length - 1; i++) {
    let body = update_snake_body(snake_direction[i + 1], snake_direction[i])

    // place le corps du serpent
    temp_snake.push(
      add([
        sprite(body[2]),
        pos(snake[i].pos.x + body[0], snake[i].pos.y + body[1]),
        area(),
        'snake',
      ]),
    )
  }

  let head = update_snake_head(snake_direction[snake_length - 1])

  // place premier élément du serpent
  temp_snake.push(
    add([
      sprite(head[2]),
      pos(
        snake[snake_length - 1].pos.x + head[0],
        snake[snake_length - 1].pos.y + head[1],
      ),
      area(),
      'snake',
    ]),
  )

  snake.map((x) => destroy(x))

  return temp_snake
}

/**
 * Ajoute un élément au serpent
 * @returns {Array} snake
 */
function add_part_to_snake() {
  let temp_snake = []

  let tail = update_snake_tail(snake_direction[0], snake_direction[1])

  temp_snake.push(
    add([
      sprite(tail[2]),
      pos(snake[0].pos.x - tail[0], snake[0].pos.y - tail[1]),
      area(),
      'snake',
    ]),
  )

  temp_snake = temp_snake.concat(snake)

  return temp_snake
}
