import InputScale from './index'

export default class Slider {
  is = {
    down: false,
    inside: false,
  }

  private target: Element
  private rect: DOMRect

  constructor(private scale: InputScale) {
    this.pointer(document, 'up')
    this.pointer(document, 'move')
  }

  setup(target: Element) {
    this.target = target
    
    if (this.scale.readonly) return

    for (const name of ['enter', 'down', 'leave'])
      this.pointer(target, name)
  }

  input(ev: PointerEvent) {
    this.rect ??= this.target.getBoundingClientRect()

    const
      { x: x0, y: y0 } = ev,
      { x, y, width, height} = this.rect,
      { count, half, reverse, vertical } = this.scale,
      size = vertical ? height : width,
      point = vertical ? y0 - y : x0 - x
    
    let position = Math.floor(point / (size / count) * 2) / 2

    if (reverse ^ vertical) position = count - position
    else position += .5

    if (!half) position = Math.ceil(position)

    this.scale.input(position)
  }

  enter() {
    this.rect = this.target.getBoundingClientRect()
    this.is.inside = true
  }

  move(ev: PointerEvent) {
    if (this.is.inside || this.is.down)
      this.input(ev)
  }

  down(ev: PointerEvent) {
    if (ev.pointerType == 'mouse' && ev.button != 0)
      return
    
    this.is.down = true
    this.input(ev)
  }

  up(ev: PointerEvent) {
    if (this.is.down) {
      this.is.down = false
      this.scale.change()
    }
  }

  leave() {
    this.is.inside = false
    if (!this.is.down)
      this.scale.clear()
  }

  private pointer(target: EventTarget, name: string) {
    target.addEventListener('pointer' + name, (ev: PointerEvent) => {
      if (!ev.isPrimary) return
      this[name].call(this, ev)
    })
  }
}
