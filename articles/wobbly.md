# How to make sinusoid wobbly functions

## What is this article about?

Wobbly functions!

In generative art, we like using noise functions for all sorts of purposes. Given their often central role, wouldn't it be fun to build your own noise function? 

Although that is not really what this article is about. Wobbly functions are something that you can (sometimes) use _instead_ of a noise function, and that you can build yourself! Or let's say they are a very specific type of noise function that is easy to implement and therefore modify to make your own. They're also relatively underused, and the people using them right now might not call them "wobbly functions". But they are also not writing this article.

## What is a wobbly function?

Wobbly functions are functions based on sine waves. Any kind. Whatever you can dream up. But I can share a couple of techniques you may find interesting.

## Sine waves?

In school, you may have learned that the sine and cosine functions are useful for calculating things about right angled triangles. They were not wrong, but let's focus right now on a more important truth:

***Sine waves have a funny shape.***

Drawing graphs in school, we started with linear equations, which are just lines. Boring. Next up were parabolas, kinda curvy and neat but they run off the paper really quick, not super practical. No, sine waves are where it's at.

Let's start with a graph of a simple sine wave over `x` that moves with time (`t`):

<code>[{xlim:[-4,4],ylim:[-1.1,1.1]},(x,t)=>sin(2*x + 3*t + 5)]</code>
{:.live}

Note that you can edit the formula and play with it. Also, you can click on the graph to make it stop moving.

I promise we'll get to more interesting wobbles soon, but try changing some of the numbers in the formula above, and see what happens.

The number that you multiply `x` by determines how close the waves are. It's how "fast" we move from left to right through the sine wave. If you increase the number, you move faster to the right, and thus move through more waves. This number is a _frequency_, because it determines how many waves you get to see.

The number that you multiply `t` by determines how fast the waves move in time. It's very similar to the previous number, but it's a _time_ frequency, instead of a _space_ frequency. For the same reason, because if you increase the number, they move faster and you get to see more waves.

The last number is the lonely number that you just add. This one is a bit different, it sets the _phase_ of the sine wave. Try using `0*t` in the formula above, to stop the wave from moving entirely. Now modify the phase and notice how this shifts the sine wave around. In fact once you turn on movement again with `1*t`, what really happens is that this phase gets continuously increased, as `t` increases (because time goes forward). But you could say the same for `x`, right? Well, think about that for a bit.

The point is that it's important to realize when you're modifying _frequencies_ or _phases_. A frequency is basically the speed at which the phase moves. In order to move, it needs a dimension. In the above example we move the phase in both the _space_ (`x`) and _time_ (`t`) dimension. Congratulations, it's a continuum!

A useful thing to know about phases of sine waves is that they repeat every `TAU = 2*PI = 6.2831853` units. That's how far the waves are apart when you do `1*x`. It's also exactly how many seconds it takes for the wave to repeat when you do `1*t`. Try setting the time frequency to `TAU*t` and the sine waves should now oscillate every second.

## How do I make it more irregular?

We need more sine waves. Jean-Baptiste Joseph Fourier once figured out that if you add enough sine waves together, you can do pretty much anything.

Here's two sine waves added together (zoomed out a little, to show more of them):

<code>[{xlim:[-12,12],ylim:[-3,3],yticks:[-2,-1,0,1,2]},
    (x,t)=>sin(2*x + 3*t + 1) + sin(3*x + 2*t + 2)]</code>
{:.live}

That's more irregular, right? 

Not really? Thing is that by using only integer numbers 2 and 3, we're limiting the waves to interfere with each other in either 2:3 or 3:2 ratios. They will in fact repeat every 6 units (6 being the "least common multiple" of 2 and 3). But this might be exactly what you need, if you want a repeating function (maybe a looped animation?) that wobbles slowly but slightly more interesting than a simple sine wave.



## Unsorted

*Warning: this article is unfinished (but it's gonna be really cool) and halfway turns into a rambling braindump.*

I find that for many uses they're just as good as a (simplex or perlin) noise function, except they are a little bit more controllable, and they have a more organic, swinging, wavy or indeed soothing feel to them. A bit more like "it's doing something" rather than just being smooth and unpredictable.

What follows are some basic formulas for sinusoid wobblies, and a bunch of tips and rules of thumb on how to tweak them, based on years of experimenting with these things :)

## Building the formula

Let's assume our goal is a 2D sinusoid function that evolves over time `t` (usually you'd use a 3D noise function for the time dimension).

We start with a simple 1D sine wave over `x`, that moves with time:

<code>[{xlim:[-4,4],ylim:[-1.1,1.1]},(x,t)=>sin(2*x + 3*t + 5)]</code>
{:.live}

blairf blorf

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

<script src="graphs.js"></script>
