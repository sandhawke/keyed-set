# KeyedSet( )
[![NPM version][npm-image]][npm-url]

Like Set() but with configurable equality, and it emits changes

## Motivation

Sometimes you want a [Set( )](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) where "equivalent" members are treated as
if they were equal, with at most one of them being in the Set,
standing in for all of them.  Equivalent objects might be ones with
the same serialization, for example, or perhaps objects with the same
value of an .id property.

Also, sometimes you want to listen for changes on a Set( ).  While
that's conceptually independent, it's much easier to provide both
features in the same code, so KeyedSet does that, too.

This was created for [webdup](https://npmjs.org/package/webdup).

## Overview

A KeyedSet() is very similar to a Set(), except:

* When you add(), it wont do anything if there's already an element in
  the set with the same keystring value.

* When you delete(), it looks for an element in the set with the same
  keystring value (there can't be more than one), and removes that.

* When the set changes, events are emited

In general, it computes the keystring as needed for each item using a
function you provide (or JSON.stringify by default).  If you happen to
already have the keystring computed, you can pass it in, to save some
work.  While we call it "keystring", the key is also allowed to be a
number.

Not surprisingly, the current implementation is a Map() where the key for a
value is the keystring computed for that value, so you can also think
of a KeyedSet as a very constrained kind of map.

## Examples

This uses the default keystring function, JSON.stringify:

```js
const KeyedSet = require('keyed-set')

const s = new KeyedSet()
s.on('add', i => { console.log('add %o', i) })

s.add({a: 1})
// => add { a: 1 }

s.add({a: 1})
// no output, an equivalent object was already in the set
```

This uses the "id" property of each object as its key:

```js
const KeyedSet = require('keyed-set')

const s = new KeyedSet(item => item.id)
s.on('add', i => { console.log('add %o', i) })

s.add({a: 1, id: 1000})
// => add { a: 1, id: 1000 }

s.add({b: 2, id: 1000})
// no output, conceptually this object was already in set.  Obviously
// this can get a little tricky.
```

## API

The API for KeyedSet is the same as the standard JavaScript API for [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), except:
* The KeyedSet constructor takes an optional additional parameter, the keystring function
* set.addKey(key, value), set.deleteKey(key), and set.hasKey(key) are provided for increased performance if the caller already has the key computed.
* set.on/off/once from EventEmitter, for these events:
    * add
    * add-key (if you want to be passed the key)
    * delete
    * delete-key (if you want to be passed the key)
    * clear
    * (todo) change, calls handler with {type, key, value}
* setA.minus(setB) returns a new KeyedSet containing only those element in KeyedSet setA but not in KeyedSet setB.  Undefined if setA and setB have different keystring functions.

[npm-image]: https://img.shields.io/npm/v/keyed-set.svg?style=flat-square
[npm-url]: https://npmjs.org/package/keyed-set
