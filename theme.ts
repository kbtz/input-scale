import InputScale from './input-scale'
import style from './theme.css?inline'

export default class Theme {
  constructor(private scale: InputScale) { }

  private source: SVGSVGElement

  root: SVGSVGElement
  marks: SVGElement[]
  ready = false

  async load(svgPathOrSource: string) {
    this.source = await this.parseSVG(svgPathOrSource)
    this.ready = true
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
      let position = reverse ^ vertical ? count-1 - i : i
      properties += /* css */`
      .mark:nth-child(${i + 1}) {
        --i: ${i};
        transform: translate${vertical ? 'Y' : 'X'}(${size * position}px);
      }`

      const clone = mark.cloneNode(true) as SVGElement

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
      for (const mark of this.marks)
        mark.classList.remove('active')
      
      requestAnimationFrame(this.computeFlags.bind(this))
    } else {
      this.computeFlags()
    }
  }

  private computeFlags() {
    const
      { count, position: { active = 0, input = active } } = this.scale,
      from = active * 2, to = input * 2,
      start = Math.min(from, to), end = Math.max(from, to),
      direction = from <= to ? 'enter' : 'leave'

    let previous: flags, current: flags
    for (let i = 0; i < count * 2; i++) {
      const changing = i >= start && i < end
      current = {
        active: i < from,
        enter: changing && direction == 'enter',
        leave: changing && direction == 'leave',
      }
      
      if (i % 2) {
        this.updateFlags((i - 1) / 2, previous, current)
      } else {
        previous = current
      }
    }
  }

  private updateFlags(index: number, start: flags, end: flags) {
    const
      flags = {
        hover: index+1 == Math.ceil(this.scale.position.input),
        active: start.active,
        enter: start.enter && end.enter,
        leave: start.leave && end.leave
      }

    if (this.scale.half)
      Object.assign(flags, {
        'active-start': start.active && !end.active,
        'enter-start': start.enter && !end.enter,
        'leave-start': start.leave && !end.leave,
        'leave-end': !start.leave && end.leave,
      })

    const classes = this.marks[index].classList
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
