import {ConsoleLogger} from './ConsoleLogger'
import {MemoryWritableStream} from './TestUtils'

describe('ConsoleLogger', () => {

  describe('constructor', () => {
    it('uses stdout/stderr by default', () => {
      const cl = new ConsoleLogger()
      expect(cl.stdout).toEqual(process.stdout)
      expect(cl.stderr).toEqual(process.stderr)
    })
  })

  let stdout!: MemoryWritableStream
  let stderr!: MemoryWritableStream
  function create() {
    stdout = new MemoryWritableStream()
    stderr = new MemoryWritableStream()
    return new ConsoleLogger(stdout, stderr)
  }

  describe('log', () => {
    it('logs messages to stdout stream', () => {
      create().log('Hi %s %s!', 'John', 'Cusack')
      expect(stdout.getData()).toEqual('Hi John Cusack!')
    })

    it('handles Buffers', () => {
      const b = Buffer.from('test string')
      create().log(b)
      expect(stdout.getData()).toEqual('test string')
    })
  })

  describe('error', () => {
    it('logs messages to stdout stream', () => {
      create().error('Hi %s %s!', 'John', 'Cusack')
      expect(stderr.getData()).toEqual('Hi John Cusack!')
    })
    it('handles Buffers', () => {
      const b = Buffer.from('test string')
      create().error(b)
      expect(stderr.getData()).toEqual('test string')
    })
  })

})
