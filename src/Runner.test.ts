import {Compiler} from './Compiler'
import {Runner} from './Runner'
import {StringIterator} from './StringIterator'
import {Target} from './Target'

describe('Runner', () => {

  const source = `a:
  echo a
b:
  echo b`

  let targets!: Target[]
  beforeEach(async () => {
    const program = await new Compiler().compile(new StringIterator(source))
    targets = Object.keys(program.targets).map(k => program.targets[k])
  })

  it('runs everything in parallel', async () => {
    await new Runner().run(targets)
  })

})
