# RAYHATCHING chapter 1

In summer of 2020 I bought a plotter, a robot drawing machine that holds a pen. It is only capable of drawing lines, and nothing else.

Because of this I had been focusing on vector based SVG outputs. This is a file format particularly suited for the plotter, which builds images as a collection of lines and shapes, instead of pixels, like a JPEG does.

However, I felt the urge to play and experiment with 3D SDFs and raymarching again. An SDF is a mathematical function that describes shapes, in a way that is particularly suited to raymarching. Raymarching is a technique used for raytracing, which is a technique to simulate light bouncing off these 3D shapes, resulting in a picture. Unfortunately, these techniques are mostly aimed at pixel-based rendering, so I had to get clever.

In these first two pieces I use a raster-based scribbling approach to generate scribbles of varying size, creating varying levels of brightness.

![First vector based raymarcher output (October 2020)](s/ramen-2020-10-16-23-36-25-s3240-s.jpg)
*First vector based raymarcher output (October 2020)*

![Second vector based raymarcher output (October 2020)](s/ramen-2020-10-17-15-21-16-s3240-s.jpg)
*Second vector based raymarcher output (October 2020)*

In the next piece I use a very fine Hilbert curve, that gets progressively smoothed to create varying levels of brightness. This piece consists of a single line and could thus be plotted with relative ease (it still took a while).

![Aftermarket Planetary Recyclotron (October 2020)](s/ramen-2020-10-18-17-36-38-s3240-s.jpg)
*Aftermarket Planetary Recyclotron (October 2020)*

Trying to find a way to render a raymarched scene with a shorter plotting time, I tried a different scribbling based approach.

![Nyarlathotep Road (October 2020)](s/ramen2-2020-10-21-13-52-33-s3240-s.jpg)
*Nyarlathotep Road (October 2020)*

While this reduced the plotting time somewhat, I was also not really satisfied with the lack of sharp detail in the picture.

![Untitled (October 2020)](s/ramen5-2020-10-30-14-53-37-s3240-s.jpg)
*Untitled (October 2020)*

I knew that 3D SDFs and raymarching were capable of much finer detail. Such as with my stippling-based pieces [Possible Dune](https://foundation.app/@piterpasma/foundation/74507) and [Impossible Dune](https://foundation.app/@piterpasma/foundation/74511).

![Possible Dune (October 2020)](s/ramen3-2020-10-23-23-51-10-s3240-s.jpg)
*Possible Dune (October 2020)*

![Impossible Dune (October 2020)](s/ramen3-2020-10-24-19-07-53-s3240-s.jpg)
*Impossible Dune (October 2020)*

# RAYHATCHING chapter 2

In order to figure out a way of achieving more detail with less lines, I tried taking surface orientation into account, which previous attempts had not done--they were just scribbling or stippling to create a certain brightness level. Notice how the very short lines in the next two pieces are oriented so that they seem to lie "flat" on the 3D surface. This was the first step towards a more intelligent hatching method.

![Conduit Dimension, Elbow Quadrant (November 2020)](s/dingo0-2020-11-11-21-43-55-s3240-s.jpg)
*Conduit Dimension, Elbow Quadrant (November 2020)*

![Hagelslag Age Cave Painting (November 2020)](s/dingo1-2020-11-17-12-36-54-s3240-s.jpg)
*Hagelslag Age Cave Painting (November 2020)*

These first attempts were merely made of very short lines, and were not really suitable for a plotter (or were they? I have footage of a powerful HP plotter going at it, taking only 50 minutes).

But I was getting there -- I just needed to connect the dots, somehow.

![Capsule Hill (November 2020)](s/dingo2-2020-11-25-19-27-41-s3240-s.jpg)
*Capsule Hill (November 2020)*

Somehow it didn't take too long to figure out how to use a flowfield renderer to draw the lines in a hatching direction on the shapes, while taking into account line distance to sketch different brightness levels. *Capsule Hill* was the very first successful output of the earliest version of the rayhatching algorithm.

![Shape Salad (November 2020)](s/dingo2-2020-11-26-19-45-23-s3240-s.jpg)
*Shape Salad (November 2020)*

From there on, it quickly got awesome.

![Hyperburger (December 2020)](s/dego0-2020-12-14-17-07-31-s3240-s.jpg)
*Hyperburger (December 2020)*

![Hyperplane Microplane VX-5 (December 2020)](s/dego2-2020-12-23-17-13-55-s3240-s.jpg)
*Hyperplane Microplane VX-5 (December 2020)*

However, I had also been organising the generative art month of [Genuary 2021](https://genuary2021.github.io/), in an attempt to bring together the various genart communities spread out over the web, and didn't really have time to explore the rayhatcher further.

Genuary turned out to be a huge success, and quite the marathon, so I took a short break, then made a few more pieces.

![Broken pearl (March 2021)](s/rama-2021-03-06-13-48-25-s3240-s.jpg)
*Broken pearl (March 2021)*

![Broken planet (March 2021)](s/rama3-2021-03-12-13-00-52-s3240-s.jpg)
*Broken planet (March 2021)*

![Shattered sphere (March 2021)](s/rama3-2021-03-10-15-57-10-s3240-s.jpg)
*Shattered sphere (March 2021)*

And then NFTs happened :) And suddenly, digital art could just exist, without necessarily having a physical counterpart. Also at first, I had no idea how to combine NFTs with physical plots. So I explored the digital for a while, which led to [Skulptuur](https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/173) and [Hypergiraffe](https://www.fxhash.xyz/generative/slug/hypergiraffe), amongst many other things.

![Desirotron (August 2021)](s/rayhatch8b-2021-08-05-13-33-57-s2160.jpg)
*Desirotron (August 2021)*

I made [Desirotron](https://foundation.app/@piterpasma/foundation/68944) in this period, which is executed in colour, to underline it's a digital image first, an NFT and not intended to be plotted (though if someone figures out how to make it look good they have my blessing).

# RAYHATCHING chapter 3

It took until March 2022 until I revisited rayhatching again.

![Hyperwillows (March 2022)](s/2022-06-26-15-37-hyperwillows5e-hatched2-s3240-s2160.jpg)
*Hyperwillows (March 2022)*

I completely rewrote the engine to be a completely self-contained file using no external dependencies (the earlier versions used modules I had written myself). I re-used the code for a very tiny QuadTree algorithm (an essential part of the flowfield renderer) from Hypergiraffe. At this point, the entire code was about 7 kilobytes, and after a few iterations led to [Hyperwillows](https://verse.works/artworks/90e9d550-18e5-40d4-bb07-048d21a5cc52).

For a long time I had been saving parameters and important parts of the actual code as comments in the SVG-file (which is a text format, somewhat similar to HTML). This has proven very useful in recreating certain outputs on several occasions. The new rayhatcher engine is no exception, and it includes its entire code fully as an SVG comment in its output.

But *Hyperwillows* is a 1/1. I really wanted to do a big release of the rayhatcher algorithm as a long-form generative piece, that would be able to generate an infinity of possible outputs.

![It's complicated (July 2022)](s/2022-07-14-14-30-idunno-s3240.jpg)
*It's complicated (July 2022)*

Some of my first tries I felt were too much like *Skulptuur*, looking at a peculiar object in the centre of the scene. So I did some reading and research on how compositions in paintings work. One approach I found is that of the "armature", a set of imaginary lines that are important in the composition. 

![Blocks and pipes, placed manually according to rule of thirds (August 2022)](s/2022-08-21-23-55-pipes5-s3240-s2160.jpg)
*Blocks and pipes, placed manually according to rule of thirds (August 2022)*

In particular, the armature known as the "rule of thirds", which divides the image horizontally and verytically into thirds, seemed an easy one to start with. I developed an algorithm that could place SDFs of large blocks onto these lines, using a mathematical transformation from 2D (where the lines are on the image) to 3D (where the shapes are, in space).

![Generated blocks and pipes (August 2022)](s/2022-08-31-14-20-pipesgm-s3240-s2160.jpg)
*Generated blocks and pipes (August 2022)*

When two shapes intersect, their surfaces form a cutting line. Due to the way that SDFs work, it is very easy to construct the SDF of a pipe following this line. I intersected the blocks with invisible planes to construct the pipes. Then I applied this method again, to the pipes themselves, intersecting with a stacked series of invisible planes. This creates the smaller "cooling rings" around the pipe. I also took a large hollow cylinder and punched a hole through the entire scene.

I quickly discovered that I could add a slight random rotation to the blocks to create more interest. This disturbs the "rule of thirds" armature a bit, but not too much and can also add other lines of interest.

![In this experiment I actually tried out skewed blocks (September 2022)](s/2022-09-15-125pip4-s3240-s2160.jpg)
*In this experiment I actually tried out skewed blocks (September 2022)*

After that, I added a noise texture to the blocks and some more tweaks and details. Furthermore, relentless size optimizing turned this project into a piece of code weighing only 3930 characters.

![Industrial Devolution (September 2022)](s/2022-09-20-xnor-brightmomentsposter-s3240-s2160.jpg)
*Industrial Devolution (September 2022)*

*Industrial Devolution* will be released October 6th during a [live minting event](https://lu.ma/fxhash-brightmoments) at Bright Moments gallery, Venice Beach, in collaboration with fx(hash) and Tender.

