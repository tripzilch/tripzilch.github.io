# How to make sinusoid wobbly functions

I find that for many uses they're just as good as a (simplex or perlin) noise function, except they are a little bit more controllable, and they have a more organic, swinging, wavy or indeed soothing feel to them. a bit more like "it's doing something" rather than smooth but also completely unpredictable.

What follows are some basic formulas for sinusoid wobblies, and a bunch of tips and rules of thumb on how to tweak them, based on years of experimenting with these things :)

## Building the formula

Let's assume our goal is a 2D sinusoid function that evolves over time `t` (usually you'd use a 3D noise function for the time dimension).

We start with a simple 1D sine wave over `x`, that moves with time:

	sin(a * x + b * t + c)

<canvas id="sin1d"></canvas>
<script>
    class Graph1Dt {
        constructor(canvas, f) {
            this.W = canvas.width = 600;
            this.H = canvas.height = 300;
            this.ctx = canvas.getContext("2d");
            this.f = f;
            // graphing variables
            this.minx = -5;
            this.maxx = 5;
            this.miny = -1.5;
            this.maxy = 1.5;
            this.bgcol = "#000";
            this.fgcol = "#fff";
        }
        draw() {
            const t = Date.now() / 1000;
            const xs = (this.maxx - this.minx) / this.W, x0 = this.minx;
            const ys1 = this.H / (this.maxy - this.miny), y0 = this.miny;
            const ctx = this.ctx;
            ctx.fillStyle = this.bgcol;
            ctx.strokeStyle = this.fgcol;
            ctx.lineWidth = 3.0;
            ctx.fillRect(0, 0, this.W, this.H);
            ctx.beginPath();
            for (let x = 0; x < this.W; x++) {
                const fx = x * xs + x0;
                const fy = this.f(fx, t);
                const y = (fy - y0) * ys1;
                if (x == 0) { 
                    ctx.moveTo(x, y); 
                } else {
                    ctx.lineTo(x, y);
                }
            }            
            ctx.stroke();
            requestAnimationFrame(this.draw.bind(this));
        }
    }
    const sin = Math.sin;
    let graph = new Graph1Dt(sin1d, (x, t) => sin(2 * x + 3 * t + 5));
    graph.draw();
</script>

* `a` is the scale of the wave over x, smaller numbers make longer waves.
* `b` is the scale of movement over time, bigger numbers move faster.
* `c` is the phase of the wave, at which point it starts (this becomes more important once you start combining waves).

Next, we modulate this sine wave with another sine wave, over `y`. We take the formula above, and add inside the `sin` function another wave just like the formula above, except with `y` instead of `x`. Note that this formula is now a 2D function over time, since it uses both `x` and `y`:

	sin(a * x + b * t + c + d * sin(e * y + f * t + g))

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