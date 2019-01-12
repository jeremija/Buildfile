import assert from 'assert'
import {IProgram} from './IProgram'
import {Runner} from './Runner'
import {Target} from './Target'
import {out} from './config'

export class ProgramExecutor {

  async execute(program: IProgram) {
    await this.executeTargets(program, [program.mainTarget])
  }

  protected async executeTargets(program: IProgram, targets: string[]) {
    out.log('==> %s', targets)

    const selectedTargets = targets.map(t => {
      assert.ok(
        program.targets.hasOwnProperty(t),
        `Unknown target: ${t}`,
      )
      return program.targets[t]
    })

    await this.executeDependencies(program, selectedTargets)

    const runner = new Runner()
    await runner.run(selectedTargets)
  }

  protected async executeDependencies(program: IProgram, targets: Target[]) {
    for (const target of targets) {
      for (const dependencyGroup of target.dependencyGroups) {
        if (dependencyGroup.targetNames.length) {
          await this.executeTargets(program, dependencyGroup.targetNames)
        }
      }
    }
  }

}
