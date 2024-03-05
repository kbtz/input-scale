import style from './template.css?inline'

const template = document.createElement('template')
template.innerHTML = /* html */`
<svg viewBox="-12 -12 24 24">
  <g>
    <path class="sparkle" />
    <g class="star">    
      <path class="fill" />
      <path class="outline" />
    </g>
  </g>
</svg>
`

export default class Template {
  constructor(host) {
    const
      svg =  template.content.firstElementChild.cloneNode(true),
      wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
      mark = svg.firstElementChild, marks = [],
      sheet = new CSSStyleSheet(), count = host.count,
      [x, y, w, h] = svg.getAttribute('viewBox').split(' ')

    svg.setAttribute('viewBox', [x, y, w * count, h].join(' '))
    
    mark.remove()

    for (let i = 0; i < count; i++) {
      const clone = mark.cloneNode(true)
      clone.classList.add('mark')
      clone.style.setProperty('--i', i)
      clone.setAttribute('transform', `translate(${w * i} 0)`)

      marks.push(clone)
      wrapper.append(clone)
    }

    svg.prepend(wrapper)
    sheet.replace(style)

    host.shadowRoot.innerHTML = ''
    host.shadowRoot.prepend(svg)
    host.shadowRoot.adoptedStyleSheets = [sheet]

    Object.assign(this, { host, marks })
  }

  update(animate) {
    if (animate) {
      this.marks.forEach(m => m.classList.remove('active'))
      requestAnimationFrame(() => this.update())
      return
    }

    const { input, current } = this.host.position
    this.marks.forEach((m, i) => {
      if (i <= current ^ m.classList.contains('active'))
        m.classList.toggle('active')
      if ((
        (input > current && i > current && i <= input) ||
        (input < current && i <= current && i > input)
      ) ^ m.classList.contains('fade'))
        m.classList.toggle('fade')
    })
  }
}
