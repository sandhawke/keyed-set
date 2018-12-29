// New version, using one Map instead of two KeyedMaps. Simpler, and
// also keeps the events in the same order, although that shouldn't
// matter.

class SmartPatch {
  constructor (base, ...values) {
    this.cleared = false
    this.todo = new Map() // key -> Event
    this.push(...values)
  }
  push (...evs) {
    for (const event of evs) {
      const { type, key } = event
      if (type === 'clear') {
        this.cleared = true
        this.todo.clear()
      } else if (type === 'add' || type === 'delete') {
        const previousSameKey = this.todo.get(key)
        if (previousSameKey) {
          if (previousSameKey.type === type) {
            throw Error() // the Set should never generate this event
          } else {
            this.todo.delete(key) // cancel both the previous and this one
          }
        } else {
          this.todo.set(key, event)
        }
      } else {
        throw new Error('unknown event type ' + JSON.stringify(type))
      }
    }
  }
  shift () {
    if (this.cleared) {
      this.cleared = false
      return { type: 'clear' }
    }
    const { value, done } = this.todo.entries().next()
    if (!done) {
      let [key, event] = value
      this.todo.delete(key)
      return event
    }
    return undefined
  }
  get length () {
    return (this.cleared ? 1 : 0) + this.todo.size
  }
  * [Symbol.iterator] () {
    if (this.cleared) yield { type: 'clear' }
    for (const event of this.todo.values()) {
      yield event
    }
  }
}

module.exports = SmartPatch
