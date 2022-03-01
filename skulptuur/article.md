# The big Skulptuur Article

todo: make headings questions

## Why this article?

This article is about the Art Blocks project *Skulptuur* by Piter Pasma, inspiration, techniques and its development.

## What is Skulptuur?

Skulptuur is a computer program that generates photo-realistic renderings of 3-dimensional procedural sculptures in a variety of complex virtual lighting environments. The program runs in the browser, uses no external libraries and is entirely self-contained. Yet its code is only **6370 bytes**.

![Skulptuur code](code-final.png)
*The entirety of Skulptuur's code, which includes the renderer, shape generation, materials, colours and procedural environments.*

The program accepts one input: a random hash, which is used to determine all aspects of the image: the shapes, materials, colours, light and environment. On September 27th 2021, 1000 Skulpturen were minted, the input hash determined randomly at the moment of the transaction, then permanently logged on the Ethereum blockchain. The code of Skulptuur has also been written to the blockchain, and together these form a permanent record of the 1000 minted Skulpturen.

A most interesting aspect of this method is that I, the artist, have no idea what the random hashes will be until the time of minting. And thus have no idea what the outputs will look like. Therefore I had to write a program that generates a beautiful output given *any* input random hash.

(some images of nice outputs go here)

## Where can I see Skulptuur?

Due to the blockchain being decentralized, there are several websites where you can view the 1000 outputs:

* [Art Blocks project page](https://artblocks.io/project/173)
* [Skulptuur on Masterpiece.so](https://masterpiece.so/artwork/302948-skulptuur)
* [Skulptuur on Opensea](https://opensea.io/collection/skulptuur-by-piter-pasma)

(a few more images of nice outputs go here)

## Who are you?

I am Piter Pasma, a generative artist from the Netherlands. I studied Computational Science and I've been coding visual art [since 1998](/demoscene).

## How did you come up with Skulptuur?

In 2015 I read [Inigo Quilez' article about Monte Carlo pathtracing](https://www.iquilezles.org/www/articles/simplepathtracing/simplepathtracing.htm). It fascinated me tremendously and I built a CPU-based implementation in Processing. It was very slow. But the outputs were already surpassing my expectations.

(images of 2015 pathtracer)

In 2020 I was working with my plotter, a robot drawing machine. One of the challenges with a plotter is that it can only draw lines. I was trying to generate images through hatching or scribbling. At first I tried photos, but I'm not a very good photographer, and I didn't want to use other people's work. So I decided to render the images instead, and revisited pathtracing. Because the implementation was again CPU-based, I used a more simple lighting algorithm, for speed. This allowed me to practice with [SDFs](#), a very powerful technique to define 3D shapes using mathematical formulas.

(images of 2020 rendered scribbles and genuary raymarching stuff)

In December 2020 this led to the development of my rayhatching program, which is able to hatch 3D scenes from SDFs in a lot more detail than my previous scribbling attempts.

(images of rayhatching stuff)

However, I wasn't satisfied with the quality and limitations of the lighting model, everything running on CPU in Javascript. I knew I would be able to get much more photo realistic results using Monte Carlo path tracing. So around **(when)**, I finally took the plunge and wrote the WebGL2 skeleton code that I needed for it, and quickly had a working prototype.

(images of 2021 GPU pathtracer)

Through my other generative art projects, I've become fascinated with the concept of uneven subdivisions and their relation to polyrhythms. Inspired by this, I created Algorithmic Sculpture 1. It is the intersection of a stack of three double-shelled spheres, and two rounded cubes. This is analogous to a polyrhythm of 2:3, the hemiola. 

(image of algorithmic sculpture 1)

Because I had applied for Art Blocks, I started experimenting with generating other combinations of polyrhythms, in grids, using various types of shapes. The results immediately were very promising.

(images of first brownish skulptuurs)

## the skulptuur algorithm

many example pictures

shapes and colours

gold rarity

## renderer improvements

compare to doc/Rinkeby0

exposure function (up to 11!)

round edges (roundmin demo pics, maybe change onmouseup/down)

Fresnel reflection coeff -- example looking at paper

circular focus blur

## environments

about environments, they are both the light source and the background. 

### catalog

### shadows
  - city
  - foliage

### clouds
  - solid clouds
  - not solid clouds

## size optimizing

demoscene background

milestones (dddd.jpg)

using a larger font

tightening GLSL with regex

going critical: beyond Kolmogorov

## rendering options

two options, what they do

table

resolution limitation

## known bugs

shadow/city environment can have different skyline on different GPUs

## shoutouts

I really have to give a shoutout to Inigo Quilez for the amazing articles that he writes, such an incredible resource to get onto the path of using SDFs and all the tricks available -- learning to craft my own, which are really the secret sauce here.

Genartclub Dmitri Cherniak, Ix, Amy, the whole list and why they are on it

## Future work

rayhatching!

more SDFs
