import {ProgramExecutor} from './ProgramExecutor'
import {Compiler} from './Compiler'
import {StringIterator} from './StringIterator'

describe('ProgramExecutor', () => {

  async function run(source: string, targets: string[]) {
    const compiler = new Compiler()
    const program = await compiler.compile(new StringIterator(source))
    const executor = new ProgramExecutor()
    await executor.execute(program, targets)
  }

  const source = `a: -p b c
b: d
  echo b
c:
  echo c
d:
  echo d`

  it('executes dependencies and programs', async () => {
    await run(source, [])
  })

})
