import { ui, queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Animator, Billboard, GltfContainer, Transform, VisibilityComponent, engine } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import * as utils from '@dcl-sdk/utils'

let timer: ui.Timer3D

export function initCountdownNumbers() {
  timer = new ui.Timer3D(
    {
      parent: sceneParentEntity,
      position: Vector3.create(0, 3, -6),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    },
    1,
    1,
    false,
    10
  )

  timer.hide()
}

export async function countdown(cb: () => void, number: number) {
  let currentValue = number
  let time = 1

  engine.addSystem(
    (dt: number) => {
      time += dt

      if (time >= 1) {
        time = 0

        if (currentValue > 0) {
          timer.show()
          timer.setTimeAnimated(currentValue--)
        } else {
          timer.hide()
          engine.removeSystem('countdown-system')
          cb && cb()
        }
      }
    },
    undefined,
    'countdown-system'
  )
}

export function setupWinAnimations() {
  let winAnimA = engine.addEntity()
  let winAnimB = engine.addEntity()
  let winAnimC = engine.addEntity()
  let winAnimFollow = engine.addEntity()
  let winAnimText = engine.addEntity()

  GltfContainer.create(winAnimA, {
    src: 'mini-game-assets/models/winAnim.glb'
  })

  Transform.create(winAnimA, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, 45, 0)
  })

  Animator.create(winAnimA, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimB, {
    src: 'mini-game-assets/models/winAnim.glb'
  })

  Transform.create(winAnimB, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })

  Animator.create(winAnimB, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimC, {
    src: 'mini-game-assets/models/winAnim.glb'
  })

  Transform.create(winAnimC, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, -45, 0)
  })

  Animator.create(winAnimC, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimFollow, {
    src: 'mini-game-assets/models/winAnimFollow.glb'
  })

  Transform.create(winAnimFollow, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(0.3, 0.3, 0.3),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0)
  })
  Billboard.create(winAnimFollow, {})

  Animator.create(winAnimFollow, {
    states: [
      {
        clip: 'RaysAnim',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimText, {
    src: 'mini-game-assets/models/winAnimText.glb'
  })

  Animator.create(winAnimText, {
    states: [
      {
        clip: 'Animation',
        playing: false,
        loop: false
      }
    ]
  })

  Transform.create(winAnimText, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(0.8, 0.8, 0.8),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0)
  })
  Billboard.create(winAnimText, {})

  VisibilityComponent.create(winAnimA, { visible: false })
  VisibilityComponent.create(winAnimB, { visible: false })
  VisibilityComponent.create(winAnimC, { visible: false })
  VisibilityComponent.create(winAnimFollow, { visible: false })
  VisibilityComponent.create(winAnimText, { visible: false })

  syncEntity(winAnimA, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimB, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimC, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimFollow, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimText, [VisibilityComponent.componentId, Animator.componentId])
}

export function startWinAnimation(cb: () => void) {
  const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
  for (const [entity] of animations) {
    VisibilityComponent.getMutable(entity).visible = true
    Animator.getMutable(entity).states[0].playing = true
  }

  utils.timers.setTimeout(() => {
    const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
    for (const [entity] of animations) {
      VisibilityComponent.getMutable(entity).visible = false
    }
    cb()
    // console.log('GameData current level: ', gameState.lvl)
    // if (gameState.lvl <= MAX_LEVEL) {
    //   // console.log("playersQueue: ", queue.getQueue())
    //   //add challenge check
    //   if (queue.getQueue().length > 1) {
    //     // queue.setNextPlayer()
    //   } else {
    //     // const nextLevel = Math.min(gameState.lvl + 1, MAX_LEVEL)
    //     // gameButtons[nextLevel - 1].enable()
    //     // startNewLevel(nextLevel)
    //   }
    // }
  }, 8000)
}
