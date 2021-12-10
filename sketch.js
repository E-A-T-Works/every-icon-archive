// SPDX-License-Identifier: UNLICENSED
// Copyright 2021 John F Simon Jr; All Rights Reserved, unless otherwise stated

const network = "mainnet";
const infuraId = "557a0e2d1abd4be8bb9f3012a1d4abc8";
const addresses = {
  rinkeby: "0x73a33f73b1ff0c63a07095de31b96af98d480d71",
  mainnet: "0xf9a423b86afbf8db41d7f24fa56848f56684e43f",
};

// TODO: change this to Infura
const provider = ethers.getDefaultProvider(network);

// const provider =
//   network === "rinkeby"
//     ? new ethers.InfuraProvider("rinkeby", infuraId)
//     : new ethers.InfuraProvider(null, infuraId);

const BigNumber = ethers.BigNumber;
const utils = ethers.utils;

/**
 * SPDX-License-Identifier: MIT
 * Copyright 2021 Arran Schlosberg (@divergencearran)
 *
 * Converts 4x ethers BigNumber values into a 1024-bit buffer.
 * @param {Array.BigNumber} iconData
 * @returns {EveryIconDataView-inner} Bit-level view into the data buffer.
 */
function EveryIconDataView(iconData) {
  if (iconData.length != 4) {
    throw "Exactly 4 values required";
  }

  const uint8s = utils.concat(
    iconData.map((big, i) => {
      if (!BigNumber.isBigNumber(big)) {
        throw `Element ${i} is not an ethers BigNumber`;
      }
      return utils.zeroPad(big.toHexString(), 32);
    })
  );

  /**
   * View into the IconData buffer, allowing per-bit inspection.
   * @param {integer} i
   * @returns i'th bit of the data view.
   */
  const view = (i) => {
    return (uint8s[Math.floor(i / 8)] >> (7 - (i % 8))) & 1;
  };
  return view;
}

let displayIcon;

let gridDisplayScale = 16;
let xDisplayOffset = 0;
let yDisplayOffset = 0;

// Handle asynchronous setup before draw()ing.
let init = false;

async function setup() {
  // createCanvas(gridDisplayScale * 32, gridDisplayScale * 32).parent(
  //   "EveryIconEmbed"
  // );

  if (windowWidth > windowHeight) {
    canvasSize = windowHeight;
  } else {
    canvasSize = windowWidth;
  }

  gridDisplayScale = canvasSize / 32;
  createCanvas(canvasSize, canvasSize).parent("EveryIconEmbed");
  background(200);

  const abi = [
    {
      inputs: [
        { internalType: "uint256", name: "tokenId", type: "uint256" },
        { internalType: "uint256", name: "ticks", type: "uint256" },
      ],
      name: "iconData",
      outputs: [
        { internalType: "uint256[4]", name: "icon", type: "uint256[4]" },
        { internalType: "uint256", name: "iconSettingTime", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const contract = new ethers.Contract(addresses[network], abi, provider);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const tokenId = urlParams.get("tokenId");

  if (!tokenId) {
    console.warn("Please provide a tokenId");
    return;
  }

  const [data, settingTime] = await contract.iconData(tokenId, 0);
  const dataView = EveryIconDataView(data);

  displayIcon = new Icon(dataView);
  const now = Math.floor(new Date().getTime() / 1000);
  const ticks = (now - settingTime.toNumber()) * 100;
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

/////////Icon Object///////////

class Icon {
  constructor(view) {
    this.Icon_State = [];
    for (let i = 0; i < 1024; i++) {
      this.Icon_State.push(1 - view(i));
    }
    this.Icon_Size = 32;

    let id = 0;
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
