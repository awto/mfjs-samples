# Logic programming in JavaScript sample

This demonstrates how javascript may be a logic programming language using
[mfjs compiler](https://github.com/awto/mfjs-compiler) with
[logic programming library](https://github.com/awto/mfjs-logic).

The sample ends with prolog classical bi-directional list append function.
A singe function concatenates lists, takes prefix and suffix of list. And in
fact it may do many other things depending on position of logical variables.

It is almost literal translation from prolog to JavaScript:

```javascript
function append(a,b,r) {
  const [h, t, rt] = newRefs()
  unify(a, cons(h, t))
  unify(r, cons(h, rt))
  append(t, b, rt)
  M.answer()
  unify(a, nil())
  unify(r, b)
}
```

Here logical variables are created with `newRefs` function, and `cons`,
`nil` are smart constructors for corresponding list objects.

Unification and logical variables are implemented in the sample file and
they are small and simple (everything is in unify.js). This is one of many
possible implementation options for logical variables. It is just an object
with `value` field. Unification traverses arrays and object with same
constructor comparing fields and setting values of references if they are
not yet set. And on backtracking their values are reverted.

Here are usage samples:

```javascript
  let l1 = List.from([1,2,3])
  let l2 = List.from(['a','b','c'])
  // free variables:
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
```

It may be non-deterministic:

```javascript
  let [x,y] = newRefs()
  let z = List.from([1,2,3,4])
  // only result is instantied 
  append(x,y,z)
  console.log('x:', List.toArray(x))
  console.log('y:', List.toArray(y))
  console.log('z:', List.toArray(z))
```

And there are 5 possible answers returned:

```
x: [ 1, 2, 3, 4 ]
y: []
z: [ 1, 2, 3, 4 ]

x: [ 1, 2, 3 ]
y: [ 4 ]
z: [ 1, 2, 3, 4 ]

x: [ 1, 2 ]
y: [ 3, 4 ]
z: [ 1, 2, 3, 4 ]

x: [ 1 ]
y: [ 2, 3, 4 ]
z: [ 1, 2, 3, 4 ]

x: []
y: [ 1, 2, 3, 4 ]
z: [ 1, 2, 3, 4 ]
```
