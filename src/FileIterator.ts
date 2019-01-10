import assert from 'assert'
import {ICharacterIterator} from './ICharacterIterator'
import {createReadStream} from 'fs'

export class FileIterator implements ICharacterIterator {
  public ended = false
  public readonly isReadable: Promise<void>

  protected isReadableResolve!: () => void
  protected isReadableReject!: (err: Error) => void

  protected readable: NodeJS.ReadableStream | undefined

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
    readable.on('end', () => {
      this.ended = true
    })

    await this.readable
  }

  async next(): Promise<string | null> {
    if (!this.readable) {
      await this.startReading()
    }
    assert.ok(this.readable, 'Cannot get a character when there is no stream')
    await this.isReadable
    return this.readable!.read(1) as string | null
  }

}
