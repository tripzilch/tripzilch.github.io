# How to make interesting rotating things
*by Piter Pasma, March 2020*

In this article, I will discuss my findings about rotating things. I think they are sometimes also called *harmonographs*, but that is a very general class.

There are various curious combinatorial things going on, and things related to ratios. I wonder if there is some field of math that deals with these things.

## One rotating thing

So we got a function for a rotating vector:

    const circle = (phi, r) => vec2(r * cos(phi), r * sin(phi));

We can turn this into a rotating function that takes a *frequency*, *phase* and *amplitude*. It also takes a final parameter `s`,  which goes from 0 to 1. It returns a point that traces a circle of radius `a` around the origin, `f` times. The phase `p` shifts `s` so that the circle starts somewhere else.

    const R = (f, p, a, s) => circle((s * f + p) * TAU, a);

## Two rotating things

Now what happens if you add two rotating functions together? Let's try it out over here:

<script src="util.js"></script>
<script src="vec2.js"></script>
<script src="graph.js"></script>

<div id="ex1" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    const circle = (phi, r) => vec2(r * cos(phi), r * sin(phi));
    const R = (f, p, a, s) => circle((s * f + p) * TAU, a);
    const vec_add = (a, b) => a.xy.add(b);
    let g1 = new Graph2Dst("ex1", "vec_add(R(1, 0, 1, s), R(-2, 0, 1, s))");
    g1.draw();
</script>

You can edit the formula. Remember that the parameters for `R` are *frequency*, *phase* and *amplitude*, followed by `s`. So `R(-2, 0, 1, s)` means a frequency of -2, phase shift of 0 and an amplitude of 1.

We can notice a few interesting things:

* In order to get a nice closed loop over `s = 0..1`, you'll need integer frequencies.
* One has to turn against the other, meaning one frequency has to be negative. If you don't do this you'll get boring/ugly pictures, go ahead and try.
* It doesn't help to add two rotating functions with the same frequency, you'll just get a circle, or a line if one is negative.
* It doesn't matter which frequency goes first because addition is commutative.
* It doesn't matter which one is negative.
* If you change the phases the figure rotates. Remember the phases are between 0 and 1, whole numbers imply a full turn.
* You get different shapes if you make the amplitudes different sizes.
* If you make the amplitude negative, this is equivalent to shift the phase by 0.5. I had expected that this would mirror the figure and equivalent to making the frequency negative, but it mirrors through a point (not a line). This is the same as a 180° rotation, or a 0.5 phase shift.

## All the things

We arbitrarily decide that we're not interested in things that rotate more often than 6 times. So we want two frequencies from {1, 2, 3, 4, 5, 6}, they can't be the same and the order doesn't matter. Since it also doesn't matter which frequency is negative, we'll decide it'll always be the second one. This gives us 15 combinations. 

You can cycle between these 15 combinations in the following figure:

<div id="ex2" class="live"> <canvas></canvas> <input type="text" /> 
<b class="selected">1:2</b> <b>1:3</b> <b>1:4</b> <b>1:5</b> <b>1:6</b> <b>2:3</b> <b>2:4</b> <b>2:5</b> <b>2:6</b> <b>3:4</b> <b>3:5</b> <b>3:6</b> <b>4:5</b> <b>4:6</b> <b>5:6</b> 
</div>

<script>
    let g2 = new Graph2Dst("ex2", "vec_add(R(1, 0, 1, s), R(-2, 0, 1, s))");
    let ex2_select = 0;
    let ex2_opt = document.querySelectorAll('#ex2 b');
    ex2_opt.forEach((elt, idx) => {
        elt.addEventListener('click', ev => {
            ex2_opt[ex2_select].className = '';
            ex2_select = idx;
            let el = ex2_opt[idx];
            el.className = 'selected';
            let [f1, f2] = el.innerText.split(':');
            g2.change_fn(`vec_add(R(${f1}, 0, 1, s), R(-${f2}, 0, 1, s))`);
        });
    });
    g2.draw();
</script>

Now some interesting things happen and patterns start to emerge. 

First off, we notice that some combinations result in the same figure. For instance `1:2` is the same as `2:4`. If you think about it, `2:4` actually draws the figure twice, both rotations go twice as fast and complete the loop twice. Another way to look at this is by thinking of *ratios*: the ratio 1/2 is the same value as the ratio 2/4. So just like with ratios, we can *simplify* `2:4` into `1:2`. The reason why we don't discard these duplicates just yet, is because they're not *really* the same; it draws the figure multiple times. Later when we modulate the parameters, this will become important.

An even more interesting pattern appears when we list the number of the rotational symmetry of the figure in a table. Can you figure out the pattern?

__f1__  |  __f2__ (negative) |  __symmetry__
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

    const O = (f, p, v, d) => s => v + d * sin((s * f + p) * TAU)

Wow, did I say simple? This one takes four parameters, *frequency*, *phase*, *value* and *deviation*.

The fun thing is, as long as you use integer frequencies, this function exactly loops back on itself. That means you can replace any value in our previous formula with an oscillator, and it will still be a smooth loop.

<div id="ex3" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    const O = (f, p, v, d, s) => v + d * sin((s * f + p) * TAU);
    let g3 = new Graph2Dst("ex3", "vec_add(R(2, 0, O(5, 0, 1, 0.5, s), s), R(-3, 0, 1, s))");
    g3.draw();
</script>

That's pretty wild! I'll wait a moment for you to make sense of it and to try out a number of things for yourself.

A few things that I find:

* It's a good idea to have the *frequency* of the oscillator be a multiple of the *symmetry* of the rotating setup (that you can look up in the table, or by eye). This way the figure retains its symmetry, otherwise it'll be lopsided and weird.
* It's not a good idea to modulate the frequency of a rotating function with an oscillator. At least, I can't get it to look right. This is okay, because modulating the phase is kind of like modulating the frequency.
* You can modulate the *phase* and the *amplitude* of both rotating functions to your heart's content. All the numbers and possibilities give great-looking shapes.

## Wow! Can you use this method to generate an infinitude of cool shapes?

You can see the results in my Instagram posts [harmonic chains 1](https://www.instagram.com/p/B3SJjjvIDHs/) and [harmonic chains 2](https://www.instagram.com/p/B3aaiErJ41k/). Without selection, you're also going to get a whole load of swastikas!

I have also used these techniques to build the shapes for [Procedural scribbles on sinusoids part I](https://www.instagram.com/p/B2kASTroQxU/) and [part II](https://www.instagram.com/p/B3ADG-FIsyv/), [Squid Yoga](https://www.instagram.com/p/B14gJRTIw6-/) and [Curly 9000](https://www.instagram.com/p/B2ByL8koZi1/).