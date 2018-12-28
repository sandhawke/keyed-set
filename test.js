const KeyedSet = require('.')
const test = require('tape')

test('add', t => {
  const s = new KeyedSet()
  const log = []
  let expect

  s.on('change', change => { log.push(change) })

  t.deepEqual(log, [])
  const item1 = { a: 1 }
  s.add(item1)
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } }
  ]

  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // this does nothing, of course
  s.add(item1)
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // but this ALSO does nothing, because the key is the same
  s.add({ a: 1 })
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  t.end()
})

test('delete', t => {
  const s = new KeyedSet()
  const log = []
  let expect
  s.on('change', change => { log.push(change) })

  t.deepEqual(log, [])
  const item1 = { a: 1 }
  s.add(item1)
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // absent - does nothing
  s.delete({ a: 2 })
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // present, removes it
  s.delete({ a: 1 })
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } },
    { type: 'delete', key: '{"a":1}', item: { a: 1 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [])

  t.end()
})

test('delete by key', t => {
  const s = new KeyedSet()
  const log = []
  let expect

  s.on('change', change => { log.push(change) })

  t.deepEqual(log, [])
  const item1 = { a: 1 }
  s.add(item1)
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // absent - does nothing
  s.delete({ a: 2 })
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // present, removes it
  s.delete({ a: 1 })
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } },
    { type: 'delete', key: '{"a":1}', item: { a: 1 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [])

  t.end()
})

test('key', t => {
  const s = new KeyedSet(i => i.id)
  const log = []
  let expect

  s.on('change', change => { log.push(change) })

  t.deepEqual(log, [])
  const item1 = { a: 1, id: 1000 }
  s.add(item1)
  expect = [
    { type: 'add', key: 1000, item: { a: 1, id: 1000 } }
  ]

  t.deepEqual(log, expect)
  t.deepEqual([...s], [item1])

  s.add(item1)
  t.deepEqual(log, expect)

  s.add({ a: 2, id: 1000 })
  t.deepEqual(log, expect)

  // absent - does nothing
  s.delete({ a: 2 })
  t.deepEqual(log, expect)

  // only cares about key
  s.delete({ id: 1000 })
  expect = [
    { type: 'add', key: 1000, item: { a: 1, id: 1000 } },
    { type: 'delete', key: 1000, item: { a: 1, id: 1000 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [])

  s.clear()
  expect = [
    { type: 'add', key: 1000, item: { a: 1, id: 1000 } },
    { type: 'delete', key: 1000, item: { a: 1, id: 1000 } },
    { type: 'clear' }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [])

  t.end()
})

test('values', t => {
  const s = new KeyedSet()
  let log = []

  s.add(1)
  s.add(2)
  s.add(3)
  s.add('4')
  t.deepEqual([...s], [ 1, 2, 3, '4' ])
  t.deepEqual([...s.values()], [ 1, 2, 3, '4' ])
  t.deepEqual([...s.keys()], [ 1, 2, 3, '4' ])
  t.deepEqual([...s.entries()], [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ '4', '4' ] ])
  s.forEach(i => { log.push(i) })
  log = []
  const that = {}
  s.forEach(function (i) { log.push(i); t.equal(this, that) }, that)
  t.deepEqual(log, [ 1, 2, 3, '4' ])

  t.ok(s.has(1))
  t.ok(s.has('4'))
  t.ok(!s.has(4))

  s.clear()
  t.deepEqual([...s], [])
  t.end()
})

test('key methods', t => {
  const s = new KeyedSet()
  const log = []
  let expect
  s.on('change', change => { log.push(change) })

  t.deepEqual(log, [])
  const item1 = { a: 1 }
  s.addKey(JSON.stringify(item1), item1)
  expect = [
    { type: 'add', key: '{"a":1}', item: { a: 1 } }
  ]
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // this does nothing, of course
  s.addKey(JSON.stringify(item1), item1)
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  // but this ALSO does nothing, because the key is the same
  s.add({ a: 1 })
  t.deepEqual(log, expect)
  t.deepEqual([...s], [{ a: 1 }])

  t.end()
})

test('copy constructors', t => {
  const s1 = new KeyedSet([1, 2, 3])
  t.deepEqual([...s1], [1, 2, 3])

  const s2 = new KeyedSet(new Set([1, 2, 3]))
  t.deepEqual([...s2], [1, 2, 3])

  const s3 = new KeyedSet(s2)
  t.deepEqual([...s3], [1, 2, 3])

  // manually putting something into the map to make sure this
  // constructor uses the fast path
  s3.map.set('fake', 100)
  const s4 = new KeyedSet(s3)
  t.equal(s4.map.get('fake'), 100)

  // but this one does not, because the function is nominally different
  const s5 = new KeyedSet(s3, i => JSON.stringify(i))
  t.notEqual(s5.map.get('fake'), 100)

  // test the branch about map.size === 0
  const s6 = new KeyedSet([0])
  s6.addAll(s3)
  t.deepEqual([...s6.map.entries()], [
    // we still copied the raw map entries (which we corrupted for s3)
    [ '0', 0 ], [ '1', 1 ], [ '2', 2 ], [ '3', 3 ], [ 'fake', 100 ]
  ])
  t.equal(s6.map.get('fake'), 100)
  t.deepEqual([...s6], [0, 1, 2, 3, 100])

  t.end()
})

test('minus', t => {
  const a = new KeyedSet([1, 2, 3, 4, 5, 6, 7])
  const b = new KeyedSet([1,    3,    5, 6   ]) //eslint-disable-line
  const c = new KeyedSet([   2,       5,    7]) //eslint-disable-line
  const d = new KeyedSet([])

  t.deepEqual([...a.minus(b)], [2, 4, 7])
  t.deepEqual([...a.minus(c)], [1, 3, 4, 6])
  t.deepEqual([...a.minus(d)], [1, 2, 3, 4, 5, 6, 7])
  t.deepEqual([...d.minus(a)], [])
  t.deepEqual([...b.minus(c)], [1, 3, 6])
  t.deepEqual([...c.minus(b)], [2, 7])

  t.end()
})

test('diff + patch', t => {
  const a = new KeyedSet([1, 2, 3, 4, 5, 6, 7])
  const b = new KeyedSet([1,    3,    5, 6   ]) //eslint-disable-line
  const c = new KeyedSet([   2,       5,    7]) //eslint-disable-line
  const d = new KeyedSet([])

  t.deepEqual(b.diff(c), [
    { type: 'delete', key: '1', item: 1 },
    { type: 'delete', key: '3', item: 3 },
    { type: 'delete', key: '6', item: 6 },
    { type: 'add', key: '2', item: 2 },
    { type: 'add', key: '7', item: 7 } ])
  t.deepEqual(c.diff(d), [
    { type: 'clear' } ])
  t.deepEqual(d.diff(c), [
    { type: 'add', key: '2', item: 2 },
    { type: 'add', key: '5', item: 5 },
    { type: 'add', key: '7', item: 7 } ])

  function pair (x, y) {
    const diff = x.diff(y)
    // console.log('diff:', diff)
    const copy = new KeyedSet(x)
    // console.log('before:', [...copy])
    copy.changeAll(diff)
    // console.log('after:', [...copy])
    t.deepEqual(y.diff(copy), [])
    t.deepEqual(copy.diff(y), [])
  }
  function xpair (x, y) {
    pair(x, y)
    pair(y, x)
  }

  xpair(a, a)
  xpair(a, b)
  xpair(a, c)
  xpair(a, d)
  xpair(b, b)
  xpair(b, c)
  xpair(b, d)
  xpair(c, c)
  xpair(c, d)

  t.end()
})

test('bad args', t => {
  const s1 = new KeyedSet([1, 2, 3])
  try {
    s1.change({ type: 'something-else' })
    t.fail()
  } catch (e) {
    t.pass()
  }
  t.end()
})
