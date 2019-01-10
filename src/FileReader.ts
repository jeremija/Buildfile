import {ITargetReader} from './ITargetReader'

class FileReader implements ITargetReader {
  constructor(public readonly filename: string) {}
  public readFile(stream: NodeJS.ReadableStream) {
  }
}
