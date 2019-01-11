import {Compiler} from './Compiler'
import {ProgramExecutor} from './ProgramExecutor'
import {StringIterator} from './StringIterator'

describe('ProgramExecutor', () => {

  async function run(src: string, targets: string[]) {
    const compiler = new Compiler()
    const program = await compiler.compile(new StringIterator(src), targets)
    const executor = new ProgramExecutor()
    await executor.execute(program)
  }

  const source = `a: -p b test_c
b: test_d
  echo b
test_c:
  echo c
test_d:
  echo d`

  it('executes dependencies and programs', async () => {
    await run(source, [])
  })

  it('can execute custom targets', async () => {
    await run(source, ['test_d'])
  })

  it('can execute wildcard targets', async () => {
    await run(source, ['test_*'])
  })

  it('can execute wildcard targets in parallel', async () => {
    await run(source, ['-p', 'test_*'])
  })

})
