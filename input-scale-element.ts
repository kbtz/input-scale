import CustomInput from './custom-input'

/**
 * Boilerplate for handling attribute and option changes
 */
export default abstract class InputScaleAttributes extends CustomInput<number> {  
  static defaults = {
    min: 1, max: 5,
    theme: undefined as string,
    half: 1 as bit,
    reverse: 0 as bit,
    vertical: 0 as bit,
    readonly: 0 as bit
  }

  static observedAttributes = [
    'value', 'count',
    ...Object.keys(InputScaleAttributes.defaults)
  ]
  
  protected options = Object.assign({}, InputScaleAttributes.defaults)

  get count() {
    return this.options.max - (this.options.min - 1)
  }

  set count(value) {
    if (value <= 0) return
    this.option('max', this.options.min + value - 1)
  }

  get min() { return this.options.min }
  set min(value) {
    this.option('min', Math.min(this.options.max, +value))
  }

  get max() { return this.options.max }
  set max(value) {
    this.option('max', Math.max(this.options.min, +value))
  }

  get theme() { return this.options.theme }
  set theme(value) {
    this.option('theme', value)
  }

  get half() { return this.options.half }
  set half(value) {
    this.option('half', +Boolean(value))
  }
  
  get reverse() { return this.options.reverse }
  set reverse(value) {
    this.option('reverse', +Boolean(value))
  }

  get vertical() { return this.options.vertical }
  set vertical(value) {
    this.option('vertical', +Boolean(value))
  }
  
  get readonly() { return this.options.readonly }
  set readonly(value) {
    this.option('readonly', +Boolean(value))
  }

  private option(name: string, newValue: any) {
    if (this.options[name] !== newValue) {
      this.options[name] = newValue
      this.optionChangedCallback(name)
    }
  }

  abstract optionChangedCallback(name: string): void

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name == 'value' && this.value != +newValue) {
      this.value = +newValue
      this.optionChangedCallback('value')
    } else {
      this[name] = newValue
    }
  }
}
