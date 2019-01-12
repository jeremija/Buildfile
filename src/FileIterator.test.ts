import {FileIterator} from './FileIterator'
import {getError} from './TestUtils'
import {join} from 'path'
import {readFileSync} from 'fs'

describe('FileIterator', () => {

  const filename = join(__dirname, '..', 'test-files', 'test-file.txt')
  it('reads through the whole stream', async () => {
    const i = await new FileIterator(filename).open()
    let buffer = ''
    let peekBuffer = ''
    let c: string | null
    while ((c = i.next()) !== null) {
      buffer += c
      peekBuffer += i.peek()
    }
    const expected = readFileSync(filename, 'utf8')
    expect(buffer).toEqual(expected)
    expect(peekBuffer).toEqual(expected.substring(1) + 'null')
  })

  it('rejects on error', async () => {
    const i = new FileIterator('/non/existing/filename')
    const error = await getError(i.open())
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/^ENOENT/)
  })

})
