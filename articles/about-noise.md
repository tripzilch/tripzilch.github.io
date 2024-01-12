# About noise

## What is a noise function?

When we are talking about a noise function, it can be a lot of things. It also depends on what we need it for.

So what do we expect from a noise function? 

It can be any function with any number of input parameters, and any number of output parameters. 

But to make it easier, we shall focus on just one output parameter, and if we need more, we use several noise functions with different seeds. This is pretty much equivalent unless you want very complicated noise.

The number of input parameters decides how many dimensions your noise has. This requirement depends on your application.

The two other rough requirements of a noise function are that it is 1) smooth and 2) random :-)

In general, a noise function gets exponentially more complex (slow) the higher of an input dimension it has. So don't make a 4D noise if you can get away with a 2D noise. You can already do very cool things with just 1D noise, if you get creative!

## So how do you create one?

How you create this function is really up to you. Maybe it would be kind of fun to start with 1D noise and work your way up.

## No but really

The basic strategy could be generate an array of random numbers and have your noise function interpolate between them. Straight forward and fast.

You can interpolate between two values `a` and `b` with this simple formula, where `p` goes from 0 to 1 in order to go from `a` to `b`:

```js
let mix = (a,b,p)=>a+p*(b-a);
```

It's a very useful function, in p5 it's called `lerp` (which is short for "**L**inear int**ERP**olate"--really!), but I call it `mix` because that's what GLSL does and it's shorter.

If you want to interpolate in 2D, you need four numbers two interpolate between (one for each corner of a grid square), we shall call them `a00`, `a01`, `a10` and `a11`. Further, you need two numbers to interpolate by, because we're in 2D: `px` and `py`.

The interpolation formula for this is:

```js
mix(mix(a00,a01,px),mix(a10,a11,px),py);
```

and if you write that out, it'll become:

```js
a00*(1-px)*(1-py) + a01*px*(1-py) + a10*(1-px)*py + a11*px*py
```

which is probably faster (I don't know! Really! Always test it for your own use case, Javascript has very weird performance quirks sometimes).

Now you fill an Array (or a Float32Array if you care about performance) (maybe a Float64Array would be faster? It could be!) with random numbers from your favourite PRNG. You need a 2D Array of course, because well, we're in 2D.

Then you write a function that takes a bunch of coordinates as input. It rounds those coordinates to the grid cell it is in, and takes the values of the four corners from the Array (make sure your indices wrap). Then you interpolate based on the coordinates within the grid cell, and you got yourself a noise function!!

## Did you write your noise function like this?

My noise function that sort of does this, except it uses the smoothstep polynomial to interpolate instead of linear interpolation -- and this really "colours" the noise in some way. My noise has its unique flavour because of some these choices I made. This is why I recommend building your own :-)

Using the smoothstep polynomial means that before you call all the `mix` functions from the above code, you perform a tiny operation on `px` and `py`:

```js
  px=px*px*(3-2*px);
  py=py*py*(3-2*py);
```

This is the formula for turning the straight line from 0 to 1 into a nice sigmoid curve. It adds extra smoothness, but also changes the way it wobbles, so check if you actually need this and like it.

## What about the Array?

My noise doesn't actually use an Array, but a tiny static PRNG, which is just a function that returns a constant pseudo-random value for each integer grid point (in 2 or 3 dimensions). But it still repeats every 1024 units (more than enough for me) similar to how an Array would.

## What other sorts of types of noise are there?

Many!

The type of noise I've explained so far is called _value noise_ because it interpolates between values on grid points. So I guess you could call my variant smoothstep interpolated value grid noise.

Instead of a grid you can also use so-called "simplices" (in 2D the simplex is a triangle, and in 3D it is a tetrahedron, it's the ND volume that has exactly N+1 vertices). Then you get simplex noise. But grid noise is way easier to code, especially if it's your first noise. Simplex noise definitely has a different feel to it though. The advantage is that it is more efficient, especially for higher dimensional noises.

There is also another type of noise called _gradient noise_, as opposed to _value noise_. This puts random gradients on the grid points and interpolates between those. This is what Perlin noise and P5's noise function do. Because it interpolates the gradients and not the values, the minimum and maximums of the values is a little bit hard to calculate exactly.

And again, using gradient or value noise changes the "colour" of your noise. I have never implemented gradient noise myself, and thus not explored it very much, so I can't say in exactly what way, but I'm sure it's somehow different.

These are not by far the only types of noise, or ways to generate ND functions that are smooth and random.

## There are even more different types of noise?

Sure! One interesting and quite different method is what I like to call "wobbly noise". The idea is that sine waves are already smooth, it's just a matter of making them look sufficiently "random". You can already get semi random waves simply by adding a few sine waves together: https://graphtoy.com/?f1(x,t)=sin(x%20+%201)%20+%20sin(x%20*%201.618%20+%203)%20+%20sin(x%20*%202.618%20+%205)&v1=true&f2(x,t)=&v2=false&f3(x,t)=&v3=false&f4(x,t)=&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=1&coords=0,0,13.200000000000015 

But you can also notice that if you zoom out, some repetitive patterns become visible. However this doesn't need to be a problem. Sometimes you want your noise to define large features, and only a few "waves" (or "blobs") are visible anyway. You may have found that if you zoom in too far on grid-based noise (like P5's), some grid artifacts can appear, and this is where sine waves really shine -- they're not based on grids at all.

One thing that is important to realize for randomizing your wobbly noise, a generic sine wave looks like this: `a * sin(x * f + p)`. Here `a` is the amplitude, `f` is frequency and `p` is phase. Finetuning the amplitude and frequency changes the look and feel of your wobbly noise. But you can always fully randomize the phases (in a periodic range from 0..2*PI).

One other thing that may be useful, you can use sine waves to modulate each other. 

Multiply them together for amplitude modulation: `a * sin(x * f0 + p0) * sin(x * f1 + p1)`. 

Or put one sine wave inside another for phase modulation: `a * sin(x * f0 + p0 + MA * sin(x * f1 + p1))` where I set MA=2 or 3, usually. 

I find this formula is a very nice basic start