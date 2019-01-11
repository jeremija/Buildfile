export class Wildcard {

  public readonly regex: RegExp

  constructor(readonly wildcardPattern: string) {

    let pattern = '^'
    for (let i = 0; i < wildcardPattern.length; i++) {
      const c = wildcardPattern.charAt(i)
      pattern += c === '*' ? '.*' : c
    }
    pattern += '$'

    this.regex = new RegExp(pattern)
  }

  match(strings: string[]): string[] {
    const result = strings.filter(s => this.regex.test(s))
    if (!result.length) {
      throw new Error(`No match found for "${this.wildcardPattern}"`)
    }
    return result
  }
}
