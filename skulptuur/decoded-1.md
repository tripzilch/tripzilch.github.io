# Skulptuur Decoded Part 1 -- The PRNG

## intro

This is going to be a series where I will take apart and explain the source code of Skulptuur. It will have many parts and take a very long time before it is finished, probably.

The first part is about the first line of the code, which is the tiny PRNG that I use, and shared with the Art Blocks community. It explains how every part works, and what steps I took to make it tiny.

## what code are we going to look at?

The first part of Skulptuur's code is the PRNG:

```
S=Uint32Array.from([0,1,s=t=2,3].map(i=>parseInt(tokenData.hash.substr(i*8+5,8),16)));R=(a=1)=>a*(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19),S[0]/2**32);
```

It consists of two statements, separated by semicolons.

## first statement: seeding the PRNG

```
S=Uint32Array.from([0,1,s=t=2,3].map(i=>parseInt(tokenData.hash.substr(i*8+5,8),16)));
```

This first statement seeds the PRNG by initializing its state from the `tokenData.hash` string, which contains the unique hash determining all the features of a Skulptuur. 

The state of the PRNG is kept in the global variable `S`. It's a Uint32Array of 4 elements, meaning we got 32 * 4 = 128 bits of state.

The function `Uint32Array.from` creates a new Uint32Array, from a (regular) array. This array is the parameter and it looks like this:

```
[0,1,s=t=2,3].map(i=>parseInt(tokenData.hash.substr(i*8+5,8),16))
```

First, this creates an array `[0,1,2,3]`, and it also initializes the (global) variables `s` and `t` to 2. The variables just need to be initialized to something, because they cannot be declared in the PRNG itself. 

This `[0,1,2,3]` array is then mapped using a function:

```
i=>parseInt(tokenData.hash.substr(i*8+5,8),16)
```

So this function gets called with parameter `i` equal to 0,1,2 and 3. It then extracts 8 characters from the `tokenData.hash` string. This is a string of hexadecimal (base 16) characters, so it can be parsed to an integer number using `parseInt(str, 16)`. A 32 bit integer number is exactly 8 hexadecimal digits long.

The Art Blocks hash in `tokenData.hash` starts with `0x`, followed by 64 hexadecimal digits, or a 256 bit number in total. Because we extract only four times 8 hex digits, we only use half of the hash. 

This explains the number 5 in the `substr` index. It needs to be at least 2, in order to skip the first `0x` part, but it can also be a higher number and it will just extract a different part of the full hash. During development on the Ropsten test network, I increased this number by 1, three times, in order to change the random seed for all Ropsten mints at once, before requesting a full re-render of previews.

The end result of this part is that we have the global PRNG state `S` as a Float32Array of four elements, initialized with random numbers from the hash, seeding our PRNG. It also declares the variables `s` and `t` into the global scope.

## second statement: the PRNG function

The second statement is the PRNG itself, this a function that returns a new pseudo-random number every time it is called.

"Pseudo-random" means that the sequence of numbers is unpredictable, but will always be the same sequence given the same seed (as derived from the unique `tokenData.hash` in the previous section).

```
R=(a=1)=>a*(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19),S[0]/2**32);
```

This declares a function `R`, which takes a parameter `a`, does a complicated thing to the PRNG state `S`, that ultimately calculates `S[0]/2**32` and multiplies this by the parameter `a`. Without the complicated bit, it looks like this:

```
R=(a=1)=>a*(complicated, S[0]/2**32);
```

It is important to note that the comma-operator `,` in Javascript is a cool, funky and almost useless operator, that simply evaluates to the thing on the right of the comma. It also has a very low operator precedence. This means that an expression like `23,'aap','noot',5` evaluates to `5`. 

The reason we would want to do this, is because the stuff to the left of the comma does get evaluated, in order. It's just the result of the expression that gets discarded. Now, in Javascript, assignment statements (like `x=5`) are also expressions. In fact they happen to evaluate to the right-hand side of the assignment.

With this knowledge look again at the complicated bit, you'll find that it's made out of a number of assignments to parts of the PRNG state `S`.

Because `S[0]` is a 32-bit unsigned integer, if you divide it by `2**32` (two to the power thirty-two, or about 4 billion), you end up with a number between 0 and 1. It can never be equal to 1, because the maximum 32-bit unsigned integer value is `2**32-1`, so one less. This is our random number, which then gets multiplied by `a`, to be able to scale it.

## what does the complicated bit actually do?

The complicated bit implements a [Xorshift128](https://en.wikipedia.org/wiki/Xorshift) PRNG. The algorithm was invented by George Marsalia and adapted from sample code of the `xor128` algorithm in ["Xorshift RNGs" by George Marsalia (2003), p. 5](https://doi.org/10.18637%2Fjss.v008.i14). The original sample code was in C, but looks like this when adapted to Javascript:

```
let t = S[3];
let s = S[0];
S[3] = S[2];
S[2] = S[1];
S[1] = s;
t ^= t << 11;
t ^= t >>> 8;
S[0] = t ^ s ^ (s >>> 19);
return S[0];
```

What this code does, is shifting all the bits in the PRNG state `S`, and XOR-ing some of the bits with other bits, in a very specific way that shuffles the bits and leaves a pseudo-random number in the right-most 32 bits of the state, or `S[0]`.

Note that in Javascript we need to specifically use the `>>>` [unsigned right shift operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift), otherwise you get the sign-preserving right shift, which duplicates the left-most bit as it shifts, which is not the behaviour of the C `>>` operator.

Now this code is already pretty short, but we can make it shorter. Remember, we already declared the variables `s` and `t` in the first statement when we seeded the PRNG. So we can remove the `let` keyword in the first two lines.

Remember that assignments are also expressions? Having removed the `let` keywords, every line of the above function is an expression. That means we can string everything together using the comma operator:

```
t=S[3],s=S[0],S[3]=S[2],S[2]=S[1],S[1]=s,t^=t<<11,t^=t>>>8,S[0]=t^s^(s>>>19),S[0]
```

We can move the assignment to `s` to the first place it's used, saving two characters:

```
t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,t^=t>>>8,S[0]=t^s^(s>>>19),S[0]
```

The expression `t^=t>>>8` evaluates to `t^t>>>8` and assigns it to `t`, which is only used once afterwards. So we can put the expression there instead, saving one character:

```
t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]=(t^t>>>8)^s^(s>>>19),S[0]
```

The last time the variable `s` is used, it is equal to `S[0]`. The XOR operator is commutative, this means that `A^B^C` equals `B^A^C`, i.e. you can reorder the terms at will. This allows us to rewrite the final assignment to `S[0]`: 

```
t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19),S[0]
```

There is in fact a bit more optimization possible, which I will talk about below, but this is as far as I got for Skulptuur.

So this expression updates the PRNG state and returns `S[0]`, all we need to do now is divide by `2**32`, put brackets around, multiply it by parameter `a` and turn it into an arrow function:

```
R=(a=1)=>a*(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19),S[0]/2**32);
```

## more optimizations

Thanks to [Stranger in the Q](https://twitter.com/stranger_intheq/), who came to me with some more tricks, after the release of Skulptuur.

We can move the division by `2**32` outside the brackets:

```
R=(a=1)=>(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19),S[0])*a/2**32;
```

Now the final assignment to `S[0]` of course evaluates to the new value of `S[0]`, so we can remove the `,S[0]` at the end, saving 5 characters!

```
R=(a=1)=>(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=s=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(s>>>19))*a/2**32;
```

