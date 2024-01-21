/**
 * TODO
 * @see https://web.dev/articles/more-capable-form-controls
 */
export default class CustomInput<T> extends HTMLElement {
  private formValue: T

  get value() {
    return this.formValue
  }

  set value(newValue: T) {
    this.formValue = newValue
  }
}
