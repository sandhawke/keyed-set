const EventEmitter = require('events')

class KeyedSet extends EventEmitter {
  constructor (keystring = JSON.stringify) {
    super()
    const map = new Map()

    this.add = (item) => {
      const key = keystring(item)
      const already = map.get(key)
      if (!already) {
        map.set(key, item)
        this.emit('add-key', key)
        this.emit('add', item)
      }
    }

    this.delete = (arg) => {
      let key
      if (typeof arg === 'object') {
        key = keystring(arg)
      } else {
        key = arg
      }
      const already = map.get(key)
      if (already) {
        map.delete(key)
        this.emit('delete-key', key)
        this.emit('delete', already)
      }
    }

    this.clear = () => {
      map.clear()
      this.emit('clear')
    }

    //
    // Non-mutating on obj
    //

    Object.assign(this, {
      has (value) {
        const text = keystring(value)
        return map.has(text)
      },
      * entries () {
        for (const item of map.values()) {
          yield [item, item]
        }
      },
      forEach (f, thisArg) {
        if (thisArg) {
          for (const item of map.values()) f.apply(thisArg, [item])
        } else {
          for (const item of map.values()) f(item)
        }
      },
      keys () {
        return map.values()
      },
      values () {
        return map.values()
      },
      * [Symbol.iterator] (value) {
        for (const i of map.values()) yield i
      }
    })

    //
    // Non-mutating view of the keys
    //

    /* probably works, but not tested because I don't need it any more
    const str = {}
    Object.assign(str, {
      has (value) {
        return map.has(value)
      },
      * entries () {
        for (const item of map.keys()) {
          yield [item, item]
        }
      },
      forEach (f, thisArg) {
        if (thisArg) {
          for (const item of map.keys()) f.apply(thisArg, [item])
        } else {
          for (const item of map.keys()) f(item)
        }
      },
      keys () {
        return map.keys()
      },
      values () {
        return map.keys()
      },
      * [Symbol.iterator] (value) {
        for (const i of map.keys()) yield i
      }
    })

    this.strings = str
    */
  }
}

module.exports = KeyedSet
