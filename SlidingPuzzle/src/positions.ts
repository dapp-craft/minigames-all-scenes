import { TransformType } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

export const levelButtons: {[key: number]: Partial<TransformType>} = {
  1: {
    position: Vector3.create(3.26442813873291, 4.049124240875244, -6.914530277252197)
  },
  3: {
    position: Vector3.create(3.26442813873291, 3.549124240875244, -6.914530277252197)
  },
  5: {
    position: Vector3.create(3.26442813873291, 3.049124240875244, -6.914530277252197)
  },
  7: {
    position: Vector3.create(3.26442813873291, 2.549124240875244, -6.914530277252197)
  },
  9: {
    position: Vector3.create(3.26442813873291, 2.049124240875244, -6.914530277252197)
  },
  2: {
    position: Vector3.create(2.6515331268310547, 4.049124240875244, -6.914530277252197)
  },
  4: {
    position: Vector3.create(2.6515331268310547, 3.549124240875244, -6.914530277252197)
  },
  6: {
    position: Vector3.create(2.6515331268310547, 3.049124240875244, -6.914530277252197)
  },
  8: {
    position: Vector3.create(2.6515331268310547, 2.549124240875244, -6.914530277252197)
  }
}

export const sfxButton = {
  position: Vector3.create(-2.6513805389404297, 1.7783178091049194, -6.914530277252197)
}

export const exitButton = {
  position: Vector3.create(-2.957981586456299, 1.2783178091049194, -6.914530277252197)
}

export const musicButton = {
  position: Vector3.create(-3.264582633972168, 1.7783178091049194, -6.914530277252197)
}

export const restartButton = {
  position: Vector3.create(2.6515331268310547, 1.3005372285842896, -6.914530277252197)
}

export const timer = {
  position: Vector3.create(-2.957981586456299, 4.053521156311035, -6.914530277252197)
}

export const steps = {
  position: Vector3.create(-2.957981586456299, 3.552783727645874, -6.914530277252197)
}

export const name = {
  position: Vector3.create(0, 5.161755561828613, -6.905980110168457)
}
