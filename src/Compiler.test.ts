import {Compiler} from './Compiler'
import {StringIterator} from './StringIterator'

describe('Compiler', () => {

  let stream = ''
  function compile() {
    return new Compiler().compile(new StringIterator(stream))
  }

  it('builds a program out of character stream', () => {
    stream = `
target1:
  echo t1
  ls

target2:
  echo t2
  ls -l
`
    const program = compile()
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

  it('fails on error', () => {
    stream = `
target
  bla
`
    expect(() => compile())
    .toThrowError(/\[2, 7\].*colon/)
  })

})
