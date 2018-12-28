const EventEmitter = require('events')

class KeyedSet extends EventEmitter {
  constructor (source, keystring) {
    // console.log('incoming', {source, keystring})
    if (typeof source === 'function') {
      keystring = source
      source = undefined
    }
    if (!keystring) keystring = JSON.stringify
    // console.log('.. result', {source, keystring})

    super()
    this.map = new Map()
    this.keystring = keystring

    if (source) {
      this.addAll(source)
    }
  }

  //
  // Mutating Methods
  //

  addAll (source) {
    // console.log('doing addAll %o', source)
    if (source.map && source.keystring === this.keystring) {
      if (this.map.size === 0) {
        this.map = new Map(source.map)
      } else {
        for (const [k, v] of source.map.entries()) this.map.set(k, v)
      }
    } else {
      for (const i of source) this.add(i)
    }
  }
  add (item) {
    this.addKey(this.keystring(item), item)
  }
  addKey (key, item) {
    const already = this.map.get(key)
    if (!already) {
      this.map.set(key, item)
      this.emit('change', { type: 'add', key, item })
    }
  }

  delete (item) {
    this.deleteKey(this.keystring(item))
  }
  deleteKey (key) {
    const item = this.map.get(key)
    if (item) {
      this.map.delete(key)
      this.emit('change', { type: 'delete', key, item })
    }
  }

  clear () {
    this.map.clear()
    this.emit('change', { type: 'clear' })
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

  // I know it feels a little weird to return the values of the map
  // when asked for the keys, but we're pretending to be a set here.
  keys () {
    return this.map.values()
  }

  values () {
    return this.map.values()
  }

  * [Symbol.iterator] (value) {
    for (const i of this.map.values()) yield i
  }

  // We could also implement this by sorting both lists of keys, then
  // running through them. That would give us a diff in sort-time plus
  // linear time.  But I think hash lookup like this is probably fine.
  minus (other) {
    const result = new KeyedSet(this.keystring)
    for (const [k, v] of this.map.entries()) {
      if (other.hasKey(k)) continue
      result.map.set(k, v)
    }
    return result
  }
}

module.exports = KeyedSet
