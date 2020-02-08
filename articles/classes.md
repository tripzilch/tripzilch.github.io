# Processing?

Processing is built on Java. The code you write in Processing is actually Java code. When you run it, what Processing basically does is paste a bunch of Java code before your code, and after it, to make it a working Processing sketch. Then it runs it like a regular Java program.

This article is about classes, and those are a feature of Java. But because Processing is Java, classes work just the same (almost).

# Java classes, mostly

So if you have a line of code that looks like this:

    int a = 23;

That means you define a variable of *type* `int`, that gets a value that is the *integer number* 23.

Conceptually, a *class* is pretty much the same as a *type*. You can make variables to hold values of them, and those values are called *objects* or sometimes also *class instances*. If you've ever used a `String`, you've already used classes!

    String b = "fnord";

So, `String` is the name of a class. You can tell because it starts with an uppercase character. That's the rule in Java, and you're going to follow it. If you don't, your code will compile fine but everybody reading your code will be very sad.

So you have a `String` *object*, also called an *instance* of the class `String`. You can also do things to an object:

    b.toUpperCase();

And now the string says "FNORD". Or that's the idea (I didn't test this code). This is known as *calling a method* on the object `b`. Methods are like functions hidden inside the object, buttons and levers you can press to make it do things. The class determines which methods an object has, and all objects of the same class have the same methods (at least, in Java).

Another thing is that an object has *properties*, these are like variables hidden inside the object. An example is `b.length`, which has the value 5.

So that's nice.

# Why is it nice

Well, you can make your own classes! And if you do it right, most of your code will happen inside a class, and everything gets nice and compartmentalized, and *this allows you to play with larger blocks*.

Another very important bonus is that *it allows you to put your code into multiple files*, making everything more tidy and reuse so much easier.

Imagine your code could look like this:

    void setup() {
      size(400,400);
      colorMode(RGB, 1.0);
      // clever OOP usage goes here
    }

Lalala to be contoinued