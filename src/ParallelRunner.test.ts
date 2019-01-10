import {Compiler} from './Compiler'
import {ParallelRunner} from './ParallelRunner'
import {StringIterator} from './StringIterator'
import {Target} from './Target'

describe('ParallelRunner', () => {

  let source = `a:
  echo a
b:
  echo b`

  let targets!: Target[]
  beforeEach(async () => {
    const program = await new Compiler().compile(new StringIterator(source))
    targets = Object.keys(program.targets).map(k => program.targets[k])
  })

  it('runs everything in parallel', async () => {
    await new ParallelRunner().run(targets)
  })

})
