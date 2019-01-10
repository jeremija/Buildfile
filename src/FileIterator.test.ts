import {FileIterator} from './FileIterator'
import {join} from 'path'
import {readFileSync} from 'fs'

describe('FileIterator', () => {

  const filename = join(__dirname, '..', 'test-file.txt')
  it('reads through the whole stream', async () => {
    const i = new FileIterator(filename)
    let buffer = ''
    let c: string | null
    while((c = await i.next()) !== null) {
      buffer += c
    }
    expect(buffer).toEqual(readFileSync(filename, 'utf8'))
  })

})
