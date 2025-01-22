per request here's in short how I created the artwork (hahaha did I say this was gonna be short)

very importantly I used the random seed "GenArt-BanNER" which you can tell is truly random and not at all cherry picked to look the nicest

compare for instance this one which has seed "GENART-EXPLANANANANA"

so first you gotta build a Rayhatcher, you can read about it here: https://www.fxhash.xyz/article/rayhatching-evolution it's very easy the Rayhatcher is basically a flow field and everybody knows how to do flow fields right? otherwise Tyler Hobbs explains flow fields here: https://www.tylerxhobbs.com/words/flow-fields and I used the algorithm from the paper here: https://web.cs.ucdavis.edu/~ma/SIGGRAPH02/course23/notes/papers/Jobard.pdf

we also gonna raytrace, the result of which gets you a light(x,y) function, and also a normal(x,y) func which represents surface orientation.

back to the flow field, modulate the line distance according to light(x,y) and the flow field direction based on the normals (cross product with arbitary vector, project to 2D, normalize)

you know how raytracing is easy when you use shaders and SDFs? if not, go read Inigo Quilez until you do: https://iquilezles.org/articles/raymarchingdf/ and all the other articles, bask in the infinite wisdom as your INT goes 🚀 and your skill tree sprawls to the horizons

... turns out that raytracing is ALSO easy when you use JavaScript and SDFs and it looks a little something like this: 

```js
A=([x,y,z],[a,b,c],t=1)=>[x+a*t,y+b*t,z+c*t];IX=(SDF,ro,rd,t=0,h)=>{for(;t<MAXD&&(h=fudge*SDF(A(ro,rd,t)))>SURFD;t+=h);return t}
```

but feel free to write your own

and then, you need to git gud. probably even gudder. so, head back to reading Inigo Quilez!

To figure out how to make an SDF for shattered stuff, actually turns out to be (slightly) easier in JavaScript than in shaders, whoohoo! it's cause you can recursively slice an SDF with planes and that requires a tree-like structure which JS is better at than shaders. 

Also figure out a sort of optimization algo for where to put the slices so that it looks nice. this is always fun in genart cause it doesn't need to be perfect, just good enough. this means you can do randomized stochastic optimization and Monte Carlo your way out of a wet paper bag

It was originally designed to shatter a sphere, but then I tried shattering a wall and it also looked nice

but what about all the cool slicy lines that go over everything, they're not part of the Rayhatcher, how'd I do that? 

well you can extend the raytracer to also calculate a material(x,y) returning an integer number that tells you that if the number is different, then it's also different materials. and what do we do with different materials, we draw a line between them. at least that is what we do today.

put the flow field in a box for a minute, cause we're going to marching triangles this. that's like marching cubes, but in 2D and with triangles--making it much simpler than marching cubes. do a triangular grid and whenever two vertices of a triangle are different material, line-piece goes there. when done, connect the long list of line pieces so they're now a list of polygons. the polygons trace the edges of the materials now.

and then and then ... draw the polygons! three times! with slightly random offsets so they look scratchy

FINALLY (yes we got to the end) then you crank up the aspect ratio to 3 to make it fit on the Warpcast channel banner image and output all the things into an SVG that you can then render to bitmap using your finest settings:

```sh
INKSCAPE_PROFILE_DIR=/tmp inkscape -y 1.0 -C -o "$PNG_FILE" -h 6480 "$SVG_FILE"
convert "$PNG_FILE" -colorspace RGB -filter Lanczos -define filter:blur=.9891028367558475 -distort Resize x3240 -colorspace sRGB -quality 99% -sampling-factor 1x1 "$JPG_FILE"
```

