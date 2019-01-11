export class Bootstrap {

  public debug = false

  constructor(
    public readonly args: string[] = process.argv,
    protected readonly exit: (code: number) => void = process.exit,
  ) {}

  start(fn: (args: string[]) => Promise<any>, shouldRun = false) {
    if (!shouldRun) {
      return
    }
    fn(this.args.slice(2))
    .then(() => this.exit(0))
    .catch(err => {
      console.error('Error: %s', this.debug ? err.stack : err.message)
      this.exit(1)
    })
  }
}
