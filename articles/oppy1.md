# How did I do make the thing?

## Why don't you just share us the code?

Well honestly, the code that I write has a very singular purpose: to render one of my artworks. And it does this at arbitrarily high resolution. And I just don't feel quite comfortable giving that away. It's not about hiding my method or keeping secrets. Because that's what this article is going to be about.

The original prototype of this project was written in Javascript, using (small parts of) the P5js library. 

## What the thing is roughly

## x

First I make a wobbly function. That's a function that wobbles up and down in a semi-random fashion. It kind of looks like this:

![Wobbly function](img/wobbly.png)

Initially I used a combination of sine waves for this, but it was too slow (because this wobbly function gets called many times). Even when I rewrote the thing in Rust, it was still too slow. So I used an array filled with 8 random numbers and interpolated (using `smoothstep`) between them in a cyclical manner. Memory access is faster than a `sin()` function. The wobbly function looks like this:

```rust
  fn wobl(&self, t: f64) -> f64 {
    let i = (t.floor() as usize) & 7;
    let mut f = t - t.floor();
    f *= f * (3.0 - 2.0 * f); // smoothstep
    self.wav[i] * (1.0 - f) + self.wav[(i + 1) & 7] * f
  }
```

Using this, we're going to build a function that transforms input coordinates `(u, v)` to warped `(x, y)` screen coordinates. We take the `(u, v)` coordinate, and add to this two small orthogonal vectors which get rotated. The rotation depends on the wobbly function and the coordinates. This gives you a function that largely follows the shape of the `(u, v)` space (square, flat) but adds two wobbly rotating vectors, which warps it into flowing wavy curly shapes.

The code for this function roughly looks like this:

```rust
  fn f(&self, p: Vector2<f64>) -> Vector2<f64> {
    let a = 1.5 * (self.wobl(p.x * self.ff.0 + self.phi.0) 
        - 1.5 * self.wobl(p.y * self.ff.1 + self.phi.1)) + TAU * 0.25;
    let b = 1.5 * (self.wobl(p.y * self.ff.2 + self.phi.2) 
        - 1.5 * self.wobl(p.x * self.ff.3 + self.phi.3));
    let va = vec2(a.sin(), a.cos());
    let vb = vec2(b.sin(), b.cos());
    let mut v = vec2(p.x + 0.2 * p.y, p.y - 0.2 * p.x);
    v += 0.3 * (va + vb);
    v * HEIGHT + WH2
  }
```

`wobl` is the wobbly function we spoke about. 


What we do now is pick a random `(u, v)` coordinate, warp and transform it to `(x, y)` screen coordinates, then draw a point at that position. I draw the points with low opacity, so everything is smooth and averages out. It also takes longer, which makes you appreciate the end result more.

If we draw black points on a white background, you now get something that kinda looks like this:

![Black and white](img/worb1-s.jpg)

Except for the snakeskin-like grid texture. I used a trick for that :) The trick is as follows.

After we pick a random `(u, v)` coordinate, but before we warp it, we're going to do something to it. First split it into its integer and fractional parts, respectively `(ui, vi) = (u.floor(), v.floor()` and `(uf, vf) = (u, v) - (ui, vi)`. The fractional parts are between 0 and 1 and if you raise this to, say, the 3rd power, it *still* ranges between 0 and 1. Except that now there are a lot more numbers closer to 0 and less of them close to 1. So the distribution changes. This is what we do to either `uf` or `vf` (50% chance of picking one or the other). Then we add the integer part back, so now we got a random coordinate over the same range, but every fractional part is skewed towards its lower end. This divides your worbly surface into blocks, and plots more points at the "left" and "top" edges of the block, making it darker. We also want the other two edges darker, so we add a 50% chance of flipping the fractional parts, that is the fractional part becomes `(1 - uf, 1 - vf)`. Do that and you got the snakeskin-like grid texture.

Comes the last part, colour! It's pretty easy, I take the integer coordinates `(ui, vi)` and I hash them together to form a single number, modulo 8



