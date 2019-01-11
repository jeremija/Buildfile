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
  })

})
