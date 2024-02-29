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

A useful thing to know about phases of sine waves is that they repeat every `TAU = 2*PI = 6.2831853..` units. That's how far the waves are apart when you do `1*x`. It's also exactly how many seconds it takes for the wave to repeat when you do `1*t`. Try setting the time frequency to `TAU*t` and the sine waves should now oscillate every second.

## How do I make it more irregular?

We need more sine waves. Jean-Baptiste Joseph Fourier once figured out that if you add enough sine waves together, you can do pretty much anything.

Here's two sine waves added together (zoomed out a little, to show more of them):

<code>[{xlim:[-12,12],ylim:[-3,3],yticks:[-2,-1,0,1,2]},
    (x,t)=>sin(2*x+3*t+5) + sin(3*x+2*t+4)]</code>
{:.live}

That's more irregular, right? 

Not really? Thing is that by using only integer numbers 2 and 3 for the frequencies, we're limiting the waves to interfere with each other in either 2:3 or 3:2 ratios. They will in fact repeat every 6 units (6 being the "least common multiple" of 2 and 3). But this might be exactly what you need, if you want a repeating function (maybe a looped animation?) that wobbles slowly but slightly more interesting than a simple sine wave.

What about the phases? Well we got two phases and we can choose them freely in the range `0..TAU`, any numbers outside that range will just be equivalent modulo `TAU`. This brings us to an important rule that holds for all wobbly noise:

**If you do your wobbly noise right, you can always get infinite random variations, simply by picking each phase randomly in the range `0..TAU`.**

But maybe you don't care about your function being periodic, in which case we are free to use non integer numbers for the frequencies. Try playing around a bit.

You may find that to get most irregular noise, you need numbers that are not too dissimilar in magnitude, but they can't be _too_ close either.

## What is the optimal ratio between frequencies?

The answer, at least for wobbly noise is the _Golden Ratio_, or `PHI = .5+.5*5**.5 = (1+sqrt(5))/2 = 1.618..`.

You kind of knew it had to be an irrational number, because those don't divide by any integer ratios, and therefore the wave could never repeat exactly. And for various measures of "how irrational is this number", the _Golden Ratio_ `PHI` is the most irrational one.

There are also other numbers which are good, if you want to go really deep down this rabbithole, check out [The Unreasonable Effectiveness of Quasirandom Sequences](https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/){:target="\_blank"}, which goes into higher dimensional sets of numbers with similar properties, of which the _Golden Ratio_ is the first.

If you need a whole bunch of frequencies, note that the _Golden Ratio_ is roughly between 1 and 2, so you can also use a random number between 1 and 2 for your frequencies: `1+R()`.

Remember that in the [Fibonacci Sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence){:target="\_blank"} the ratio of consecutive Fibonacci numbers converges to the Golden Ratio (you get closer and closer the further you go up the sequence). So if you want integer frequencies for a periodic function that are still most wobbly, these can be good choices.

## Can you add even more sine waves together?

You sure can! However when you add more than two, it becomes important to _scale_ the sine waves, otherwise the highest frequencies will dominate. A good rule of thumb is to divide each sine wave by its frequency. 

This is the same idea as when you add multiple octaves of regular noise. For each octave you double `*2` the frequency and half `/2` the amplitude (though you can use other "exponents" than 2 -- and why not the _Golden Ratio_?).

Here's four sine waves with Fibonacci frequencies, added together and scaled accordingly:

<code>[{xlim:[-12,12],ylim:[-3,3],yticks:[-2,-1,0,1,2]},
    (x,t)=>sin(3*x-3*t+5)/3 + sin(5*x+3*t+2)/5 + sin(8*x+3*t+4)/8 + sin(13*x-3*t+3)/8]</code>
{:.live}

Not bad! But note a couple of things. 

I have no idea how to properly animate it, I set the time frequencies to `3*t` and `-3*t` interchangably, this way the waves sort of crash into each other and it doesn't look like the whole thing is moving to the left. In principle the time dimension `t` should work no different than the space dimension `x`, but you can try it out, it doesn't quite work. (I actually have to experiment more with this, it's helpful, the things you find out when you make moving graphs :) ).

Second, while the waves don't repeat exactly (at least not for a very long time/distance), they do seem to _sort of_ repeat visually, don't they?

And using irrational numbers won't quite fix that, at least not entirely. It seems to be a thing that is almost inherent to wobbly functions and you can at best hide it in clever ways.

This is not always a huge problem though, sometimes you only use a small part of a noise function, and then it's fine. Check out the same graph as above, but zoomed in a bit on the x-axis:

<code>[{xlim:[-1.5,1.5],ylim:[-1.5,1.5],yticks:[-1,0,1]},
    (x,t)=>sin(3*x-3*t+5)/3 + sin(5*x+3*t+2)/5 + sin(8*x+3*t+4)/8 + sin(13*x-3*t+3)/8]</code>
{:.live}

This would do nicely if you need a smooth undulating noise-like function for a bit. And of course you get four phase values to pick randomly between `0..TAU`.

## How do I cram in even more sine waves?

Okay this is the real meat, here. We're going to put _sine waves in our sine waves_. Check out what happens if we put just one sine wave in a sine wave. No messing around, straight with random irrational-ish numbers for the frequencies and phases:

<code>[{xlim:[-4,4],ylim:[-1.1,1.1]},
    (x,t)=>sin(2.73*x + 1.21*t + 5.8 + 2 * sin(2.15*x + 1.59*t + 2.4))]</code>
{:.live}

That's it. **This is the basic building block that I use for pretty much all my wobbly functions.**

Play with the numbers a bit, get a feel for it. Try having the inner and outer frequencies (of `x`) be (almost) the same, or very different, or just kind of close like they are now.

Try imagining how exactly the same happens when you play with `t`, but it looks totally different because it's happening in the time dimension. Wobble your brain a little.

Did you notice the extra number that appeared? It's the `2 * sin(` bit. This number determines the _strength_ of how much the inner sine wave is affecting the outer one. The effect we're talking about is called _phase modulation_ by the way, because we're using the inner sine wave to _modulate_ the _phase_ of the outer sine wave.

Try reducing the modulation strength to (almost?) `0` and see how the wave turns back into a vanilla sine wave. I find modulation strengths between 2 and 3 generally work best, but experiment!

Now let's see how it looks when we add two of these:

<code>[{xlim:[-9,9],ylim:[-5,5],yticks:[-2,-1,0,1,2]},
    (x,t)=>sin(2.54*x+1.52*t+5.79+2.46*sin(1.69*x-1.83*t+1.42)) + sin(3.13*x-1.77*t+4.94+2.21*sin(2.10*x+1.86*t+4.55))]</code>
{:.live}

Looks quite random and noisy to me! It's not if you zoom out far enough, there will be patterns. But you can see as you use the building block to add more sine waves, you get quite a few random-ish noise-like wobbles before patterns start to appear.

There are four phases to pick randomly between `0..TAU` in this formula. You can of course also pick the other numbers randomly, but the ratios and relative magnitudes (I think that's the same thing) determine a lot about the character of the noise.

## But what if I need 2D noise?

Alright so check this:

<code>[{xlim:[-4,4],ylim:[-2,2],flim:[-2,2],yticks:[],xticks:[],aspect:3/8},
    (x,y,t)=>sin(2.31*x+1.11*t+5.95+2.57*sin(1.73*y-1.65*t+1.87)) + sin(3.09*y-1.28*t+4.15+2.31*sin(2.53*x+1.66*t+4.45))]</code>
{:.live}

This is basically the same formula as the last, except with slightly different random numbers, and with a `y` space dimension thrown in.

I have mixed up the dimensions, so in the first term, a sine wave on `y` is modulating a sine wave on `x`, and in the second term the other way around.

There are some variations on this formula, but I find it's best to be strategic about it. For instance, adding `x` and `y` together somewhere in the formula basically amounts in a rotation + scaling, which may or may not be what you intended.

Yes, there are quite some visible patterns, however 1) I zoomed out a bit on purpose because 2) the patterns actually look kind of cool and 3) you can always add more sine waves into the mix.

When I go for option 3, I usually duplicate the above formula (with fresh random numbers), but have the second term be (roughly) double the frequency, and divided by 2. This sort of emulates the idea of adding an octave of the noise. Usually one octave is enough. If you want even finer detail, a different noise algorithm than wobbly noise might suit your needs better.

Anyway, mainly so I didn't write the 2D visualizer for just one interactive picture, here's the formula for what I just described:

<code>[{xlim:[-2,2],ylim:[-1,1],flim:[-3,3],yticks:[],xticks:[],aspect:3/8},
    (x,y,t)=>sin(2.31*x+0.11*t+5.95+2.57*sin(1.73*y-0.65*t+1.87)) + sin(3.09*y-0.28*t+4.15+2.31*sin(2.53*x+0.66*t+4.45))+sin(3.06*x-0.18*t+5.16+2.28*sin(2.27*y+0.71*t+3.97))+sin(5.40*y-0.13*t+4.74+2.83*sin(3.71*x+0.96*t+4.42))/2]</code>
{:.live}

It sort of works, but I cheated a little by zooming in further. Once you zoom out, what really becomes apparent is the diagonal patterns. I think you can get rid of most of these by rotating `x` and `y` by 45 degrees in the second octave term (`rx=.707*x+.707*y;ry=.707*y-.707*x;` should do the trick, where `.707 ~= sqrt(2)`).

There are definitely some variations possible on this formula. But again, I advise you to be strategic about your modifications, really understand what effect they have, for the best results.

## Are there any other ways to combine sine waves?

The major one I haven't mentioned so far is multiplying them together. You can totally do this, and according to some trigonometric identities, this happens to be equivalent to adding up a bunch of different sine waves.

But not _quite_, when you do it to wobbly building blocks, or phase modulated sine waves. Interesting stuff may happen, I have not experimented with multiplication this too much. My intuition says the noise gets a bit more "spiky", in some sense.

But apart from adding, phase modulating and/or multiplying sine waves together, I don't really know of any other meaningful ways to combine sine waves that are useful for wobbly noise. If you can come up with any, please do let me know!

## What are the advantages of wobbly noise?

* Almost every noise function has some kind of artifacts or visible "signature". I happen to find the ones that wobbly noise creates rather pleasing, because they consist of smoothly undulating phase modulated sine waves.

* Especially when you need relatively large noise features, wobbly noise can come in useful. Many other types of noise functions have visible artifacts when zooming in too far, but wobbly noise just becomes really, really smooth.

* They never taught you this in trigonometry class.

## Isn't phase modulation also a synthesizer thing or something?

Yes. And I will write a bunch more about how these two concepts are related. (TODO)

## Any secret tricks?

Okay fine if you've read this far :)

* A trick that I discovered quite recently is that you can raise the inner sine wave of the wobbly building block to the _third power_. Simply squaring a sine wave is not enough, because (due to trigonometric identities, and you can also see it if you just try) it just turns into a different sine wave, but shifted above the x-axis. Raising it to the third power, however, gets you a new sort of wibbly wobbly shape:

<code>[{xlim:[-4,4],ylim:[-1.1,1.1]},(x,t)=>sin(2*x + 2*t + 5)**3]</code>
{:.live}

Just with a third power, isn't that cool? And if you use this as the inner modulator of the wobbly building block, it looks like this:

<code>[{xlim:[-4,4],ylim:[-1.1,1.1]},(x,t)=>sin(1.2*x - 1*t + 1 + 2*sin(2*x + 1.3*t + 5)**3)]</code>
{:.live}

It almost looks to me like it's adding another octave to the noise, so this is quite a powerful trick because raising something to the third power is a really cheap operation. 

* In GLSL shaders, you can use the `dot()` dot product function to multiply vectors element-wise and then add them up. If you do this with two vectorized wobbly building blocks (shuffling all the axes just right), you get a function that is the multiplication and addition of very many wobbly building blocks. An added bonus is that the `sin()` function is really fast on the GPU. I used this technique to create the clouds and foliage in the backgrounds of [Skulptuur](https://skulpturen.nl){:target="\_blank"} and as a noise function in many other of my shader-based projects.


<script src="graphs.js"></script>
