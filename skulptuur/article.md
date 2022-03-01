# The big Skulptuur Article

todo: make headings questions

## Why this article

This article attempts to shed some light onto the intricacies of the Skulptuur project by Piter Pasma, and its development.

## What is Skulptuur

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

## inspiration

2015 CPU pathtracer in Processing using my own Vec3 class

2020 december, rayhatcher, other raymarching stuff (genuary)

2021 GPU pathtracer

algorithmic sculpture 1

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

## unknown bugs

Certain configurations of reflective surfaces may obtain sentience -- do not engage, make sure to keep offline.

I'm not so certain about Math itself. There's this *Axiom of Choice* thing that is highly suspect.

## Future work

