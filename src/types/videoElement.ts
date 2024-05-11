export type VideoElementType = "video" | "custom"
import { TIME_DECIMALS_PRECISION } from "../envVariables"

const precision = 10 ** TIME_DECIMALS_PRECISION

export interface EqualityCheckResult {
  equal: boolean
  reason?: string
}

export interface VideoElementProps {
  id: string
  name: string
  start: number
  end: number
  nodeType: string
  offset: number
  type: VideoElementType
  outerHtml?: string
  layer: number
  speed: number
}

export class VideoElement {
  id: string
  name: string
  _start: number
  _end: number
  nodeType: string
  _offset: number
  type: VideoElementType
  outerHtml?: string
  layer: number
  speed: number

  constructor(props: VideoElementProps) {
    this.id = props.id
    this.name = props.name
    this._start = props.start
    this._end = props.end
    this.nodeType = props.nodeType
    this._offset = props.offset
    this.type = props.type
    this.outerHtml = props.outerHtml
    this.layer = props.layer
    this.speed = props.speed
  }

  get start() {
    return this._start
  }
  set start(value: number) {
    this._start = Math.round(value * precision) / precision
  }

  get end() {
    return this._end
  }
  set end(value: number) {
    this._end = Math.round(value * precision) / precision
  }

  get offset() {
    return this._offset
  }
  set offset(value: number) {
    this._offset = Math.round(value * precision) / precision
  }

  public equals(other: VideoElement): EqualityCheckResult {
    // return (
    //   // this.id === other.id &&
    //   this.name === other.name &&
    //   this.start === other.start &&
    //   this.end === other.end &&
    //   this.nodeType === other.nodeType &&
    //   this.offset === other.offset &&
    //   this.type === other.type &&
    //   // this.outerHtml === other.outerHtml &&
    //   // this.layer === other.layer &&
    //   this.speed === other.speed
    // )
    if (this.name !== other.name) {
      return { equal: false, reason: `name, ${this.name} <> ${other.name}` }
    }
    if (this.start !== other.start) {
      return { equal: false, reason: `start, ${this.start} <> ${other.start}` }
    }
    if (this.end !== other.end) {
      return { equal: false, reason: `end, ${this.end} <> ${other.end}` }
    }
    if (this.nodeType !== other.nodeType) {
      return {
        equal: false,
        reason: `nodeType, ${this.nodeType} <> ${other.nodeType}`,
      }
    }
    if (this.offset !== other.offset) {
      return {
        equal: false,
        reason: `offset, ${this.offset} <> ${other.offset}`,
      }
    }
    if (this.type !== other.type) {
      return { equal: false, reason: `type, ${this.type} <> ${other.type}` }
    }
    if (this.speed !== other.speed) {
      return { equal: false, reason: `speed, ${this.speed} <> ${other.speed}` }
    }

    return { equal: true }
  }

  clone() {
    return new VideoElement({
      id: this.id,
      name: this.name,
      start: this.start,
      end: this.end,
      nodeType: this.nodeType,
      offset: this.offset,
      type: this.type,
      outerHtml: this.outerHtml,
      layer: this.layer,
      speed: this.speed,
    })
  }
}

interface CustomElementProps extends VideoElementProps {
  content: string
}

export type CustomElementDict = CustomElementProps & {
  _start: number
  _end: number
  _offset: number
}

export class CustomElement extends VideoElement {
  content: string

  constructor(props: CustomElementProps) {
    super(props)
    this.content = props.content
  }

  static fromDict(c: CustomElementDict) {
    return new CustomElement({
      ...(c as CustomElement),
      start: c._start,
      end: c._end,
      offset: c._offset,
    })
  }

  public equals(other: CustomElement): EqualityCheckResult {
    const result = super.equals(other)
    if (!result.equal) {
      return result
    }
    if (this.content?.trim() != other.content?.trim()) {
      // replace new lines
      return {
        equal: false,
        reason: `content, ${this.content?.trim()?.replace(/\n/g, " ")} <> ${other.content?.trim()?.replace(/\n/g, " ")}`,
      }
    }

    return { equal: true }
  }

  clone() {
    return new CustomElement({
      id: this.id,
      name: this.name,
      start: this.start,
      end: this.end,
      nodeType: this.nodeType,
      offset: this.offset,
      type: this.type,
      outerHtml: this.outerHtml,
      layer: this.layer,
      speed: this.speed,
      content: this.content,
    })
  }
}

interface VideoClipElementProps extends VideoElementProps {
  source: string
  className: string
  parentId?: string
  containerElementId?: string
}

export class VideoClipElement extends VideoElement {
  source: string
  className: string
  parentId?: string
  containerElementId?: string

  constructor(props: VideoClipElementProps) {
    super(props)
    this.source = props.source
    this.className = props.className
    this.parentId = props.parentId
    this.containerElementId = props.containerElementId
  }

  public equals(other: VideoClipElement): EqualityCheckResult {
    // return (
    //   super.equals(other) &&
    //   this.source === other.source &&
    //   this.className?.trim() === other.className?.trim() &&
    //   this.parentId === other.parentId
    //   // this.containerElementId === other.containerElementId
    // )

    const result = super.equals(other)
    if (!result.equal) {
      return result
    }
    if (this.source != other.source) {
      return {
        equal: false,
        reason: `source, ${this.source} <> ${other.source}`,
      }
    }
    if (this.className?.trim() != other.className?.trim()) {
      return {
        equal: false,
        reason: `className, ${this.className?.trim()} <> ${other.className?.trim()}`,
      }
    }
    if (this.parentId != other.parentId) {
      return {
        equal: false,
        reason: `parentId, ${this.parentId} <> ${other.parentId}`,
      }
    }

    return { equal: true }
  }

  clone() {
    return new VideoClipElement({
      id: this.id,
      name: this.name,
      start: this.start,
      end: this.end,
      nodeType: this.nodeType,
      offset: this.offset,
      type: this.type,
      outerHtml: this.outerHtml,
      layer: this.layer,
      speed: this.speed,
      source: this.source,
      className: this.className,
      parentId: this.parentId,
      containerElementId: this.containerElementId,
    })
  }
}
