# shareable-set
[![NPM version][npm-image]][npm-url]

Like Set() but with equality via keystring function, and emits changes

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

## API

    s = new ShareableSet(options)

Options can include:

* parse - function to use instead of JSON.parse
* stringify - function to use instead of JSON.stringify
* parseAll - for addAll
* stringifyAll - for pipe

    s.strings.add
    s.strings.delete
    s.strings.clear
    s.strings.on('add', ...)
    s.strings.on('delete', ...)
    s.strings.on('clear', ...)

Just like you'd expect, except they operate on serializations.  For
delete, it's fine to have the serialization just be a key, if that
makes sense for your data.

    s.strings.etag

Optional.  If present, must be a value which will be different for
every different state of the dataset (statistically speaking), such as
a SHA-256.  To make this reasonably efficient, rather than using a
SHA-256 of the entire dataset, it is suggested to use the XOR of the
SHA-256 of each dataset element.  That way the etag can be updated
with each delete without traversing the whole datas.

    s.strings.addAll(document)

Similar to add(), except it takes an serialization of a dataset
instead of a dataset item.  For example, for JSON, this will include
surrounding brackets and commas between the items.

    s.strings.pipe(dest)

Serializes the set to writableStream dest.


[npm-image]: https://img.shields.io/npm/v/shareable-set.svg?style=flat-square
[npm-url]: https://npmjs.org/package/shareable-set
