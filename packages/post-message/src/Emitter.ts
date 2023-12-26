/**
 * 事件收集管理
 */
export default class Emitter {
  _events: Map<string, Set<Function>>

  constructor() {
    this._events = new Map()
  }
  off(evtName: string, fn?: Function) {
    const target = this._events.get(evtName)
    if (!target) {
      return
    }
    if (fn) {
      target.delete(fn)
    } else {
      Array.from(target).forEach((fn) => target.delete(fn))
    }
  }
  offAll() {
    for (let evtName of this._events.keys()) {
      this.off(evtName)
    }
  }
  on(evtName: string, fn: Function) {
    let target = this._events.get(evtName)
    if (!target) {
      this._events.set(evtName, (target = new Set()))
    }
    target.add(fn)

    return this
  }
  trigger(evtName: string, param: unknown) {
    const target = this._events.get(evtName)
    if (target) return Promise.all(Array.from(target).map((fn) => fn(param)))
  }
  listen(listeners: Record<string, Function>) {
    for (let key in listeners) {
      this.on(key, listeners[key])
    }
    return this
  }
}
