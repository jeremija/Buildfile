import {EntryType} from './EntryType'

export class Entry {
  constructor(
    readonly type: EntryType,
    readonly value: string,
  ) {}
}


