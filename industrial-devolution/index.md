# RAYHATCHING chapter 1

As I had recently bought a plotter, I had mainly been focusing on vector based SVG outputs. This is a file format particularly suited for the plotter, which builds images as a collection of lines and shapes, instead of pixels, such as a JPEG does.

However, I also had been desiring to play with 3D SDFs and raymarching again. An SDF is a mathematical function that describes shapes, in a way that is particularly suited to raymarching. Raymarching is a technique used for raytracing, which is a technique to simulate light bouncing off these 3D shapes, resulting in a picture. Unfortunately, these techniques are mostly aimed at pixel-based rendering, so I had to get clever.

![First vector based raymarcher output (October 2020)](s/ramen-2020-10-16-23-36-25-s3240-s.jpg)
*First vector based raymarcher output (October 2020)*

![Second vector based raymarcher output (October 2020)](s/ramen-2020-10-17-15-21-16-s3240-s.jpg)
*Second vector based raymarcher output (October 2020)*

In these first two pieces I use a raster-based scribbling approach to generate scribbles of varying size, creating varying levels of brightness.

![Aftermarket Planetary Recyclotron (October 2020)](s/ramen-2020-10-18-17-36-38-s3240-s.jpg)
*Aftermarket Planetary Recyclotron (October 2020)*

In this piece I use a very fine Hilbert curve, that gets progressively smoothed to create varying levels of brightness. This piece consists of a single line and could thus be plotted with relative ease (it still took a while).

![Nyarlathotep Road (October 2020)](s/ramen2-2020-10-21-13-52-33-s3240-s.jpg)
*Nyarlathotep Road (October 2020)*

![Untitled (October 2020)](s/ramen5-2020-10-30-14-53-37-s3240-s.jpg)
*Untitled (October 2020)*

Trying to find a way to render a raymarched scene with a shorter plotting time, I tried a different scribbling based approach. While this reduced the plotting time somewhat, I was also not really satisfied with the lack of sharp detail in the picture.

![Possible Dune (October 2020)](s/ramen3-2020-10-23-23-51-10-s3240-s.jpg)
*Possible Dune (October 2020)*

![Impossible Dune (October 2020)](s/ramen3-2020-10-24-19-07-53-s3240-s.jpg)
*Impossible Dune (October 2020)*

I knew that 3D SDFs and raymarching were capable of much finer detail.

# RAYHATCHING chapter 2

![Conduit Dimension, Elbow Quadrant (November 2020)](s/dingo0-2020-11-11-21-43-55-s3240-s.jpg)
*Conduit Dimension, Elbow Quadrant (November 2020)*

![Hagelslag Age Cave Painting (November 2020)](s/dingo1-2020-11-17-12-36-54-s3240-s.jpg)
*Hagelslag Age Cave Painting (November 2020)*

I figured that one way of achieving more detail with less lines, could be to take surface orientation into account, which previous attempts had not done--they were just scribbling or stippling to create a certain brightness level.

These first attempts were merely made of very short lines, and were not really suitable for a plotter (or were they? I have footage of a powerful HP plotter going at it, taking only 50 minutes).

However, the first steps were there -- I just needed to connect the dots, somehow.

![Capsule Hill (November 2020)](s/dingo2-2020-11-25-19-27-41-s3240-s.jpg)
*Capsule Hill (November 2020)*

Somehow it didn't take too long to figure out how to use a flowfield renderer, to draw lines in a hatching direction on the shapes, while taking into account line distance to sketch different brightness levels. *Capsule Hill* was the very first successful output of the earliest version of the rayhatching algorithm.

![Shape Salad (November 2020)](s/dingo2-2020-11-26-19-45-23-s3240-s.jpg)
*Shape Salad (November 2020)*

From there on, it quickly got awesome.

![Hyperburger (December 2020)](s/dego0-2020-12-14-17-07-31-s3240-s.jpg)
*Hyperburger (December 2020)*

![Hyperplane Microplane VX-5 (December 2020)](s/dego2-2020-12-23-17-13-55-s3240-s.jpg)
*Hyperplane Microplane VX-5 (December 2020)*

However, I had also organised [Genuary 2021](s/genuary2021.githu-sb.io), and didn't really have time to explore the rayhatcher further.

![Broken pearl (March 2021)](s/rama-2021-03-06-13-48-25-s3240-s.jpg)
*Broken pearl (March 2021)*

Genuary turned out to be quite the marathon, so I took a short break, but then made a few more pieces. 

![Broken planet (March 2021)](s/rama3-2021-03-12-13-00-52-s3240-s.jpg)
*Broken planet (March 2021)*

![Shattered sphere (March 2021)](s/rama3-2021-03-10-15-57-10-s3240-s.jpg)
*Shattered sphere (March 2021)*

Then NFTs happened :) And suddenly, digital art could just exist, without necessarily having a physical counterpart. Also at first, I had no idea how to combine NFTs with physical plots. So I explored the digital for a while, which led to [Skulptuur](s/https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-s/173) and [Hypergiraffe](s/https://www.fxhash.xyz/generative/slug/hypergir-saffe), amongst many other things.

# RAYHATCHING chapter 3

It took until March 2022 until I revisited rayhatching again.

![Hyperwillows (March 2022)](s/2022-06-26-15-37-hyperwillows5e-hatched2-s3240-s2160.jpg)
*Hyperwillows (March 2022)*

I completely rewrote the engine to be a completely self-contained file using no external dependencies (the earlier versions used modules I had written). I re-used the code for a very tiny QuadTree algorithm (an essential part of the flowfield renderer) from Hypergiraffe. At this point, the entire code was about 7 kilobytes, and after a few iterations led to [Hyperwillows](s/https://verse.works/artworks/90e9d550-18e5-40d4-bb07-048d21a5-scc52).

For a long time I had been saving parameters and important parts of the actual code as comments in the SVG-file (which is a text format, somewhat similar to HTML). This has proven very useful in recreating certain outputs on several occasions. The new rayhatcher engine is no exception, and it includes its entire code fully as an SVG comment in its output.

But *Hyperwillows* is a 1/1. I really wanted to do a big release of the rayhatcher algorithm as a long-form generative piece, that would be able to generate an infinity of possible outputs.

Some of my first tries I felt were too much like *Skulptuur*, looking at a peculiar object in the centre of the scene. So I did some research on how compositions in paintings work. One approach I found is that of the "armature", a set of imaginary lines that are important in the composition. 

![Blocks and pipes, placed manually according to rule of thirds (August 2022)](s/2022-08-21-23-55-pipes5-s3240-s2160.jpg)
*Blocks and pipes, placed manually according to rule of thirds (August 2022)*

In particular, the armature known as the "rule of thirds", which divides the image into thirds, horizontally and vertically seemed an easy one to start with. So I developed an algorithm that could place SDFs of large blocks onto these lines, using a mathematical transformation from 2D to 3D.

![Generated blocks and pipes (August 2022)](s/2022-08-31-14-20-pipesgm-s3240-s2160.jpg)
*Generated blocks and pipes (August 2022)*

I quickly discovered that I could add a random rotation to the blocks to create more interest.

![In this experiment I actually tried out skewed blocks (September 2022)](s/2022-09-15-125pip4-s3240-s2160.jpg)
*In this experiment I actually tried out skewed blocks (September 2022)*

After that, I added a noise texture to the blocks and some more details. Furthermore, relentless size optimizing turned this project into a piece of code weighing only 3930 characters.

![Industrial Devolution (September 2022)](s/2022-09-20-xnor-brightmomentsposter-s3240-s2160.jpg)
*Industrial Devolution (September 2022)*
