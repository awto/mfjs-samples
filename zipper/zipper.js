
import CC from '@mfjs/cc'
import assert from 'assert'
const M = require('@mfjs/core')
M.profile('defaultMinimal')

function createZipper(trav, x) {
  function ZS (value, k) {
    this.value = value;
    this.k = k;
  }
  function go(zs,b,u) {
    const res = (zs && zs.constructor === ZS) ? {
      cur: zs.value,
      forward (arg) { return go(M(zs.k(arg)),res,u) },
      down() {
        return go(M(CC.pushPrompt(p,
                                  trav(zs.value, 
                                       v => CC.shift0(p, sk => new ZS(v,sk))))),
                    null,res)
      }
    } : { done: true }
    res.up = u ? () => u : () => { return {done: true, down() { return  res }}}
    res.back = b ? () => b : 
      () => { return {done: true, forward() { return res }, up: res.up} }
    return res
  }
  const p = CC.newPrompt()
  return go(new ZS(x))
}

M.profile('defaultFull')

function run() {
  const e = document.getElementById('root')
  let z = createZipper(widgets, e)
  assert.equal(z.cur.id, 'root')
  z = z.down()
  assert.equal(z.cur.id, 'w1')
  z = z.down()
  assert.equal(z.cur.id, 'w2')
  z = z.down()
  assert.ok(z.done)
  z = z.up()
  assert.equal(z.cur.id, 'w2')
  z = z.forward()
  assert.equal(z.cur.id, 'w3')
  z = z.forward()
  assert.ok(z.done)
  z = z.up()
  assert.equal(z.cur.id, 'w1')
  z = z.forward()
  assert.equal(z.cur.id, 'w4')
  z = z.back()
  assert.equal(z.cur.id, 'w1')
  z = z.forward()
  assert.equal(z.cur.id, 'w4')
  z = z.up()
  assert.equal(z.cur.id, 'root')
  z = z.up()
  assert.ok(z.done)
  z = z.down()
  assert.equal(z.cur.id, 'root')
  alert("OK")
}

function widgets(elem, result) {
  for(let i of elem.children) {
    if (i.classList.contains('org-widget'))
      result(i)
    else
      widgets(i, result)
  }
}

CC.run(run)
