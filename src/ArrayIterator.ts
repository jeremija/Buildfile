import {IIterator} from './IIterator'

export class ArrayIterator<T> implements IIterator<T> {
  protected position = -1
  constructor(protected readonly array: T[]) {}

  next(): T | null {
    const position = this.position += 1
    if (this.position >= this.array.length) {
      return null
    }
    return this.array[position]
  }

  peek(): T | null {
    const position = this.position + 1
    if (position >= this.array.length) {
      return null
    }
    return this.array[position]
  }
}
