export type VideoElementType = "video" | "subtitle" | "custom"
import { TIME_DECIMALS_PRECISION } from "../envVariables"

const precision = 10 ** TIME_DECIMALS_PRECISION

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

export class CustomElement extends VideoElement {
  content: string

  constructor(props: CustomElementProps) {
    super(props)
    this.content = props.content
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
  className?: string
  parentId?: string
  containerElementId?: string
}

export class VideoClipElement extends VideoElement {
  source: string
  className?: string
  parentId?: string
  containerElementId?: string

  constructor(props: VideoClipElementProps) {
    super(props)
    this.source = props.source
    this.className = props.className
    this.parentId = props.parentId
    this.containerElementId = props.containerElementId
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
