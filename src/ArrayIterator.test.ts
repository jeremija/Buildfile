import {ArrayIterator} from './ArrayIterator'

describe('ArrayIterator', () => {

  const test = [1, 2, 3]

  it('iterates through the string', () => {
    const i = new ArrayIterator(test)
    const values: number[] = []
    let c: number | null
    while ((c = i.next()) !== null) {
      values.push(c)
    }
    expect(values).toEqual(test)
    expect(i.peek()).toEqual(null)
  })

  describe('peek', () => {
    it('returns the next value synchronously', () => {
      const i = new ArrayIterator(test)
      expect(i.next()).toEqual(1)
      expect(i.peek()).toEqual(2)
      expect(i.peek()).toEqual(2)

      expect(i.next()).toEqual(2)
      expect(i.peek()).toEqual(3)

      expect(i.next()).toEqual(3)
      expect(i.peek()).toEqual(null)

      expect(i.next()).toEqual(null)
      expect(i.peek()).toEqual(null)
    })
  })

})
