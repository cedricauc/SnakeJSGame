import kaboom from '/lib/kaboom.mjs'

kaboom({
  background: [0, 0, 0],
  scale: 1,
})

loadRoot('sprites/')
loadSprite('gem', 'gem.png')

loadSpriteAtlas('snake.png', {
  tailUp: {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
  },
  tailDown: {
    x: 40,
    y: 40,
    width: 40,
    height: 40,
  },
  tailLeft: {
    x: 0,
    y: 40,
    width: 40,
    height: 40,
  },
  tailRight: {
    x: 40,
    y: 0,
    width: 40,
    height: 40,
  },
  bodyVertical: {
    x: 80,
    y: 0,
    width: 40,
    height: 40,
  },
  bodyHorizontal: {
    x: 80,
    y: 40,
    width: 40,
    height: 40,
  },
  headUp: {
    x: 120,
    y: 0,
    width: 40,
    height: 40,
  },
  headDown: {
    x: 120,
    y: 40,
    width: 40,
    height: 40,
  },
  headLeft: {
    x: 160,
    y: 40,
    width: 40,
    height: 40,
  },
  headRight: {
    x: 160,
    y: 0,
    width: 40,
    height: 40,
  },
  fromLeftToUp: {
    x: 200,
    y: 0,
    width: 40,
    height: 40,
  },
  fromLeftToDown: {
    x: 200,
    y: 40,
    width: 40,
    height: 40,
  },
  fromRightToDown: {
    x: 240,
    y: 0,
    width: 40,
    height: 40,
  },
  fromRightToUp: {
    x: 240,
    y: 40,
    width: 40,
    height: 40,
  },
})

//loadRoot('sounds/')

const block_size = 40
const map = addLevel(
  [
    '======================================',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '=                                    =',
    '======================================',
  ],
  {
    width: block_size,
    height: block_size,
    pos: vec2(0, 0),
    '=': () => [rect(block_size, block_size), color(255, 0, 0), area(), 'wall'],
  },
)

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

// instancie un serpent
function respawn_snake() {
  destroyAll('snake')

  snake = []
  snake_length = 3
  snake_direction = [directions.RIGHT, directions.RIGHT, directions.RIGHT]

  snake.push(
    add([sprite('tailRight'), pos(block_size, block_size), area(), 'snake']),
  )

  snake.push(
    add([
      sprite('bodyHorizontal'),
      pos(block_size * 2, block_size),
      area(),
      'snake',
    ]),
  )

  snake.push(
    add([
      sprite('headRight'),
      pos(block_size * 3, block_size),
      area(),
      'snake',
    ]),
  )

  current_direction = directions.RIGHT
}

// instancie tous les objets
function respawn_all() {
  run_action = false
  wait(0.5, function () {
    respawn_snake()
    respawn_food()
    run_action = true
  })
}

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

let move_delay = 0.2
let timer = 0
onUpdate(() => {
  if (!run_action) return
  timer += dt()
  if (timer < move_delay) return
  timer = 0

  // ajoute au tableau la direction saisie
  snake_direction.push(current_direction)

  // supprime dernier élément du tableau
  destroy(snake_direction.shift())

  let temp_snake = []

  let tail = update_snake_tail(snake_direction[0], snake_direction[1])

  // place dernier élément du serpent
  temp_snake.push(
    add([
      sprite(tail[2]),
      pos(
        snake[snake.length - 3].pos.x + tail[0],
        snake[snake.length - 3].pos.y + tail[1],
      ),
      area(),
      'snake',
    ]),
  )

  let body = update_snake_body(snake_direction[2], snake_direction[1])

  // place le corps du serpent
  temp_snake.push(
    add([
      sprite(body[2]),
      pos(
        snake[snake.length - 2].pos.x + body[0],
        snake[snake.length - 2].pos.y + body[1],
      ),
      area(),
      'snake',
    ]),
  )

  let head = update_snake_head(snake_direction[2])

  // place premier élément du serpent
  temp_snake.push(
    add([
      sprite(head[2]),
      pos(
        snake[snake.length - 1].pos.x + head[0],
        snake[snake.length - 1].pos.y + head[1],
      ),
      area(),
      'snake',
    ]),
  )

  snake.map((x) => destroy(x))

  snake = temp_snake
})

let food = null

// instancie objet à collecter
function respawn_food() {
  let new_pos = rand(vec2(1, 1), vec2(13, 13))
  new_pos.x = Math.floor(new_pos.x)
  new_pos.y = Math.floor(new_pos.y)
  new_pos = new_pos.scale(block_size)

  if (food) {
    destroy(food)
  }

  food = add([sprite('gem'), pos(new_pos), area(), 'food', scale(2)])
}

onCollide('snake', 'food', (s, f) => {
  //snake_length++
  respawn_food()
})

onCollide('snake', 'wall', (s, w) => {
  run_action = false
  shake(12)
  respawn_all()
})

// onCollide('snake', 'snake', (s, t) => {
//   run_action = false
//   shake(12)
//   respawn_all()
// })

/**
 *
 * @param {*} current_direction
 * @param {*} previous_direction
 * @returns [move_x, move_y, sprite]
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
 *
 * @param {*} current_direction
 * @param {*} previous_direction
 * @returns [move_x, move_y, sprite]
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
 *
 * @param {*} current_direction
 * @returns [move_x, move_y, sprite]
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
