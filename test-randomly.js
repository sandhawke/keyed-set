const KeyedSet = require('./index-sp1')
const test = require('tape')
const seedrandom = require('seedrandom')

const random = seedrandom('hello.')
// const msg = (...arg) => { console.log(...arg) }
const msg = () => { }

test('bench', t => {
  for (let i = 1; i <= 3000; i++) {
    msg('\n\n\nRun', i)
    run(t)
  }
  t.pass()
  t.end()
})

function ser (s) {
  return [...s].sort().join(', ')
}

function run (t) {
  const s = new KeyedSet()
  randomlyAlter(s)
  msg('  initial s  = ', ser(s))
  const p = s.mark()
  const s0 = s.clone()

  while (true) {
    msg('loop head s0 = ', ser(s0))
    msg('          s  = ', ser(s))
    randomlyAlter(s)
    msg('         ~s  = ', ser(s))
    // msg('  patch now  = %o ', [...p])
    partiallyPatch(s0, p)
    msg('         ~s0 = ', ser(s0))
    if (random() < 0.1) break
  }
  msg(' final patch = %o ', [...p])
  s0.patch(p)
  msg('   final  s0 = ', ser(s0))

  if (!s.deepEqual(s0)) throw Error()
  if (!s0.deepEqual(s)) throw Error()
  p.close()
}

function randomlyAlter (s) {
  while (random() < 0.99) {
    s.add(Math.round(random() * 9.4))
    s.delete(Math.round(random() * 10))
    if (random() < 0.001) {
      msg('** CLEAR **')
      s.clear()
    }
  }
}

function partiallyPatch (set, patch) {
  while (patch.length > 0) {
    if (random() < 0.30) {
      msg('  randomly giving up on patch')
      return
    }
    // msg('BEFORE SHIFT = %o ', [...patch])
    const ev = patch.shift()
    // msg('AFTER        = %o ', [...patch])
    if (!ev) {
      throw Error()
    }
    msg('   applying', ev)
    set.change(ev)
  }
  msg('  no more to this patch')
}
