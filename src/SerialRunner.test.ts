import {Compiler} from './Compiler'
import {SerialRunner} from './SerialRunner'
import {StringIterator} from './StringIterator'
import {Target} from './Target'

describe('SerialRunner', () => {

  let source = `a:
  echo a
b:
  echo b`

  let targets!: Target[]
  beforeEach(async () => {
    const program = await new Compiler().compile(new StringIterator(source))
    targets = Object.keys(program.targets).map(k => program.targets[k])
  })

  it('runs everything serially', async () => {
    await new SerialRunner().run(targets)
  })

})
