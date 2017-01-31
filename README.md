# [Project2: Toolbox Functions](https://github.com/CIS700-Procedural-Graphics/Project2-Toolbox-Functions)

## Wing Structure
Consists of three joints (shoulder, elbow, wrist). The shoulder joint is stationary within the body but the wrist and elbow are located at a fixed distance (in the x and z direction) from the body. Feathers are placed on a spline with control points at each joint or simply linearly interpolated between pairs of joints (use toggleSpline). Each region of feathers is created by offsetting from this interpolated line.

## Wing Animation
My goal was to emulate a motion like this:

![Flapping Motion](https://i.imgur.com/F0Ms1qz.png)

Given that the shoulder joint (green) is stationary, the relative y position of the elbow (red) and wrist (blue) looks something like this:

![Joint Displacements](https://i.imgur.com/vb2zfz0.png)

This pair of functions has a couple of key characteristics:

The falling edge on each oscillation should take longer than the rising edge. This makes the wing motion more realistic as the upstroke is about twice as fast as the downstroke[\[1\]](http://www.brendanbody.co.uk/flight_tutorial/). This asymmetric sine wave is achieved using some variation of this function: sin(x + a * sin(x))[\[2\]](https://www.quora.com/How-can-I-draw-this-irregular-Sine-function-in-MATLAB-Should-I-add-multiple-the-Sine-function-to-another-term).

The elbow displacement function must reach its high and low peaks slightly before the wrist does. It's important that this is a translation of the function or else the periods will go out of sync.

Lastly, the amplitude of the elbow displacement is less than that of the wrist.

## Demo
Demo: https://iambrian.github.io/Project2-Toolbox-Functions/

![Demo](https://i.imgur.com/VuYbEaP.gif)

## References
Bird wing motion: http://www.brendanbody.co.uk/flight_tutorial/

Baseline sine function: https://www.quora.com/How-can-I-draw-this-irregular-Sine-function-in-MATLAB-Should-I-add-multiple-the-Sine-function-to-another-term

Graphing: http://www.iquilezles.org/apps/graphtoy/
