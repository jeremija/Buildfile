import {ICharacterIterator} from './ICharacterIterator'

export class StringIterator implements ICharacterIterator {
  protected position = -1
  constructor(public readonly str: string) {}

  next(): string | null {
    const position = this.position += 1
    if (this.position >= this.str.length) {
      return null
    }
    return this.str.charAt(position)
  }

  peek(): string | null {
    const position = this.position + 1
    if (position + 1 >= this.str.length) {
      return null
    }
    return this.str.charAt(position)
  }
}
