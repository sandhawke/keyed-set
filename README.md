# KeyedSet( )
[![NPM version][npm-image]][npm-url] [![Coverage Status](https://coveralls.io/repos/github/sandhawke/keyed-set/badge.svg?branch=master)](https://coveralls.io/github/sandhawke/keyed-set?branch=master)

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
  the set with the same key.

* When you delete(), it looks for an element in the set with the same
  key (there can't be more than one), and removes that.

* When the set changes, events are emited

In general, it computes the key as needed for each item using the
keyFunction you provide (or JSON.stringify by default).  If you happen
to already have the key computed, you can pass it in, to save some
work. The key returned by keyFunction should be a string.

Not surprisingly, the current implementation is a Map() where the key for a
value is what keyFunction returned for that value. So you can also think
of a KeyedSet as a very constrained kind of map.

## Examples

This uses the default keyFunction (JSON.stringify):

```js
const KeyedSet = require('keyed-set')

const s = new KeyedSet()
s.on('change', event => { console.log(event) })

s.add({a: 1})
// => { type: 'add', key: '{"a":1}', item: { a: 1 } }

s.add({a: 1})
// no output, an equivalent object was already in the set
```

This uses the "id" property of each object as its key:

```js
const KeyedSet = require('keyed-set')

const s = new KeyedSet(item => item.id)
s.on('change', event => { console.log(event) })

s.add({a: 1, id: 1000})
// => { type: 'add', key: 1000, item: { a: 1, id: 1000 } }

s.add({b: 2, id: 1000})
// no output, since an "equivalent" object was already in the set,
// nothing gets added now

s.deleteKey(1000)
// => { type: 'delete', key: 1000, item: { a: 1, id: 1000 } }
```

## API

The API for KeyedSet is the same as the standard JavaScript API for [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), except:
* The KeyedSet constructor takes an optional additional parameter, the keyFunction. This function takes an element of the set and returns a string to use as the equivalence key for that element.
* It's an EventEmitter, with set.on/off/once, providing "change" events. The event objects passed to the event handler looks like one of these:
    * { type: 'add', key: ..., item: ... },
    * { type: 'delete', key: ..., item: ... },
    * { type: 'clear' }
* set.clone() makes a copy with the same data and keyFunction; set.cloneEmpty() makes a copy with the same keyFunction but no data.

For performance, if the caller already has the key computed, there are some additional methods:
* set.addKey(key, value)
* set.deleteKey(key)
* set.hasKey(key)

For performance, when a KeyedSet is doing an operation against another
Set, if the other set has a .keyMap and a .keyFunction, they are read
assuming they have the same semantics as in KeyedSet.

There are also some convenience functions, with reasonably efficient
implementations:

* setA.**minus**(setB) returns a new KeyedSet containing only those
  element in KeyedSet setA but not in KeyedSet setB. Behavior is
  unspecified if setA and setB have different keyFunction.

* setA.**diff**(setB) returns a patch, an iterable of events that would
  be needed to turn setA into setB.

* set.**change**(event) applies the change described in the event to
  this set

* setA.**changeAll**(patch) applies a sequence of changes.
  `setA.changeAll(setA.diff(setB))` would leave setA having the same
  members as setB.  (Of course, so would `setA.clear();
  setA.addAll(setB)`, but presumably there are times you want to
  minimize the changes.)

### SmartPatch

The helper class KeyedSet.SmartPatch acts like an array of change
events, but it "cancels" events that would have no effect when
combined. It can be used to record change events and then replay them
more efficiently.

```js
const KeyedSet = require('keyed-set')
const SmartPatch = KeyedSet.SmartPatch

const s = new KeyedSet()
s.addAll([1,2,3])  // before listening

const p = new SmartPatch(s)
s.on('change', change => { p.push(change) })

s.addAll([4,5,6])
p.length  // => 3
s.delete(6)
p.length  // => 2  It cancelled the add
s.delete(1)
s.delete(2) 
p.length  // => 4  Need to remember these deletes
s.add(1)
p.length  // => 3  Well, only one of them
s.clear()
p.length  // => 1  No need to remember the adds at all
```

[npm-image]: https://img.shields.io/npm/v/keyed-set.svg?style=flat-square
[npm-url]: https://npmjs.org/package/keyed-set
