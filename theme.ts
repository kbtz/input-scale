import InputScale from './input-scale'
import style from './theme.css?inline'

export default class Theme {
  constructor(private scale: InputScale) { }

  private source: SVGSVGElement

  root: SVGSVGElement
  marks: SVGElement[]
  halfs: SVGElement[][]

  async load(svgPathOrSource: string) {
    this.source = await this.parseSVG(svgPathOrSource)
  }

  setup() {
    const
      { half, count, reverse, vertical } = this.scale,
      svg = this.source.cloneNode(true) as SVGSVGElement,
      mark = svg.firstElementChild,
      transform = mark.getAttribute('transform'),
      viewBox = svg.getAttribute('viewBox')

    this.root = svg
    this.marks = []
    this.halfs = []

    let
      [x, y, w, h] = viewBox.split(' ').map(v => +v),
      size = vertical ? h : w

    if (vertical) h *= count
    else w *= count

    svg.setAttribute('viewBox', [x, y, w, h].join(' '))

    const gMarks = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gMarks.classList.add('marks')
    mark.classList.add('mark')
    mark.remove()

    if (transform) {
      mark.removeAttribute('transform')
      gMarks.setAttribute('transform', transform)
    }

    let properties = ''
    for (let i = 0; i < count; i++) {
      let transform = 'translate' + (vertical ? 'Y' : 'X')
      transform += `(${size * i}px)`

      properties += /* css */`
        .mark:nth-child(${i + 1}) {
          --i: ${i};
          transform: ${transform};
        }
      `

      const clone = mark.cloneNode(true) as SVGElement

      if (half) this.halfs.push([
        clone.querySelector('.start'),
        clone.querySelector('.end'),
      ])

      this.marks.push(clone)
    }

    gMarks.append(...this.marks)
    svg.prepend(gMarks)

    const sheet = new CSSStyleSheet()
    sheet.replace(/* css */`
      :host {
        --count: ${count};
        --size: ${size / count};
      }
      .marks {
        ${properties}
      }
    ` + style)

    const
      modes = { half, reverse, vertical},
      classes = svg.classList
    
    for (const mode in modes)
      if (modes[mode] ^ +classes.contains(mode))
        classes.toggle(mode)

    return { svg, sheet }
  }

  update(animate = false) {
    if (animate) {
      for (const active of this.root.querySelectorAll('.active'))
        active.classList.remove('active')
      
      requestAnimationFrame(this.computeFlags.bind(this))
    } else {
      this.computeFlags()
    }
  }

  private computeFlags() {
    const
      { count, position: { active = 0, input } } = this.scale,
      from = active * 2, to = input * 2,
      start = Math.min(from, to), end = Math.max(from, to),
      direction = from <= to ? 'enter' : 'leave'

    let previous: flags, current: flags
    for (let i = 0; i < count * 2; i++) {
      const insideInput = i >= start && i < end
      current = {
        active: i < from,
        enter: insideInput && direction == 'enter',
        leave: insideInput && direction == 'leave',
      }
      
      if (i % 2) {
        this.updateFlags((i - 1) / 2, previous, current)
      } else {
        previous = current
      }
    }
  }

  private updateFlags(index: number, start: flags, end: flags) {
    this.updateClasses(this.marks[index], {
      active: start.active,
      enter: start.enter || end.enter,
      leave: start.leave || end.leave
    })

    if (!this.scale.half) return
    
    const halfs = this.halfs[index] ?? []
    this.updateClasses(halfs[0], start)
    this.updateClasses(halfs[1], end)
  }

  private updateClasses(target: SVGElement, flags: flags) {
    if (!target) return

    const classes = target.classList
    for (const name in flags)
      if (+flags[name] ^ +classes.contains(name)) 
        classes.toggle(name)
  }

  private async parseSVG(svgPathOrSource: string) {
    let source: string, svg: SVGSVGElement
    if (svgPathOrSource.trimStart().slice(0, 4) == '<svg') {
      source = svgPathOrSource
    } else {
      const response = await fetch(svgPathOrSource)
  
      if (!response.ok)
        throw 'Failed to load a file from ' + svgPathOrSource
  
      source = await response.text()
    }
  
    const template = document.createElement('template')
    template.innerHTML = source
  
    svg = template.content.firstElementChild.cloneNode(true) as SVGSVGElement
  
    if (svg.tagName !== 'svg')
      throw 'Failed to parse a SVG from this file ' + svgPathOrSource
  
    if (!svg.getAttribute('viewBox'))
      throw 'Your SVG must have a viewBox'
  
    if (svg.firstElementChild.tagName == 'style')
      throw 'Your theme\'s repeatable mark must the first element'
  
    return svg
  }
}
