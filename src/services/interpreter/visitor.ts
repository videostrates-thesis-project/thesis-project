/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Node,
  Identifier,
  Literal,
  VariableDeclaration,
  VariableDeclarator,
  CallExpression,
  BinaryExpression,
  ExpressionStatement,
  MemberExpression,
  UnaryExpression,
  AssignmentExpression,
  ArrayExpression,
} from "acorn"
import builtinFunctions from "./builtin"
import { ExecutedFunction } from "./executedScript"

export class Visitor {
  globalScope = new Map<string, any>()
  executedFunctions: ExecutedFunction[] = []

  async run(nodes: Node[]) {
    await this.visitNodes(nodes)
    return this.executedFunctions
  }

  async visitNodes(nodes: Node[]) {
    for (const node of nodes) {
      await this.visitNode(node)
    }
  }

  async visitNode(node: Node): Promise<any> {
    switch (node.type) {
      case "Literal":
        return await this.visitLiteral(node as Literal)
      case "Identifier":
        return await this.visitIdentifier(node as Identifier)
      case "VariableDeclaration":
        return await this.visitVariableDeclaration(node as VariableDeclaration)
      case "VariableDeclarator":
        return await this.visitVariableDeclarator(node as VariableDeclarator)
      case "CallExpression":
        return await this.visitCallExpression(node as CallExpression)
      case "BinaryExpression":
        return await this.visitBinaryExpression(node as BinaryExpression)
      case "ExpressionStatement":
        return await this.visitExpressionStatement(node as ExpressionStatement)
      case "MemberExpression":
        return await this.visitMemberExpression(node as MemberExpression)
      case "UnaryExpression":
        return await this.visitUnaryExpression(node as UnaryExpression)
      case "AssignmentExpression":
        return await this.visitAssignmentExpression(
          node as AssignmentExpression
        )
      case "ArrayExpression":
        return await this.visitArrayExpression(node as ArrayExpression)
      default:
        throw new Error(`Node type ${node.type} does not have a visitor`)
    }
  }

  async visitLiteral(node: Literal) {
    return node.value
  }

  async visitIdentifier(node: Identifier) {
    return this.globalScope.get(node.name) ?? node.name
  }

  async visitVariableDeclaration(node: VariableDeclaration) {
    return await this.visitNodes(node.declarations)
  }

  async visitVariableDeclarator(node: VariableDeclarator) {
    if (!node.init) throw new Error("Variable must be initialized")

    const id = await this.visitNode(node.id)
    const init = (await this.visitNode(node.init)) as any
    this.globalScope.set(id, init)
    return init
  }

  async visitCallExpression(node: CallExpression) {
    const callee = await this.visitIdentifier(node.callee as Identifier)
    const args = []
    for (const arg of node.arguments) {
      const result = await this.visitNode(arg)
      args.push(result)
    }

    console.log(callee, (builtinFunctions as any)[callee as any])
    const func = (builtinFunctions as any)[callee as any]
    if (!func) throw new Error(`Function ${callee} not found`)

    console.log(
      `[CommandProcessor] Calling builtin function ${callee} with args ${args}`
    )
    console.log("CommandProcessor func", func)
    const value = await func(...args)()
    console.log("CommandProcessor func return value", value)
    this.executedFunctions.push({ name: callee, arguments: args })
    return value
  }

  async visitBinaryExpression(node: BinaryExpression) {
    const left = (await this.visitNode(node.left)) as any
    const right = (await this.visitNode(node.right)) as any
    switch (node.operator) {
      case "+":
        return left + right
      case "-":
        return left - right
      case "*":
        return left * right
      case "/":
        return left / right
    }
  }

  async visitExpressionStatement(node: ExpressionStatement) {
    return await this.visitNode(node.expression)
  }

  async visitMemberExpression(node: MemberExpression) {
    const object = (await this.visitNode(node.object)) as any
    const property = (await this.visitNode(node.property)) as any
    return object[property]
  }

  async visitUnaryExpression(node: UnaryExpression) {
    const argument = (await this.visitNode(node.argument)) as any
    switch (node.operator) {
      case "-":
        return -argument
      case "+":
        return +argument
      default:
        throw new Error(`Unknown operator for UnaryExpression ${node.operator}`)
    }
  }

  async visitAssignmentExpression(node: AssignmentExpression) {
    const left = (await this.visitNode(node.left)) as any
    const right = (await this.visitNode(node.right)) as any
    switch (node.operator) {
      case "=":
        this.globalScope.set(left, right)
        return right
      default:
        throw new Error(
          `Unknown operator for AssignmentExpression ${node.operator}`
        )
    }
  }

  async visitArrayExpression(node: ArrayExpression) {
    const results = []
    for (const element of node.elements ?? []) {
      if (!element) continue
      if (element?.type === "SpreadElement") {
        const spreadResult = await this.visitNode(element.argument)
        results.push(spreadResult)
      }
      const result = await this.visitNode(element)
      results.push(result)
    }

    return results
  }
}
