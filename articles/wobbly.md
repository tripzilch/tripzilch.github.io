# How to make sinusoid wobbly functions

*Warning: this article is unfinished (but it's gonna be really cool) and halfway turns into a rambling braindump.*

I find that for many uses they're just as good as a (simplex or perlin) noise function, except they are a little bit more controllable, and they have a more organic, swinging, wavy or indeed soothing feel to them. A bit more like "it's doing something" rather than just being smooth and unpredictable.

What follows are some basic formulas for sinusoid wobblies, and a bunch of tips and rules of thumb on how to tweak them, based on years of experimenting with these things :)

## Building the formula

Let's assume our goal is a 2D sinusoid function that evolves over time `t` (usually you'd use a 3D noise function for the time dimension).

We start with a simple 1D sine wave over `x`, that moves with time:

<script src="graph.js"></script>

<div id="sin1d" class="live"> <canvas></canvas> <input type="text" /> </div>
<script>
    let graph = new Graph1Dxt("sin1d", "sin(2 * x + 3 * t + 5)");
    graph.draw();
    // Graph1D
</script>

	sin(a * x + b * t + c)
    
* `a` is the scale of the wave over x, smaller numbers make longer waves.
* `b` is the scale of movement over time, bigger numbers move faster.
* `c` is the phase of the wave, at which point it starts (this becomes more important once you start combining waves).

Next, we modulate this sine wave with another sine wave, over `y`. We take the formula above, and add inside the `sin` function another wave just like the formula above, except with `y` instead of `x`. Note that this formula is now a 2D function over time, since it uses both `x` and `y`:

	sin(a * x + b * t + c + d * sin(e * y + f * t + g))


<!-- <canvas id="wob1d"></canvas>
<input type="text" id="wob1dt" class="">
<script>

    let graph2 = new Graph1Dt(wob1d, (x, t) => sin(2 * x + 2 * t + 5 + 2 * sin(1.5 * x + -0.5 * t + 3)));
    graph2.draw();
</script> -->

* `a`, `b` and `c` are just like above.
* `d` is the magnitude of the modulation. Set it to zero for no modulation, and it becomes just like the formula above. Higher values make the resulting wave increasingly erratic.
* `e` is the scale of the modulation in `y`. Smaller numbers make for larger wobbles.
* `f` is the speed at which the modulation happens. The wave sort of morphs faster or slower.
* `g` is the phase of the modulating wave. Put any number between 0 and 2\*PI here.

However, this is not yet enough! I should probably include an image or GIF here to show what it looks like so far. If you were to plot this 2D function as a grey scale map, it looks like a rather plain wavey thing that is just scrolling in some direction.

Fortunately, we can take *two* of the above formulas, one with the `x` and `y` swapped, and completely different parameters of course. Then we just add them together:

    w0 = sin(a * x + b * t + c + d * sin(e * y + f * t + g))
    w1 = sin(h * y + i * t + j + k * sin(l * x + m * t + n))
    result = w0 + w1

As you can see, the number of parameters is getting kind of ridiculous. This is what stops me from writing a nice generic `Wobbly` class, you'd have to give it so many parameters, you might as well write the formula. So what I usually do is hardcode them in: 

	float wobbly(float x, float y, float t) {
		float w0 = sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * sin(0.4 * y + -1.3 * t + 1.0));
		float w1 = sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * sin(0.5 * x + -1.2 * t + 0.5));
		return (w0 + w1 + 2) * 0.25;
	}

Note that the `sin` function outputs between -1 and 1. If you add two of them together, the result is between -2 and 2. Therefore the last line adds the two waves together but also scales the result to a value between 0 and 1.

## How to pick the parameter values?

 Well it's good to experiment, but here are a few rules of thumb:

* The ones that you multiply with `x` or `y` (both in the outer and inner `sin` functions) basically depend on the resolution of your coordinates. Remember that a full wave goes from 0 to 2\*PI (6.28), so if your coordinates are between 0 and 1, using a value of 6.0 will give you slightly less than one wave. If you want more you need a higher number. But if you use pixel coordinates, you actually want a much smaller number like 0.073. You can calculate the range, but you can also sort of guesstimate it and try. Try to use somewhat similar values for the corresponding `x` and `y` parameters, so the change along `x` is roughly the same as the change along `y`.
* The ones that you multiply with `t` depends on what the resolution of your timer variable is (seconds or milliseconds or frames?) and how fast you want the waves to go. One important trick is to also use negative values for some (but not all) of the `t` parameters, as seen in the code above. That way the waves and modulating waves sort of move "against" eachother, resulting in different patterns. You can get a somewhat stationary morphing effect if you do it right. Another very important trick is that if your `t` value goes between 0 and 2\*PI, and you pick only integer values for the parameters, you will *always* get a perfect loop, which can be nice for animations.
* For the phases you can pretty much pick any number. Note that waves repeat at 2\*PI, so a phase of 2.3 is exactly equivalent to a phase of 2.3 + 2\*PI. Therefore it makes best sense to pick numbers between 0 and 2PI. Or between -PI and PI (which is the same range, just shifted). The phase parameters are probably the easiest to randomize, without having to worry that the wave gets really wild or ugly. If you have selected a bunch of parameters that creates a pleasing pattern/motion, and you just want a "different but similar" one, shake up the phase parameters and there you go.

## Where to go from here? 

Well you can combine sine waves in all sorts of manners, this is just a particular form that I've found is useful as a good starting point.

You could modulate the inner `sin` function with a third sine wave. I usually don't do this because it makes the formula very long. Also the wobbling thing may wobble between periods of slow and very fast wobbling. Which may or may not be what you want.

Instead of adding two, you could add three (or four!) modulated sine waves together. This is a great idea if the wobbly function still seems somewhat too "regular" or predictable. The easiest way is to use similar but slightly tweaked parameters. But maybe it's a cool idea to add waves of different scale/frequency together, I haven't really tried that.

Cosine waves are just sine waves shifted in phase by PI/4, so it doesn't help using the `cos` function, as you are already tweaking the phase parameters.

You can also not modulate the sine wave, but instead just add together a whole bunch of simple sine waves (the first formula) with slightly different frequency, speed and phase. I think you'd need at least five or so before it stops looking too regular. It's very important to randomize the phases properly so they don't all start at 0. Disclaimer: I haven't really experimented with this variation a lot.

You can also modulate the sine wave with an actual perlin or simplex noise function! That way you might (again, not tested) get something in between the organic feel of a wobbly motion and the unpredictability of noise. Or maybe the other way around ...

## 2D wobbly

A good formula to start with is modulating a sine over `x` with a sine over `y`: `sin(px + fx * x + a * sin(py + fy * y))`.
Here `fx` and `fy` are the frequencies, if coordinates range between -1 and 1, then 2.3 and 3.2 are good values for a smooth plasma. But you can experiment with any value you like. It usually looks best if their ratio is less than twice apart.
`px` and `py` are the phases, choose these between -PI and +PI (or between 0 and TAU). Choosing outside this range just repeats and is no use.
`a` is the modulation amplitude. This is how extreme the modulation is. Because it's fed into a `sin` function, I usually choose between -PI and +PI, but you can go outside this range.

Now you may find that this looks fairly boring, and this is because you need to copy this formula, add it to itself, except with the `x` and `y` swapped (and all different numbers of course).
Because the result is the sum of two sine waves, it ranges between -2 and 2. Therefore you do `0.5 + 0.25 * (the entire thing)` to scale it to 0 and 1.

Try it with greyscale first. It's incredibly hard to see what happens when you change the parameters between 3 colour channels at once. Besides, doing that blindly will result in nothing but rainbow puke. If you want nice colours try slight incremental phase offsets between R, G and B. Leave the frequencies the same. After you tried that, realise that this is also about the extent of what you can usefully do with colour in the RGB colour space without using a palette (prove me wrong, though :) ).