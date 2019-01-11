import {Compiler} from './Compiler'
import {StringIterator} from './StringIterator'

describe('Compiler', () => {

  let stream = ''
  async function compile() {
    return new Compiler().compile(new StringIterator(stream))
  }

  it('builds a program out of character stream', async () => {
    stream = `
target1:
  echo t1
  ls

target2:
  echo t2
  ls -l
`
    const program = await compile()
    expect(program.targetNames).toEqual(['target1', 'target2'])
    expect(program.targets.target1.commands).toEqual([
      {value: 'echo t1'},
      {value: 'ls'},
    ])
    expect(program.targets.target2.commands).toEqual([
      {value: 'echo t2'},
      {value: 'ls -l'},
    ])
  })

  it('fails on error', async () => {
    stream = `
target
  bla
`
    let error: Error | undefined
    try {
      await compile()
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error!.message).toMatch(/\[2, 7\].*colon/)
  })

})
