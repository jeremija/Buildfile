import {Compiler} from './Compiler'
import {ParallelRunner} from './ParallelRunner'
import {StringIterator} from './StringIterator'
import {IProgram} from './IProgram'

describe('ParallelRunner', () => {

  let source = `a:
  echo a
b:
  echo b`

  let program!: IProgram
  beforeEach(async () => {
    program = await new Compiler().compile(new StringIterator(source))
  })

  it('runs default target', async () => {
    await new ParallelRunner().run(program)
  })

  it('runs everything in parallel', async () => {
    await new ParallelRunner().run(program, ['a', 'b'])
  })

})
