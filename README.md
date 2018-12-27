# keyed-set
[![NPM version][npm-image]][npm-url]

KeyedSet: like Set() but with equality, and emits changes

## Motivation

Sometimes you want a Set() where "equivalent" objects are treated as
the same object.  These might be objects with the same serialization,
for example, or object with the same value of an .id property.

Also, sometimes you want to listen for changes on a Set().  While
that's a conceptually indepenent thing, it's much easier to provide
both features in the same code.

Used by [dsup](https://npmjs.org/package/dsup).

## Overview

A KeyedSet() is very similar to a Set(), except:

* When you add(), it wont do anything if there's already an element in the set with the same keystring value.
* When you delete(), it looks for an element in the set with the same keystring value (there can't be more than one), and removes that.
* When the set changes, events are emited

## Example 

This uses the default keystring function JSON.stringify:

```js
const KeyedSet = require('keyed-set')

const s = new KeyedSet()
s.on('add', i => { console.log('add %o', i) })

s.add({a: 1})
// => add { a: 1 }

s.add({a: 1})
// no output, it was already in the set
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

[npm-image]: https://img.shields.io/npm/v/keyed-set.svg?style=flat-square
[npm-url]: https://npmjs.org/package/keyed-set
