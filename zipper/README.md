# Sample for delimited continuations with mfjs

Using [mfjs compiler](https://github.com/awto/mfjs-compiler) with delimited
continuations [library](https://github.com/awto/mfjs-cc)

There is a function `createZipper` turning any traversal into a zipper. For
example your company has some widgets library where each widget root DOM
element has class "org-widget". Container widgets may have their children
not on single level. And now we want to traverse all of them using external
iterator. For ES generators this would look like (considering HTMLCollection
is iterable):

```javascript
function widgets(cur, result) {
  for(let i of ch) {
    if (i.classList.contains('org-widget'))
      yield i
    else
      yield* widgets(i, result)
  }
}
```

Now only a few things are to be changed to turn the traversal function into
a zipper, where we can travel in 4 directions:

 * up - to parent element
 * down - to first child element
 * forward/back - left/right siblings

The generators version allows traveling only forward and down (by recursively
calling `widget` function for returned element).

Corresponding traversal function for mfjs is more implicit. In fact it may
be the same explicit like generators version for people who like this,
mfjs can interpret functions with generators, but that functionality
isn't fully finished yet.

```javascript
function widgets(elem, result) {
  for(let i of elem.children) {
    if (i.classList.contains('org-widget'))
      result(i)
    else
      widgets(i, result)
  }
}
```

Here `yield` is replaced with callback function call and `yield*` is implicit.

This is it, all we need is to create a zipper out of the function and travel
wherever we need.  

```javascript
  const e = document.getElementById('root')
  let z = createZipper(widgets, e)
  z = z.down()
  z = z.down()
  z = z.up()
  z = z.forward()
  z = z.up()
  z = z.back()
  z = z.down()
  /// ....

```

For up/back it uses saved continuation position while for down and forward the
traversal code is re-executed. 

Implementation is just ~20 lines of JS code in `createZipper` function.


