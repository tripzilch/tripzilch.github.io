## spiral moiré

## TLDR

Maybe [skip to here](#skip) if you just want to know how this particular spiral is made. 

## Our toolbox

What we need to get started is a tool that

* can produce SVGs and display them
* is scriptable, i.e. can be programmed
* you already have

So, the browser!

We also need a text editor. I like to use Sublime Text, but really any plain text editor will work.

## Javascript

We program the browser in Javascript. If you happen to know that language, great! If you already know how to program in another language, check out [Learn X in Y minutes on Javascript](https://learnxinyminutes.com/docs/javascript/).

If you don't yet know how to program, I have faith in you! You got this. Every programmer figured it out at some point, so why not you, today?

So, our program has two parts. A short HTML file called `index.html`, our main code called `script.js`, and because we are tidy programmers, a separate `js` file for every class that we make. I've put together a ZIP file that has a skeleton for these files, and a few of the boring bits filled in for you, to get you started: [Download here](spiral.zip). Unzip this into a folder and open the `index.html` in your favourite browser (tested in Firefox and Chromium).

## SVG

Let's start by getting something cool on the screen. 

## Math

Have you ever done 2D vector math? It's exactly twice as hard as arithmetic. Instead of adding up numbers one by one, we're going to do two at a time, like this:

    [2, 3] + [5, 8] = [7, 11]

One handy way to visualise vector addition, is by picturing them as arrows, like this:

(image)

But a 2D vector isn't "really" an arrow, it's really just two numbers. So we can also use it to represent a point on the plane, like this:

(image)

Javascript doesn't know how to do 2D vector math, so we need to write our own class to do that, it's easy:

    class Vec2 {
        constructor(x, y) {
            this.x = x; this.y = y;
        }
        add(other) {
            this.x += other.x; this.y += other.y;
        }
        mul(other) { 
            // the same with multiplication, etc.
        }
    }

I also like to make a little helper function, 

    const vec2 = (x, y) => new Vec2(x, y);

just to make things a little easier to write. Now, if you load the `index.html` file in your browser, you can press F12 to open the developer tools and go to the __console__ tab, then you can write code like this:

    > vec2(2, 3).add(vec2(5, 8))
    Vec2 {x: 7, y: 11}

And now that we made the computer understand 2D vectors, we can have it calculate *lots* of 2D vectors. Let's calculate lots of points that form a circle!

    



