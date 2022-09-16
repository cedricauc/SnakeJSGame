export default function loadAssets() {
  loadRoot('sprites/')
  loadSprite('gem', 'gem40x40.png')

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

  loadSprite('ground', 'ground.png')
  loadSprite('fence-top', 'fence-top.png')
  loadSprite('fence-bottom', 'fence-bottom.png')
  loadSprite('fence-left', 'fence-left.png')
  loadSprite('fence-right', 'fence-right.png')
  loadSprite('post-top-left', 'post-top-left.png')
  loadSprite('post-top-right', 'post-top-right.png')
  loadSprite('post-bottom-left', 'post-bottom-left.png')
  loadSprite('post-bottom-right', 'post-bottom-right.png')

  loadRoot('sounds/')
  loadSound('score', 'score.mp3')
}
