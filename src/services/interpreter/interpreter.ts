import { Node } from "acorn"
import { Visitor } from "./visitor"

export class Interpreter {
  private visitor: Visitor

  constructor(visitor: Visitor) {
    this.visitor = visitor
  }

  async interpret(nodes: Node[]) {
    return await this.visitor.run(nodes)
  }
}
