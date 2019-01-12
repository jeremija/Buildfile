import {StringIterator} from './StringIterator'

describe('StringIterator', () => {

  const test = `this
is
a
test`

  it('iterates through the string', () => {
    const i = new StringIterator(test)
    let buffer = ''
    let c: string | null
    while ((c = i.next()) !== null) {
      buffer += c
    }
    expect(buffer).toEqual(test)
    expect(i.peek()).toEqual(null)
  })

  describe('peek', () => {
    it('returns the next value synchronously', () => {
      const i = new StringIterator(test)
      expect(i.next()).toEqual('t')
      expect(i.peek()).toEqual('h')
      expect(i.peek()).toEqual('h')
      expect(i.peek()).toEqual('h')

      expect(i.next()).toEqual('h')
      expect(i.peek()).toEqual('i')

      expect(i.next()).toEqual('i')
      expect(i.peek()).toEqual('s')

      expect(i.next()).toEqual('s')
      expect(i.peek()).toEqual('\n')
    })
  })

})
