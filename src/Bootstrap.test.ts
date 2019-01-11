import {Bootstrap} from './Bootstrap'
import {getError} from './TestUtils'

describe('Bootstrap', () => {

  describe('constructor', () => {
    it('sets process.argv arguments by default', () => {
      const bootstrap = new Bootstrap()
      expect(bootstrap.args).toEqual(process.argv)
    })
  })

  describe('start', () => {
    it('calls exit with 0 when no errors', async () => {
      const p = Promise.resolve()
      const fn = jest.fn().mockImplementation(() => p)
      const exit = jest.fn()
      new Bootstrap(['one', 'two', 'three', 'four'], exit).start(fn, true)
      await p
      expect(fn.mock.calls).toEqual([[['three', 'four']]])
      expect(exit.mock.calls).toEqual([[ 0 ]])
    })

    it('does nothing when shouldRun = false', () => {
      const fn = jest.fn()
      const exit = jest.fn()
      new Bootstrap(['one', 'two', 'three', 'four'], exit).start(fn)
      expect(fn.mock.calls.length).toBe(0)
    });

    [true, false].forEach(debug => {
      it('calls exit with 0 when no errors', async () => {
        const p = Promise.reject(new Error('test'))
        const fn = jest.fn().mockImplementation(() => p)
        const exit = jest.fn()
        const b = new Bootstrap(['one', 'two', 'three', 'four'], exit)
        b.debug = debug
        b.start(fn, true)
        await getError(p)
        expect(fn.mock.calls).toEqual([[['three', 'four']]])
        expect(exit.mock.calls).toEqual([[ 1 ]])
      })
    })

  })

})
