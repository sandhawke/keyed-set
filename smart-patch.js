// much more clever: matchin pairs of changes cancel out. If you add
// something then delete it, or delete something then add it back,
// both events go away.  Also, a clear event means we can forget all
// changes so far.
class SmartPatch {
  constructor (base, ...values) {
    this.cleared = false
    this.add = base.cloneEmpty()
    this.delete = base.cloneEmpty()
    this.push(...values)
  }
  push (...evs) {
    for (const { type, key, item } of evs) {
      if (type === 'clear') {
        this.cleared = true
        this.add.clear()
        this.delete.clear()
      } else if (type === 'add') {
        if (this.delete.hasKey(key)) {
          this.delete.deleteKey(key) // cancel the pair
        } else {
          this.add.addKey(key, item)
        }
      } else if (type === 'delete') {
        if (this.add.hasKey(key)) {
          this.add.deleteKey(key) // cancel the pair
        } else {
          this.delete.addKey(key, item)
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
    for (const type of ['delete', 'add']) {
      const { value, done } = this[type].keyMap.entries().next()
      if (!done) {
        let [key, item] = value
        // console.log('DELETING %o %o', {type, key}, [...this[type]])
        this[type].deleteKey(key)
        // console.log('     NOW %o %o', {type, key}, [...this[type]])
        return { type, key, item }
      }
    }
    return undefined
  }
  get length () {
    return (this.cleared ? 1 : 0) + this.add.size + this.delete.size
  }
  * [Symbol.iterator] () {
    if (this.cleared) yield { type: 'clear' }
    for (const type of ['delete', 'add']) {
      for (const [key, item] of this[type].keyMap.entries()) {
        yield { type, key, item }
      }
    }
  }
}

module.exports = SmartPatch
