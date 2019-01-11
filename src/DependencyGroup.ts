export class DependencyGroup {
  public readonly targetNames: string[] = []

  addTarget(targetName: string) {
    this.targetNames.push(targetName)
  }
}
