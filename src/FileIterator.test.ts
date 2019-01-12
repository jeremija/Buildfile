import {FileIterator} from './FileIterator'
import {join} from 'path'
import {readFileSync} from 'fs'

describe('FileIterator', () => {

  const filename = join(__dirname, '..', 'test-files', 'test-file.txt')
  it('reads through the whole stream', async () => {
    const i = new FileIterator(filename)
    let buffer = ''
    let peekBuffer = ''
    let c: string | null
    while ((c = await i.next()) !== null) {
      buffer += c
      peekBuffer += i.peek()
    }
    const expected = readFileSync(filename, 'utf8')
    expect(buffer).toEqual(expected)
    expect(peekBuffer).toEqual(expected.substring(1) + 'null')
  })

  it('rejects on error', async () => {
    const i = new FileIterator('/non/existing/filename')
    let error!: Error
    try {
      await i.next()
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/^ENOENT/)
  })

})
