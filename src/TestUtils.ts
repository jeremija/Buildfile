import {Writable} from 'stream'

export async function getError(promise: Promise<any>): Promise<Error> {
  let error: Error | undefined
  try {
    await promise
  } catch (err) {
    error = err
  }
  expect(error).toBeTruthy()
  return error!
}

export class MemoryWritableStream extends Writable {
  protected data = ''

  _write(chunk: any, encoding: string, done: (error?: Error | null) => void) {
    this.data += chunk
  }

  getData() {
    return this.data
  }
}
