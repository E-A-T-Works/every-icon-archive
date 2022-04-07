// SPDX-License-Identifier: UNLICENSED
// Copyright 2021 John F Simon Jr; All Rights Reserved, unless otherwise stated

let displayIcon;

let gridDisplayScale = 16;
let xDisplayOffset = 0;
let yDisplayOffset = 0;

// Handle asynchronous setup before draw()ing.
let init = false;

async function setup() {
  canvasSize = 512;

  gridDisplayScale = canvasSize / 32;
  createCanvas(canvasSize, canvasSize).parent("EveryIconEmbed");
  background(200);

  const data = Array(1024)
    .fill(0)
    .map((_) => (Math.random() > 0.5 ? 1 : 0));

  displayIcon = new Icon(data);
  const now = Math.floor(new Date().getTime() / 1000);
  const ticks = 0;
  displayIcon.setup_accumulated_time_on_icon(ticks);
  init = true;
}

function draw() {
  if (!init) {
    return;
  }
  displayIcon.Increment_Icon();
  displayIcon.displayIcon(xDisplayOffset, yDisplayOffset);
}

function mouseClicked() {
  if (mouseX < 512 && mouseY < 512) {
    var xP = floor(mouseX / gridDisplayScale);
    var yP = floor(mouseY / gridDisplayScale);

    displayIcon.set_pixel(xP, yP);
  }
}

/////////Icon Object///////////

class Icon {
  constructor(data) {
    this.Icon_State = [];
    this.Icon_State = data;
    this.Icon_Size = 32;
  }

  displayIcon(xoff, yoff) {
    let x, y;

    stroke(196);

    for (let i = 0; i < this.Icon_State.length; i++) {
      x = i % this.Icon_Size;
      y = floor(i / this.Icon_Size);

      if (this.Icon_State[i] == 0) {
        fill(0);
      } else {
        fill(255);
      }
      rect(
        xoff + x * gridDisplayScale,
        yoff + y * gridDisplayScale,
        gridDisplayScale,
        gridDisplayScale
      );
    }
  }

  Increment_Icon() {
    let carry_bit = 0;

    this.id = 1;

    if (this.Icon_State[0] == 1) this.Icon_State[0] = 0;
    else {
      this.Icon_State[0] = 1;
      carry_bit = 1;
      //Propogate numbers
      while (carry_bit == 1) {
        if (this.Icon_State[this.id] == 0) {
          //if the pixel i
          this.Icon_State[this.id] = 1;
          this.id++;
        } else {
          this.Icon_State[this.id] = 0;
          carry_bit = 0;
        }
      }
    }
  }

  set_pixel(xpix, ypix) {
    if (this.Icon_State[ypix * this.Icon_Size + xpix] == 1) {
      this.Icon_State[ypix * this.Icon_Size + xpix] = 0;
    } else {
      this.Icon_State[ypix * this.Icon_Size + xpix] = 1;
    }
  }

  //<!-- Given a decimal number (usually the starting position) -->
  //<!-- Setup the icon to reflect the accumulated pixels and start counting from there-->
  setup_accumulated_time_on_icon(decimal_num) {
    let remainder;

    //<!-- beo is the binary_exponential_order  -->
    let beo = 0;

    //<!-- Start with order 0 - the least significant digit-->
    //<!-- is the number odd? Then that pixle goes on-->
    //<!-- Shift the number right (divide by two...the >> operator did not work here on long types )-->
    //<!-- Check again on the new digit at one order up-->
    //<!-- Repeat until every digit is checked  - number is divided away-->
    while (decimal_num >= 1) {
      decimal_num = Math.floor(decimal_num);
      remainder = decimal_num % 2.0;
      if (Math.abs(remainder) == 1) {
        this.Icon_State[beo] = 0; //odd number - pixel is black
      } else {
        this.Icon_State[beo] = 1; //even number - first bit white
      }
      decimal_num /= 2.0;
      beo++;
    }
  }
}
