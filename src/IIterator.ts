export interface IIterator<T> {
  next(): T | null
  peek(): T | null
}
