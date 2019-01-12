import assert from 'assert'
import {ICharacterIterator} from './ICharacterIterator'
import {createReadStream} from 'fs'

export class FileIterator implements ICharacterIterator {
  public readonly isReadable: Promise<void>

  protected isReadableResolve!: () => void
  protected isReadableReject!: (err: Error) => void

  protected readable: NodeJS.ReadableStream | undefined
  protected readonly buffer: Array<string | null> = [null, null]

  constructor(public readonly filename: string) {
    this.isReadable = new Promise((resolve, reject) => {
      this.isReadableResolve = resolve
      this.isReadableReject = reject
    })
  }

  async open(): Promise<this> {
    assert(!this.readable, 'FileIterator should only be used once per file')

    const readable = this.readable = createReadStream(this.filename)
    readable.setEncoding('utf8')

    readable.on('error', err => {
      this.isReadableReject(err)
    })
    readable.on('readable', () => {
      this.isReadableResolve()
    })
    await this.isReadable
    // read first character into the buffer
    this.next()
    return this
  }

  next(): string | null {
    assert.ok(this.readable, 'No readable stream. Did you call open()?')
    this.buffer[0] = this.buffer[1]
    this.buffer[1] = this.readable!.read(1) as string | null
    return this.buffer[0]
  }

  peek(): string | null {
    return this.buffer[1]
  }

}
