import Theme from './theme'
import Slider from './slider'
import InputScaleAttributes from './input-scale-attributes'

export default class InputScale extends InputScaleAttributes {
  root: ShadowRoot

  position = {
    input: undefined as number,
    active: undefined as number,
  }

  private controllers = {
    theme: new Theme(this),
    slider: new Slider(this)
  }

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    if (this.theme)
      this.controllers.theme
        .load(this.theme)
        .then(this.reload.bind(this))
  }

  optionChangedCallback(name: string): void {
    switch (name) {
      case 'theme':
        this.controllers.theme
          .load(this.theme)
          .then(this.reload.bind(this))
        break
      default:
        if (this.controllers.theme.ready)
          this.reload()
    }
  }

  reload() {
    const { svg, sheet } = this.controllers.theme.setup()

    this.root.innerHTML = ''
    this.root.append(svg)
    this.root.adoptedStyleSheets = [sheet]

    this.controllers.slider.setup(svg)
  }

  input(position: number) {
    if (position == this.position.input)
      return
    
    this.position.input = position
    this.controllers.theme.update()
  }

  change() {
    this.position.active = this.position.input
    this.position.input = undefined
    this.controllers.theme.update(true)
  }

  clear() {
    this.position.input = undefined
    this.controllers.theme.update()
  }
}
