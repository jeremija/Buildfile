import {Compiler} from './Compiler'
import {Environment} from './Environment'
import {StringIterator} from './StringIterator'

describe('Compiler', () => {

  let environment!: Environment
  beforeEach(() => {
    environment = new Environment({})
  })

  let stream = ''
  function compile() {
    return new Compiler(environment).compile(new StringIterator(stream))
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

  it('it sets variables', () => {
    stream = `a ?= 1
PATH := test1
PATH ?= test2`
    compile()
    expect(environment.get('a')).toEqual('1')
    expect(environment.get('PATH')).toEqual('test1')
  })

  it('sets variable on a single line', () => {
    stream = `a := 1`
    compile()
    expect(environment.get('a')).toEqual('1')
  })

  it('sets blank variable', () => {
    stream = `a := `
    compile()
    expect(environment.get('a')).toEqual('')
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
