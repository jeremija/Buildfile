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

  protected async startReading() {
    assert(!this.readable, 'FileIterator should only be used once per file')

    const readable = this.readable = createReadStream(this.filename)
    readable.setEncoding('utf8')

    readable.on('error', err => {
      this.isReadableReject(err)
    })
    readable.on('readable', () => {
      this.isReadableResolve()
    })
    await this.readable
    await this.read()
  }

  protected async read() {
    if (!this.readable) {
      await this.startReading()
    }
    await this.isReadable
    assert.ok(this.readable, 'Cannot get a character when there is no stream')
    this.buffer[0] = this.buffer[1]
    this.buffer[1] = this.readable!.read(1) as string | null
    return this.buffer[0]
  }

  async next(): Promise<string | null> {
    return this.read()
  }

  peek(): string | null {
    return this.buffer[1]
  }

}
