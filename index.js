const EventEmitter = require('events')

class KeyedSet extends EventEmitter {
  constructor (keystring = JSON.stringify) {
    super()
    this.map = new Map()
  }

  //
  // Mutating Methods
  //
  
  add (item) {
    this.addKey(this.keystring(item), item)
  }
  addKey (key, item) {
    const already = this.map.get(key)
    if (!already) {
      this.map.set(key, item)
      this.emit('add-key', key)
      this.emit('add', item)
    }
  }

  delete (item) {
    this.deleteKey(this.keystring(item))
  }
  deleteKey (key) {
    const already = this.map.get(key)
    if (already) {
      this.map.delete(key)
      this.emit('delete-key', key)
      this.emit('delete', already)
    }
  }

  clear () {
    this.map.clear()
    this.emit('clear')
  }

  //
  // Non-Mutating Methods
  //

  
  has (value) {
    return this.hasKey(this.keystring(value))
  }
  hasKey (key) {
    return this.map.has(key)
  }

  * entries () {
    for (const item of this.map.values()) {
      yield [item, item]
    }
  }
  forEach (f, thisArg) {
    if (thisArg) {
      for (const item of this.map.values()) f.apply(thisArg, [item])
    } else {
      for (const item of this.map.values()) f(item)
    }
  }

  keys () {
    return this.map.values()
  }

  values () {
    return this.map.values()
  }

  * [Symbol.iterator] (value) {
    for (const i of this.map.values()) yield i
  }
}

module.exports = KeyedSet
