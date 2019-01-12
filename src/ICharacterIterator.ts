export interface ICharacterIterator {
  next(): Promise<string | null> | string | null
  peek(): string | null
}
