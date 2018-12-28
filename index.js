const EventEmitter = require('events')
const SmartPatch = require('./smart-patch')

class KeyedSet extends EventEmitter {
  constructor (source, keyFunction) {
    // console.log('incoming', {source, keyFunction})
    if (typeof source === 'function') {
      keyFunction = source
      source = undefined
    }
    if (!keyFunction) keyFunction = JSON.stringify
    // console.log('.. result', {source, keyFunction})

    super()
    this.keyMap = new Map()
    this.keyFunction = keyFunction

    if (source) {
      this.addAll(source)
    }
  }

  //
  // Mutating Methods
  //

  addAll (source) {
    // console.log('doing addAll %o', source)
    if (source.keyMap && source.keyFunction === this.keyFunction) {
      if (this.size === 0) {
        this.keyMap = new Map(source.keyMap)
      } else {
        for (const [k, v] of source.keyMap.entries()) this.keyMap.set(k, v)
      }
    } else {
      for (const i of source) this.add(i)
    }
  }
  add (item) {
    this.addKey(this.keyFunction(item), item)
  }
  addKey (key, item) {
    const already = this.keyMap.get(key)
    if (!already) {
      this.keyMap.set(key, item)
      this.emit('change', { type: 'add', key, item })
    }
  }

  delete (item) {
    this.deleteKey(this.keyFunction(item))
  }
  deleteKey (key) {
    const item = this.keyMap.get(key)
    if (item) {
      this.keyMap.delete(key)
      this.emit('change', { type: 'delete', key, item })
    }
  }

  clear () {
    this.keyMap.clear()
    this.emit('change', { type: 'clear' })
  }

  //
  // Non-Mutating Methods
  //

  get size () { return this.keyMap.size }

  has (value) {
    return this.hasKey(this.keyFunction(value))
  }
  hasKey (key) {
    return this.keyMap.has(key)
  }

  * entries () {
    for (const item of this.keyMap.values()) {
      yield [item, item]
    }
  }
  forEach (f, thisArg) {
    if (thisArg) {
      for (const item of this.keyMap.values()) f.apply(thisArg, [item])
    } else {
      for (const item of this.keyMap.values()) f(item)
    }
  }

  // I know it feels a little weird to return the values of the map
  // when asked for the keys, but we're pretending to be a set here.
  keys () {
    return this.keyMap.values()
  }

  values () {
    return this.keyMap.values()
  }

  * [Symbol.iterator] (value) {
    for (const i of this.keyMap.values()) yield i
  }

  //
  // Our cool stuff
  //

  clone () {
    const result = this.cloneEmpty()
    result.addAll(this)
    return result
  }
  cloneEmpty () {
    return new this.constructor(this.keyFunction)
  }

  change (event) {
    if (event.type === 'add') {
      this.addKey(event.key, event.item)
    } else if (event.type === 'delete') {
      this.deleteKey(event.key)
    } else if (event.type === 'clear') {
      this.clear()
    } else throw Error('bad event type: ' + JSON.stringify(event))
  }

  changeAll (events) {
    for (const event of events) this.change(event)
  }

  // We could also implement this by sorting both lists of keys, then
  // running through them. That would give us a diff in sort-time plus
  // linear time.  But I think hash lookup like this is probably fine,
  // maybe better.
  minus (other) {
    const result = this.cloneEmpty()
    for (const [k, v] of this.keyMap.entries()) {
      if (other.hasKey(k)) continue
      result.addKey(k, v)
    }
    return result
  }

  diff (newer) {
    if (newer.size === 0) {
      if (this.size === 0) {
        return new SimplePatch(this)
      } else {
        return new SimplePatch(this, { type: 'clear' })
      }
    }

    const patch = new SimplePatch(this)
    const ev = {}
    ev.add = newer.minus(this)
    ev.delete = this.minus(newer)
    for (const type of ['delete', 'add']) {
      for (const [key, item] of ev[type].keyMap.entries()) {
        patch.push({ type, key, item })
      }
    }
    return patch
  }

  smartPatch () {
    return new SmartPatch(this)
  }
}

// just a list of change events; which is fine for this.diff()
class SimplePatch {
  constructor (base, ...values) {
    this.base = base
    this.list = [...values]
  }
  get length () {
    return this.list.length
  }
  push (...evs) {
    this.list.push(...evs)
  }
  shift () {
    return this.list.shift()
  }
  [Symbol.iterator] () {
    return this.list[Symbol.iterator]()
  }
}

module.exports = KeyedSet
module.exports.SmartPatch = SmartPatch
