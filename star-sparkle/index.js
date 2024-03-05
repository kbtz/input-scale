import Template from './template.js'
import Slider from './slider.js'

class StarSparkle extends HTMLElement {
  static observedAttributes = ["count", "value"]

  count = 5
  value = 0
  
  position = {
    input: -1,
    current: -1
  }

  get target() {
    return this.shadowRoot.firstElementChild
  }
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  attributeChangedCallback(name, _, value) {
    if (this.connected) return
    if (StarSparkle.observedAttributes.includes(name))
      this[name] = +value
  }

  connectedCallback() {
    Object.assign(this,  {
      connected: true,
      template: new Template(this),
      slider: new Slider(this)
    })
  }

  input(value) {
    if (this.position.input == value) return
    this.position.input = value
    
    this.template.update()
    this.dispatchEvent(
      new InputEvent('input', this)
    )
  }

  change() {
    this.value = this.position.input
    this.position.current = this.value

    this.template.update(true)
    this.dispatchEvent(new Event('change'))
  }
  
  clear() {
    const
      { position } = this,
      changed = position.input != position.current
    
    position.input = undefined
    
    this.template.update()

    if (changed) this.dispatchEvent(
      new InputEvent('input', this)
    )
  }
}

customElements.define('star-sparkle', StarSparkle)
