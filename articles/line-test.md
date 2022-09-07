# Measure the line width of your pens with a plotter

I made an SVG file to accurately measure the line width of any kind of pen, using your plotter.

Download the file here: [line-test.svg](line-test.svg)

![Photo of line-test.svg plotted a few times](line-test.jpg)
*In this photo I have plotted line-test.svg a few times on a piece of paper, to test multiple pens.*

## How does it work?

The idea is that you have this bunch of 5 lines going outwards. On the left side they are 0mm apart, and on the right side they are 5mm apart. They do this over a distance of 5cm (50mm). This means that for every cm (10mm) they move 1mm further apart.

Now you can measure the distance at which the thick lines actually no longer touch each other. You divide this distance by 10 (or change the cm to mm) and you get the line width. Easy as that!

The SVG actually plots a set of 5 lines twice. In the one set it goes over each line once, and in the it draws every line and then also back. This is to see how much difference it makes going over a line once or twice.

Hope that makes sense :-)