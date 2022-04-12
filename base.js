let randomIcons = [];
let designIcons = [];
let current_Layers = [];
let numRandomIcons = 28;
let numDesignIcons = 100;
let testIconNum = 0;
let displayIcon;
let encLookupString =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

let imgFromString = [];

let gridDisplayScale = 16;
let xDisplayOffset = 0;
let yDisplayOffset = 0;

//space for reading in the icon and random files
let img = [];
let rando_img = [];
let fName;

//When you add in the minting code in Solidity we will need some mechanism to set the starting date and assign an edition number
//parameters for setting the accumulated icons by starting time.
let starting_date = new Date(1997, 00, 14, 21, 00, 00);
let current_date = new Date();
let elapsed_time_millisecs;
let icons_per_millisecond = 0.1; //default rate of 100/second

//read in files before initiating
function preload() {
  iconFiles = loadStrings("iconsPatternsRawPlainText.txt");
  randomFiles = loadStrings("randomIconsRawPlainText.txt");
}

function setup() {
  canvasSize = 512;
  gridDisplayScale = canvasSize / 32;
  createCanvas(canvasSize, canvasSize).parent("EveryIconEmbed");

  //createCanvas(gridDisplayScale*32, gridDisplayScale*32); //.parent("EveryIconEmbed");
  background(200);

  for (let i = 0; i < numRandomIcons; i++) {
    randomIcons.push(new Icon(randomFiles[i].slice()));
  }

  for (let i = 0; i < numDesignIcons; i++) {
    designIcons.push(new Icon(iconFiles[i].slice()));
    //designIcons.push( new Icon(  ) );
  }

  displayIcon = new Icon(0);

  create_new_icon();

  create_icon_from_array();

  //Add in the accumulated time - if any
  elapsed_time_millisecs = current_date.getTime() - starting_date.getTime();
  displayIcon.setup_accumulated_time_on_icon(
    elapsed_time_millisecs * icons_per_millisecond
  );

  displayIcon.displayIcon(xDisplayOffset, yDisplayOffset);
}

function draw() {
  displayIcon.Increment_Icon();
  displayIcon.displayIcon(xDisplayOffset, yDisplayOffset);
}

function convertStringtoIcon() {
  //grab the first letter in string
  //look up index in Base64
  //convert index to bits and fill in Icon

  let indexnum = 0;
  let iconIndex = 0;
  let bitPlace = 31;

  for (let i = 0; i < testString.length; i++) {
    if (testString[i] == "=") {
      break;
    }

    indexnum = encLookupString.indexOf(testString[i]);

    bitPlace = 31;
    //fill displayIcon with 6 bit version of indexnum
    for (let j = 0; j < 6; j++) {
      if (indexnum > bitPlace) {
        displayIcon.Icon_State[iconIndex] = 1;
        indexnum -= bitPlace + 1;
      } else {
        displayIcon.Icon_State[iconIndex] = 0;
      }
      iconIndex++;
      bitPlace = floor(bitPlace / 2);
    }
  }
}

//Create a display Icon from knowing the indexes into the base icon arrays
function create_icon_from_array() {
  let len = designIcons[0].Icon_State.length;

  randIcon = current_Layers[0];
  randDesign = current_Layers[1];
  randDesign2 = current_Layers[2];
  combineMethod = current_Layers[3];

  if (combineMethod == 0) {
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        (designIcons[randDesign].Icon_State[i] &
          designIcons[randDesign2].Icon_State[i]) |
        randomIcons[randIcon].Icon_State[i];
    }
  } else if (combineMethod == 1) {
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        (designIcons[randDesign].Icon_State[i] &
          designIcons[randDesign2].Icon_State[i]) ^
        randomIcons[randIcon].Icon_State[i];
    }
  } else {
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        designIcons[randDesign].Icon_State[i] |
        (designIcons[randDesign2].Icon_State[i] ^
          randomIcons[randIcon].Icon_State[i]);
    }
  }

  ///iconSettingTime from the contract ??? I don't know the format? is it in milliseconds
  elapsed_time_millisecs = current_date.getTime() - starting_date.getTime(); // iconSettingTime;
  displayIcon.setup_accumulated_time_on_icon(
    elapsed_time_millisecs * icons_per_millisecond
  );
}

//This is where the layers are chosen, combined, and the display icon assembled
function create_new_icon() {
  let len = designIcons[0].Icon_State.length;

  randIcon = floor(random(0, numRandomIcons));
  randDesign = floor(random(0, numDesignIcons));

  randDesign2 = randDesign;
  while (randDesign2 == randDesign) {
    randDesign2 = floor(random(0, numDesignIcons));
  }

  combFactor = floor(random(0, 100));
  //print(combFactor);
  combineMethod = 0;

  if (combFactor < 25) {
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        (designIcons[randDesign].Icon_State[i] &
          designIcons[randDesign2].Icon_State[i]) |
        randomIcons[randIcon].Icon_State[i];
    }
  } else if (combFactor >= 25 && combFactor < 95) {
    combineMethod = 1;
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        (designIcons[randDesign].Icon_State[i] &
          designIcons[randDesign2].Icon_State[i]) ^
        randomIcons[randIcon].Icon_State[i];
    }
  } else {
    combineMethod = 2;
    for (let i = 0; i < len; i++) {
      displayIcon.Icon_State[i] =
        designIcons[randDesign].Icon_State[i] |
        (designIcons[randDesign2].Icon_State[i] ^
          randomIcons[randIcon].Icon_State[i]);
    }
  }

  //Collect the indexes of chosen icons
  current_Layers[0] = randIcon;
  current_Layers[1] = randDesign;
  current_Layers[2] = randDesign2;
  current_Layers[3] = combineMethod;

  displayIcon.setup_accumulated_time_on_icon(
    elapsed_time_millisecs * icons_per_millisecond
  );
}

//change icon on mouse click
function mousePressed() {
  //convertStringtoIcon();
  //designIcons[testIconNum].displayIcon(xDisplayOffset,yDisplayOffset);
  //testIconNum++;
  //if ( testIconNum >= numDesignIcons) testIconNum = 0;

  create_new_icon();
  displayIcon.displayIcon(xDisplayOffset, yDisplayOffset);
}

/////////Icon Object///////////

class Icon {
  constructor(string) {
    this.sourseString = string;

    this.Icon_State = [];
    this.Icon_Size = 32;

    let id = 0;

    //if( this.img ) this.blockImage();
    this.convertStringtoIcon();
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

  blockImage() {
    //Convert the img data into one bit array data
    let colorTest;

    this.img.loadPixels();

    for (let m = 0; m < this.Icon_Size; m++) {
      for (let n = 0; n < this.Icon_Size; n++) {
        colorTest = this.img.get(n, m);

        if (colorTest[0] == 0) {
          this.Icon_State[m * this.Icon_Size + n] = 0;
        } else {
          this.Icon_State[m * this.Icon_Size + n] = 1;
        }
      }
    }
  }

  convertStringtoIcon() {
    //Convert the string to one bit array
    //grab the first letter in string
    //look up index in Base64
    //convert index to bits and fill in Icon

    let indexnum = 0;
    let iconIndex = 0;
    let bitPlace = 31;
    let countbits = 6;

    //print(this.sourseString.length);

    for (let i = 0; i < this.sourseString.length - 1; i++) {
      if (this.sourseString[i] == "=") {
        break;
      }

      indexnum = encLookupString.indexOf(this.sourseString[i]);

      bitPlace = 31;

      if (i == this.sourseString.length - 2) countbits = 4;

      //fill displayIcon with 6 bit version of indexnum
      for (let j = 0; j < countbits; j++) {
        if (indexnum > bitPlace) {
          this.Icon_State[iconIndex] = 1;
          indexnum -= bitPlace + 1;
        } else {
          this.Icon_State[iconIndex] = 0;
        }
        iconIndex++;
        bitPlace = floor(bitPlace / 2);
      }
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
