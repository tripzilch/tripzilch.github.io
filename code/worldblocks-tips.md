```java
    // === parameters
    int steps = 10;
    float boxes = 270.0;
    float noiseRes = 0.003;
    // etc
    boolean render = false;   // this one is useful to have

    // === globals
    float noiseFactor;
    float theta;
    float ratioDiscrete;

    // === colour definitions
    float fillR = 125;
    float fillG = 125;
    float fillB = 125;

    color[] palette0 = {color(5, 93, 129), color(5, 93, 129), color(5, 93, 129), color(5, 93, 129), color(5, 93, 129), 
      color(5, 93, 129), color(2, 117, 131), color(0, 153, 137), color(2, 178, 140), color(219, 221, 172), 
      color(219, 221, 172), color(50, 155, 50)};

    color[] palette1 = { /* .. etc .. */ };

    void setup() {
      size(1080, 1080);
      strokeCap(SQUARE);
      strokeWeight(1);
      stroke(0);
      background(0);
      translate(width/2, height/2);

      // === init variables
      float row_width = width / boxes;
      float box_ratio = 1.0;
      if (render) {
        // you can set different quality paramaters depending on whether you're rendering or not
        // or the frame rate or even the resolution
      }

      // === drawing
      // more code and loops go here
      { 
        { 
          // then when it comes to setting the colour:
          int color_ratio = (int) (steps * noiseWeight * noiseFactor);
          fill(palette0[color_ratio]);
          
          // instead of a huge switch statement

          beginShape(TRIANGLES);
          // clever geometry goes here
          endShape(CLOSE);
        }
      }
       
      if (render) {
        saveFrame("world_blocks.png");
      }
      
    }
```