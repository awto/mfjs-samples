'use stict';
import L from '@mfjs/logic'
import assert from 'assert'
import 'babel-polyfill'
const M = require('@mfjs/core')

function* newRefs() {
  for(;;)
    yield newRef();
}

M.profile('defaultMinimal')

var refId = 0

const unset = {unset:true}

class Ref {
  constructor(value) {
    this.id = ++refId
    this.value = value
  }
  getGround() {
    if (this.value === unset)
      throw new Error(`not ground variable: ${this.id}` )
    return this.value
  }
  unify(ctx, other) {
    if (this.value !== unset) {
      if (other.value !== unset)
        M(ctx.unify(this.value,other.value))
      else
        ctx.set(other, this.value)
    } else {
      if (other.value !== unset) {
        ctx.set(this, other.value)
      } else {
        ctx.eq(this,other)
      }
    }
  }
}

function newRef(v=unset) {
  return new Ref(v);
}

class UnifyCtx {
  constructor() {
    this.refs = []
    this.eqs = {}
  }
  eq(l, r) {
    this.eqs[l.id] = r
    this.eqs[r.id] = l
  }
  set(ref, val) {
    this.refs.push(ref)
    ref.value = val
    const e = this.eqs[ref.id]
    if (e) {
      this.refs.push(...e)
      for(let i of e)
        i.value = val
    }
  }
  apply() {
    M.answer()
    for(let i of this.refs)
      i.value = unset;
    M(M.empty())
  }

  unify(l, r) {
    if (l === r)
      return
    if (l == null || r == null)
      M(M.empty())
    if (l.unify) {
      if (l.constructor === r.constructor)
        return M(l.unify(this,r))
      else
        M(M.empty())
    }
    if (Array.isArray(l)) {
      if (!Array.isArray(r))
        return M(M.empty())
      if (l.length !== r.length)
        return M(M.empty())
      for(let i = 0; i < l.length; ++i)
        M(this.unify(l[i],r[i]))
      return
    }
    if (Array.isArray(r))
      return M.empty()
    if (typeof l === 'object') {
      if (typeof l !== 'object')
        M(M.empty())
      if (l.constructor !== r.constructor)
        M(M.empty())
      for (let i in r)
        if (!(i in l))
          M(M.empty())
      for (let i in l)
        M(this.unify(l[i],r[i]))
      return
    }
    M(M.empty())
  }
}

function unify(l, r) {
  const ctx = new UnifyCtx()
  M(ctx.unify(l, r))
  M(ctx.apply())
}

class List {
  static from(iterable) {
    let tail = new Ref(), res = tail
    for(let i of iterable)
      tail.value = new Cons(newRef(i), tail = newRef())
    tail.value = new Nil()
    return res
  }
  static toArray(list) {
    const res = []
    list.getGround()._toArray(res)
    return res
  }
}

class Nil extends List {
  _toArray(res) { return null }
}

class Cons extends List {
  constructor(h, t) {
    super()
    this.head = h
    this.tail = t
  }
  _toArray(res) {
    res.push(this.head.getGround())
    this.tail.getGround()._toArray(res)
  }
}

function cons(h, t) {
  return newRef(new Cons(h, t))
}

function nil() {
  return newRef(new Nil())
}

M.setContext(L)

function main() {
  console.log('answers:', Array.from(L.run(test1)).length)
  console.log('answers:', Array.from(L.run(test2)).length)
}

M.profile('defaultFull')

function append(a,b,r) {
  const [h, t, rt] = newRefs()
  unify(a, cons(h, t))
  unify(r, cons(h, rt))
  append(t, b, rt)
  M.answer()
  unify(a, nil())
  unify(r, b)
}

function test1() {
  let l1 = List.from([1,2,3])
  let l2 = List.from(['a','b','c'])
  let [l3,l4,l5] = newRefs()
  append(l1, l2, l3)
  console.log('append:', List.toArray(l3))
  // ==> append: [ 1, 2, 3, 'a', 'b', 'c' ]
  append(l1, l4, l3)
  console.log('suffix', List.toArray(l4))
  // ==> suffix [ 'a', 'b', 'c' ]
  append(l5, l2, l3)
  console.log('prefix', List.toArray(l5))
  // ==> prefix [ 1, 2, 3 ]
}

function test2() {
  let [x,y] = newRefs()
  let z = List.from([1,2,3,4])
  append(x,y,z)
  console.log('x:', List.toArray(x))
  console.log('y:', List.toArray(y))
  console.log('z:', List.toArray(z))
}

main()

