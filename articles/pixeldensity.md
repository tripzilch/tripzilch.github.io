# devicePixelRatio

If you're confused about pixel density, I'll try to explain.

In the browser's API this is called `devicePixelRatio` and that's what I'm going to explain. Someone who knows more can explain how this fits in to p5.

What makes this kind of hard, is that you're no longer to really _see_ individual physical pixels on modern HiDPI displays (at least my eyes can't, at normal reading distance) any more, which makes it hard to tell what's going on, sometimes.

The concept of a "pixel" on even older CRT displays is kind of nebulous too, and then we get into display adapters and it was glorious in its own ways. But in between there was an era when we had flatscreen LCD monitors with big chunky nearly-square shaped pixels. And if your drivers weren't displaying at the exact native resolution (the exact number of LCD pixels), it'd get interpolated and turned to blurry mush.

Back to pixel density. The most important thing to realize is that the `px` unit in CSS does not actually stand for one pixel any more!! It used to, but now we got modern HiDPI displays, and it got kind of confusing. This is because many people on many websites (for many good reasons) specified the sizes of elements and letters in `px`, which would get really tiny on HiDPI displays if `px` were to mean the actual number of (tiny) pixels it's got. Instead of relying on the browser's zoom feature, they decided to redefine what `px` means.

So on old LCD displays `1px` in CSS was exactly 1 hardware pixel on your display. And in these cases devicePixelRatio equals 1. And you didn't have to do anything special. 

On newer displays (like most Macbooks and phones) `1px` actually means multiple hardware pixels.

The most important thing is to know when you're dealing with the CSS `px` unit and when you're dealing with actual pixels.

In the browser you're really never dealing with physical pixels on the display, you can't directly access the hardware. So the best we can do is to try and line up the pixels of our drawing buffer with the physical pixels on the display. Let's call the ones on your display "hardware pixels" and the ones in your drawing buffer "software pixels".

Note that neither of these are the same as CSS `px`. Don't think of CSS `px` as "pixels" any more, but just imagine they are a weird length unit like inches, nothing much to do with actual pixels any more.

The pixels of your drawing buffer will get scaled by the browser onto the display, according to the CSS style. So we want the drawing buffer to be displayed using exactly as much hardware pixels as there are software pixels in the drawing buffer.

When you ask for innerWidth/innerHeight to get the window size, you get the answer in CSS `px`.

When you set the size of your canvas element using `canvas.width=3840` and `canvas.height=2160`, this is the size of its drawing buffer in software pixels.

When you set the size of the display _style_ of the canvas element using `canvas.style.width="1234px"` or something, you can see these are CSS `px` units. This determines the size of the canvas being displayed and whether the software pixels in its buffer get interpolated over multiple hardware pixels or not.

You can convert CSS `px` units into hardware pixels by multiplying them by devicePixelRatio. So if you have a drawing buffer 3840 software pixels wide, you need to `canvas.style.width=3840/devicePixelRatio+"px"` (don't forget to add "px" at the end or it will just silently ignore this command), to make it show up perfectly crisp with the software pixels aligned to the hardware pixels.

Often you'll want to do this the other way around. First set the style to the desired size in `px` with `canvas.style.height=innerHeight+'px'` and then calculate how much hardware pixels this is (and how many software pixels you need in the buffer) and set `canvas.height = innerHeight * devicePixelRatio` (note no "px" here).

You can sort of test if you got the devicePixelRatio thing right, by drawing the full screen of alternating black/white 1 (true) pixel horizontal lines. It should look perfectly sharp, or if your pixels are truly tiny, perfectly flat grey. If you got the devicePixelRatio wrong, there will be some interpolation, and this should show obvious artifacts. You can then do the same test with vertical lines.







I checked this on my laptop, where devicePixelRatio equals 2.2, it's not even a whole number. When I set my browser to full screen (F11), the value of `innerHeight` is 818. If that were actual pixels, that's not a lot of pixels :) (only slightly more than a 720p video). Of course it's not true pixels, and you gotta multiply with devicePixelRatio.

This gets me the value 818 * 2.2 = 1799.6 which is also not even a whole number. Of course the number of vertical pixels on my laptop's display is a whole number and I'm pretty sure it's 1800 and not 1799. That said, I usually round my pixels down after multiplying by devicePixelRatio --- which means I gotta check this if it's actually correct what I'm doing, probably not. Again difficult cause if the pixels were of visible size, I might have spotted it.


