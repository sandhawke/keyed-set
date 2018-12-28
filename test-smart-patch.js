const KeyedSet = require('.')
const SmartPatch = KeyedSet.SmartPatch
const test = require('tape')

test('direct', t => {
  const s = new KeyedSet()
  const p = new SmartPatch(s)
  // s.on('change', change => { p.push(change) })

  t.deepEqual([...p], [])
  t.equal(p.length, 0)

  p.push({ type: 'clear' })
  t.deepEqual([...p], [{ type: 'clear' }])
  t.equal(p.length, 1)

  // a second clear doesn't change anything
  p.push({ type: 'clear' })
  t.deepEqual([...p], [{ type: 'clear' }])

  p.push({ type: 'add', key: '1', item: 1 })
  t.deepEqual([...p], [
    { type: 'clear' },
    { type: 'add', key: '1', item: 1 }
  ])
  t.equal(p.length, 2)

  // adding it again does nothing
  p.push({ type: 'add', key: '1', item: 1 })
  t.deepEqual([...p], [
    { type: 'clear' },
    { type: 'add', key: '1', item: 1 }
  ])

  // deleting cancels
  p.push({ type: 'delete', key: '1', item: 1 })
  t.deepEqual([...p], [
    { type: 'clear' }
  ])

  // add it again, it reappears:
  p.push({ type: 'add', key: '1', item: 1 })
  t.deepEqual([...p], [
    { type: 'clear' },
    { type: 'add', key: '1', item: 1 }
  ])

  // cancel again
  p.push({ type: 'delete', key: '1', item: 1 })
  t.deepEqual([...p], [
    { type: 'clear' }
  ])

  t.end()
})

test('listening', t => {
  const s = new KeyedSet()
  s.addAll([0, 10]) // before watching

  const p = new SmartPatch(s)
  s.on('change', change => { p.push(change) })

  s.addAll([1, 2, 3])

  t.deepEqual([...p], [
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '2', item: 2 },
    { type: 'add', key: '3', item: 3 }
  ])

  s.delete(2)

  t.deepEqual([...p], [
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '3', item: 3 }
  ])

  s.delete(4) // not present, does nothing

  t.deepEqual([...p], [
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '3', item: 3 }
  ])

  s.delete(10)

  t.deepEqual([...p], [
    { type: 'delete', key: '10', item: 10 },
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '3', item: 3 }
  ])
  t.equal(p.length, 3)

  s.add(10)

  t.deepEqual([...p], [
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '3', item: 3 }
  ])

  s.clear()
  t.deepEqual([...p], [
    { type: 'clear' }
  ])

  s.addAll([3, 1]) // reverse the order this time

  t.deepEqual([...p], [
    { type: 'clear' },
    { type: 'add', key: '3', item: 3 },
    { type: 'add', key: '1', item: 1 }
  ])

  t.end()
})

test('shift', t => {
  const s = new KeyedSet()
  s.addAll([0, 10]) // before watching

  const p = new SmartPatch(s)
  s.on('change', change => { p.push(change) })

  s.addAll([1, 2, 3])
  s.delete(10)

  t.deepEqual([...p], [
    { type: 'delete', key: '10', item: 10 },
    { type: 'add', key: '1', item: 1 },
    { type: 'add', key: '2', item: 2 },
    { type: 'add', key: '3', item: 3 }
  ])
  t.equal(p.length, 4)

  t.deepEqual(p.shift(), { type: 'delete', key: '10', item: 10 })
  t.deepEqual(p.shift(), { type: 'add', key: '1', item: 1 })
  t.deepEqual(p.shift(), { type: 'add', key: '2', item: 2 })

  t.deepEqual([...p], [
    { type: 'add', key: '3', item: 3 }
  ])

  s.clear()
  t.deepEqual(p.shift(), { type: 'clear' })
  t.deepEqual(p.shift(), undefined)

  t.end()
})

test('bad args', t => {
  const s = new KeyedSet()
  const p = new SmartPatch(s)
  try {
    p.push({ type: 'foo' })
    t.fail()
  } catch (e) {
    t.pass()
  }
  t.end()
})
