import {Compiler} from './Compiler'
import {SerialRunner} from './SerialRunner'
import {StringIterator} from './StringIterator'
import {IProgram} from './IProgram'

describe('SerialRunner', () => {

  let source = `a:
  echo a
b:
  echo b`

  let program!: IProgram
  beforeEach(async () => {
    program = await new Compiler().compile(new StringIterator(source))
  })

  it('runs default target', async () => {
    await new SerialRunner().run(program)
  })

  it('runs everything in series', async () => {
    await new SerialRunner().run(program, ['a', 'b'])
  })

})
