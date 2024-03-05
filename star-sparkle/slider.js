export default class Slider {
  is = {
    down: false,
    inside: false,
  }
  
  constructor(host) {
    this.host = host
    
    this.pointer(document, 'up')
    this.pointer(document, 'move')
    for (const name of ['enter', 'down', 'leave'])
      this.pointer(this.host.target, name)
  }

  input(ev) {
    const 
      { target, count } = this.host,
      rect = this.rect ??= target.getBoundingClientRect(),
      position = (ev.x - rect.x) / (rect.width / count)

    this.host.input(Math.floor(position))
  }

  enter() {
    this.rect = this.host.target.getBoundingClientRect()
    this.is.inside = true
  }

  move(ev) {
    if (this.is.inside || this.is.down)
      this.input(ev)
  }

  down(ev) {
    if (ev.pointerType == 'mouse' && ev.button != 0)
      return
    
    this.is.down = true
    this.input(ev)
  }

  up() {
    if (this.is.down) {
      this.is.down = false
      this.host.change()
    }
  }

  leave() {
    this.is.inside = false
    if (!this.is.down)
      this.host.clear()
  }

  pointer(target, name) {
    target.addEventListener('pointer' + name, (ev) => {
      if (!ev.isPrimary) return
      this[name].call(this, ev)
    })
  }
}
