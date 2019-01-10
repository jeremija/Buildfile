import {Compiler} from './Compiler'
import {ProgramExecutor} from './ProgramExecutor'
import {StringIterator} from './StringIterator'
import {getError} from './TestUtils'

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

  it('fails when target does not exist', async () => {
    const source = `a: b`
    const error = await getError(run(source, []))
    expect(error.message).toMatch(/unknown target: b/i)
  })

})
