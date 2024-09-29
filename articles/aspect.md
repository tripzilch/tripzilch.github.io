# ASPECT RATIO

anyway I think my video would boil down to

1. don't use map (there's some good reasons I would explain)
2. always know your aspect ratio, don't assume square or you'll be in trouble later when you don't want square
3. decide where your origin goes, (0,0) in the centre or (0,0) in upper left (or bottom left?)
4. decide on the range of your coordinates. it's almost always a good idea to use normalized coordinates such as -0.5 .. 0.5 or -1 .. +1 or 0..1 or ... whatever. it's almost NEVER a good idea to use "pixels" for the range, unless you're specifically making pixel art. sometimes it can be useful to pick a physical size for the range, but usually it's not. Stick with the normalized coordinates.
4b. Actually I take that back, I can't think of a good reason to put your (0,0) in one of the corners. Put it in the centre.
5. different ways to make your coordinate system fill the screen or not, in a responsive way (using min and max in clever ways!)
