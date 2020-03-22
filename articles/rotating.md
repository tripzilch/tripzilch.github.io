# How to make interesting rotating things
*by Piter Pasma, March 2020*

In this article, I will discuss my findings about rotating things. I think they are sometimes also called *harmonographs*, but that is a very general class.

There are various curious combinatorial things going on, as well as things related to the greatest common divisor. I wonder if there is some field of math that deals with these things.

## One rotating thing

So we got a function for a rotating vector:

    const circle = (phi, r) => vec2(r * cos(phi), r * sin(phi));

We can turn this into a function that takes a frequency, phase and amplitude to make a rotating thing. The rotating thing is a function that takes a parameter `s` which goes from 0 to 1, and returns a point that traces a circle of radius `a` around the origin, `f` times. The phase `p` basically shifts `s` so that the circle starts somewhere else.

    const R = (f, p, a) => s => circle((s * f + p) * TAU, a);

## Two rotating things

Now what happens if you add two rotating things together? Let's try it out over here:

<script src="util.js"></script>
<script src="vec2.js"></script>
<script src="graph.js"></script>

<div id="ex1" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    const circle = (phi, r) => vec2(r * cos(phi), r * sin(phi));
    const R = (f, p, a) => s => circle((s * f + p) * TAU, a);
    const vec_add = (a, b) => a.xy.add(b);
    let g1 = new Graph2Dst("ex1", "vec_add(R(1, 0, 1)(s), R(-2, 0, 1)(s))");
    g1.draw();
</script>

You can edit the formula. Remember that the parameters for `R` are *frequency*, *phase* and *amplitude*. So `R(-2, 0, 1)` means a frequency of -2, phase shift of 0 and an amplitude of 1.

We can notice a few interesting things:

* In order to get a nice closed loop over `s = 0..1`, you'll need integer frequencies.
* One has to turn against the other, that is one frequency has to be negative. If you don't do this you'll get boring/ugly pictures, go ahead and try.
* It doesn't help to add two rotating things with the same frequency, you'll just get a circle, or a line if one is negative.
* It doesn't matter which frequency goes first because addition is commutative.
* It doesn't matter which one is negative.
* If you change the phases the figure rotates. Remember the phases are between 0 and 1, whole numbers imply a full turn.
* You get different shapes if you make the amplitudes different sizes.
* If you make the amplitude negative, this is equivalent to shift the phase by 0.5. I had expected that this would mirror the figure and equivalent to making the frequency negative, but it mirrors through a point (not a line). This is the same as a 180° rotation, or a 0.5 phase shift.

## All the things

We arbitrarily decide that we're not interested in things that rotate more often than 6 times in the timespan `s = 0..1`. So we want two frequencies from {1, 2, 3, 4, 5, 6}, they can't be the same and the order doesn't matter. This gives us 15 combinations. Since it also doesn't matter which frequency is negative, we'll decide it'll always be the second one. 

You can cycle between these 15 combinations in the following figure:

<div id="ex2" class="live"> <canvas></canvas> <input type="text" /> 
<input type="radio" name="f15" value="1, -2" checked />
<input type="radio" name="f15" value="1, -3" />
<input type="radio" name="f15" value="1, -4" />
<input type="radio" name="f15" value="1, -5" />
<input type="radio" name="f15" value="1, -6" />
<input type="radio" name="f15" value="2, -3" />
<input type="radio" name="f15" value="2, -4" />
<input type="radio" name="f15" value="2, -5" />
<input type="radio" name="f15" value="2, -6" />
<input type="radio" name="f15" value="3, -4" />
<input type="radio" name="f15" value="3, -5" />
<input type="radio" name="f15" value="3, -6" />
<input type="radio" name="f15" value="4, -5" />
<input type="radio" name="f15" value="4, -6" />
<input type="radio" name="f15" value="5, -6" />
</div>
<script>
    let g2 = new Graph2Dst("ex2", "vec_add(R(1, 0, 1)(s), R(-2, 0, 1)(s))");
    document.querySelectorAll('input[name=f15]').forEach(r => {
        r.addEventListener('click', ev => {
            let [f1, f2] = ev.target.value.split(', ');
            g2.change_fn(`vec_add(R(${f1}, 0, 1)(s), R(${f2}, 0, 1)(s))`);
        })
    });
    g2.draw();
</script>
