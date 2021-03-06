# How to make interesting rotating things
*by Piter Pasma, March 2020*

<script src="util.js"></script>
<script src="vec2.js"></script>
<script src="graph.js"></script>

<div id="ex0" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    const circle = (phi, r) => vec2(r * Math.cos(phi), r * Math.sin(phi));
    const R = (f, p, a, s) => circle((s * f + p) * TAU, a);
    const O = (f, p, v, d, s) => v + d * Math.sin((s * f + p) * TAU);
    const vec2_add = (a, b) => a.xy.add(b);

    let g0 = new Graph2Dst("ex0", "vec2_add(R(5, O(7, .5, 0, .2, s), .7, s), R(-2, 0, O(7, .9, 1, .5, s), s))");
    g0.draw();
</script>

This article is about the basics of constructing cool loopy functions, sometimes also called *harmonographs* (but that's a very broad term), and shows step by step how I build and investigate some possible formulas for them.

There are various curious things to do with combinatorics going on, and things related to ratios. If you have a better idea than me about the math involved in these kinds of things, please let me know!

## Quick Javascript vectors

The code examples in this article will be in Javascript. If you use a framework like P5js or D3, you probably already have a proper vector class available. But if you don't, let's do this really quickly. A (2D) vector is just an object that holds an x and a y-coordinate:

```js
const vec2 = (x, y) => ({'x': x, 'y': y});
```

The only thing we'll be doing to vectors today is adding them. So let's define a function for that:

```js
const vec2_add = (a, b) => vec2(a.x + b.x, a.y + b.y);
```

And now we can begin.

## One rotating thing

Let's start with a rotating vector. We can define this in Javascript like this:

```js
const circle = (phi, r) => vec2(r * Math.cos(phi), r * Math.sin(phi));
```

We can turn this into a rotating function that takes a *frequency*, *phase* and *amplitude*. It also takes a final parameter `s`,  which goes from 0 to 1. It returns a point that traces a circle of radius `a` around the origin, `f` times. The phase `p` shifts `s` so that the circle starts somewhere else.

```js
const R = (f, p, a, s) => circle((s * f + p) * TAU, a);
```

![A circle](rotating-circle.png)
*If you draw this function, it looks like this.*

## Two rotating things

Now, what happens if you add two rotating functions together? Let's try it out over here:

<div id="ex1" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    let g1 = new Graph2Dst("ex1", "vec2_add(R(1, 0, 1, s), R(-2, 0, 1, s))");
    g1.draw();
</script>

You can edit the formula. Try changing some of the numbers above. Remember that the parameters for `R` are *frequency*, *phase* and *amplitude*, followed by `s`. So `R(-2, 0, 1, s)` means a frequency of -2, phase shift of 0 and an amplitude of 1.

We can notice a few interesting things:

* In order to get a nice closed loop over `s = 0..1`, you'll need integer frequencies.
* One has to turn against the other, meaning one frequency has to be negative. If you don't do this you'll get boring/ugly pictures, go ahead and try.
* It doesn't help to add two rotating functions with the same frequency, you'll just get a circle, or a line if one is negative.
* It doesn't matter which frequency goes first because addition is commutative.
* It doesn't matter which one is negative because flipping the sign reverses both rotating functions, so they trace the same figure backwards.
* If you change the phases the figure rotates. Remember the phases are between 0 and 1, whole numbers imply a full turn.
* You get different shapes if you make the amplitudes different sizes.
* If you make the amplitude negative, this is equivalent to shift the phase by 0.5. I had expected that this would mirror the figure and equivalent to making the frequency negative, but it mirrors through a point (not a line). This is the same as a 180° rotation, or a 0.5 phase shift.

## All the things

We arbitrarily decide that we're not interested in things that rotate more often than 6 times. So we want two frequencies from {1, 2, 3, 4, 5, 6}, they can't be the same and the order doesn't matter. Since it also doesn't matter which frequency is negative, we'll decide it'll always be the second one. This gives us 15 combinations. 

You can try out all of these 15 combinations using the buttons below the following figure:

<div id="ex2" class="live"> <canvas></canvas> <input type="text" /> 
<b>1:2</b> <b>1:3</b> <b class="selected">1:4</b> <b>1:5</b> <b>1:6</b> <b>2:3</b> <b>2:4</b> <b>2:5</b> <b>2:6</b> <b>3:4</b> <b>3:5</b> <b>3:6</b> <b>4:5</b> <b>4:6</b> <b>5:6</b> 
</div>

<script>
    let g2 = new Graph2Dst("ex2", "vec2_add(R(1, 0, 1, s), R(-2, 0, 1, s))");
    let ex2_select = 0;
    let ex2_opt = document.querySelectorAll('#ex2 b');
    ex2_opt.forEach((elt, idx) => {
        const click_fn = ev => {
            ex2_opt[ex2_select].className = '';
            ex2_select = idx;
            let el = ex2_opt[idx];
            el.className = 'selected';
            let [f1, f2] = el.innerText.split(':');
            g2.change_fn(`vec2_add(R(${f1}, 0, 1, s), R(-${f2}, 0, 1, s))`);
        };
        elt.addEventListener('click', click_fn);
        if (elt.className == 'selected') click_fn();
    });
    g2.draw();
</script>

Now some interesting things happen and patterns start to emerge. 

First off, we notice that some combinations result in the same figure. For instance `1:2` is the same as `2:4`. If you think about it, `2:4` actually draws the figure twice, both rotations go twice as fast and complete the loop twice. Another way to look at this is by thinking of *ratios*: the ratio 1/2 is the same value as the ratio 2/4. So just like with ratios, we can *simplify* `2:4` into `1:2`. The reason why we don't discard these duplicates just yet, is because they're not *really* the same; it draws the figure multiple times. Later when we modulate the parameters, this will become important.

An even more interesting pattern appears when we list the number of the rotational symmetry of the figure in a table. Can you figure out the pattern?

__f1__  |  __f2__  |  __sym__
 1      | 2                  | 3
 1      | 3                  | 4
 1      | 4                  | 5
 1      | 5                  | 6
 1      | 6                  | 7
 2      | 3                  | 5
 2      | 4                  | 3
 2      | 5                  | 7
 2      | 6                  | 4
 3      | 4                  | 7
 3      | 5                  | 8
 3      | 6                  | 3
 4      | 5                  | 9
 4      | 6                  | 5
 5      | 6                  | 11

It appears that the symmetry of the figure is equal to *the sum of the _simplified_ frequencies*. That is, if you interpret them as a ratio, you simplify the ratio, and then you add the numerator and denominator. I think that's weird. When do you otherwise ever add the numerator and denominator of a fraction?

## Can we modulate it?

Yes we can! We can start by defining a very simple oscillator (oscillating thing?) that wobbles around a certain value, deviating by a scaled sine wave:

```js
const O = (f, p, v, d, s) => v + d * Math.sin((s * f + p) * TAU)
```

Wow, did I say simple? This one takes five parameters, *frequency*, *phase*, *value*, *deviation* and the final parameter `s`.

The fun thing is, as long as you use integer frequencies, this function exactly loops back on itself. That means you can replace any value in our previous formula with an oscillator, and it will still be a smooth loop.

<div id="ex3" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    let g3 = new Graph2Dst("ex3", "vec2_add(R(3, 0, 1, s), R(-2, O(5, 0, 0.3, 0.15, s), 1, s))");
    g3.draw();
</script>

That's pretty wild! I'll wait a moment for you to make sense of it and to try out a number of things for yourself.

A few things that I find:

* It's a good idea to have the *frequency* of the oscillator be a multiple of the *symmetry* of the rotating setup (that you can look up in the table, or by eye). This way the figure retains its symmetry, otherwise it'll be lopsided and weird.
* It's not a good idea to modulate the frequency of a rotating function with an oscillator. At least, I can't get it to look right. This is okay, because modulating the phase is kind of like modulating the frequency.
* You can modulate the *phase* and the *amplitude* of both rotating functions to your heart's content. All the numbers and possibilities give great-looking shapes.

Some weird stuff is going on still and I think my theory isn't entirely correct. I feel like I'm 90% there but also missing some big fundamental math idea. 

* The `2:6` figure has a symmetry of 4, but if you modulate it with an oscillator of frequency 4, it'll turn into a figure with symmetry 2! This makes sense if you think about it, because it traces the fourfold shape twice. 
* The `3:6` figure, which has a symmetry of 3, loses this symmetry as soon as you modulate it with a frequency 3 oscillator. My theory is partially bogus under modulation. 
* Why doesn't anything out of the ordinary happen to the `2:4` figure?
* What happens when you add three rotating functions, and when that displays symmetry. I've only tried a few combinations of these, without too much success so far.

## Wow! Can you use this method to randomly generate an infinitude of cool looking shapes?

I have! Take a look at my recent series [Epihyperderpflardioids one](https://www.instagram.com/p/B-M6rgOHBUV/), [two](https://www.instagram.com/p/B-PDx3HnHeK/) and [three](https://www.instagram.com/p/B-Rgu-SHEV9/) (more coming).

You can see earlier results in my Instagram posts [harmonic chains 1](https://www.instagram.com/p/B3SJjjvIDHs/) and [harmonic chains 2](https://www.instagram.com/p/B3aaiErJ41k/).

I have also used these techniques to build the shapes for [Procedural scribbles on sinusoids part I](https://www.instagram.com/p/B2kASTroQxU/) and [part II](https://www.instagram.com/p/B3ADG-FIsyv/), [Squid Yoga](https://www.instagram.com/p/B14gJRTIw6-/) and [Curly 9000](https://www.instagram.com/p/B2ByL8koZi1/).

## If you have read this far

You might find it interesting that in my interactive examples, besides the variable `s`, which traces around the figure, there is also another variable called `t` which counts up with time. You could use this in, say, oscillator functions and get moving shapes. Just saying you might want to go back and check that out ...

If you're not entirely sure how to implement the math discussed in this article, check out this [very simple P5js sketch](https://editor.p5js.org/triplezero/sketches/76PtMW82V).

If you make anything cool using this technique, or you have questions, or corrections, or a brilliant idea, please don't hesitate to send me a message! 