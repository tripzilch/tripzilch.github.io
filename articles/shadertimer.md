# shader timer precision and long running programs

Stevan: Question for y'all, I left shadertoy open over night on some procedural fog / noise effect. when I got back to it, it was all wrong and had terrible artifacting. I assume this is because of really big numbers for iTime. How do you handle this typically? I can't use a delta as I need to use the iTime value for the 3rd dimension of the noise input

Piter: you can modulo and split it up
depending on what you need
Like have one variable count hours and the other seconds within the hour

also remember the 32 bit float spec:
https://en.wikipedia.org/wiki/Single-precision_floating-point_format
1 sign bit, 8 exponent bits and 23 mantissa bits
which means you can get integer precision of 2^23
but you probably want better sub integer precision on your timer, maybe 1/256th
so then you get 2^15 as your max precision (32768)

you may also need to dig into your noise function a bit to make the 3rd dimension modular compatible
its a bit weird imho that it started bugging already after one night (40k seconds?), but who knows what that shader does
Oh I know, the iTime uniform probably pushed some coordinate from a noise function too far, giving it less precision, and then probably doing some kind of differencing on that noise function for lighting purposes -- which amplifies the rounding errors

It's probably a good idea to sort of trace out all the lines and formulas that can be affected when iTime changes (which is probably all of them), and work out the magnitudes of those values, to determine if they're precise enough

Also there might be some calls to sin() or cos() that also work if you use mod(iTime, TAU)


Oh I just thought of a different and possibly easier method, but it depends on how you need iTime and if it is good enough for your program.
See in the above method, you would pass a uniform for the number of hours (always integer) and a faster counter for the number of seconds within the hour.
This works in theory but you may somehow still end up with too large numbers in your formulas maybe, that may be hard to pull apart.
Kind of like how a digital clock counts, once the seconds counter reaches 3600 it resets to zero and the hour counter goes up one.
But what it is ultimately all about is that you need to pass the right state as uniforms to your shaders. In the original code it was only iTime that represented state as evolving through time, and straight up does not have enough bits to represent a different state for longer than a day.
So now instead you pass iHours and iSecs to the shader, which gives you double the amount of state.
But this state might be hard to use. So I thought of another trick.

what if you had three (or more) timers, but they are not "stacked" like that? Instead one cycles from 0..1 in 3.45 hours, the other in 5.43 hours and the last one in 7.89 hours. (remember magnitude doesn't matter for precision in floats, so cycling from 0..1 is just as accurate as cycling from 0..65535 or even 0..2^127 and imho it's often easier to work modulo 1.0)
Then you can try to use these three timers roughly evenly all throughout your code.

You still have to adjust stuff to make that code work modulo 1.0, but it might be easier than the stacked iHours + iSecs uniforms.

The uneven cycle lengths of the three timers will cause an interference pattern that will not repeat for a veeeeeery long time. You can easily use even more timers, if you like.

And because each timer resets to 0 on each cycle, they will never overflow or lose precision.

Also if I'm right about my guess of getting those artifacts from doing differencing on the noise function with too large coordinates, I think in theory it should be somewhat possible to just "fix" the noise function to deal better with that.
But that might only be a temp solution until some other part fails, so the above tricks are probably worthwhile for a "forever" thing.

