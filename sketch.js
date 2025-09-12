let img;        // foreground image
let bg;         // background image
let x = 0;
let noiseOffset = 0;

function preload() {
  // load images before setup runs
  img = loadImage("dumpsterfire.png");
  bg  = loadImage("alley.jpg");
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(0);

  // draw background scaled to canvas
  image(bg, 0, 0, width, height);

  // flicker effect using Perlin noise
  let flicker = noise(noiseOffset) * 100;
  noiseOffset += 0.1;
  tint(255, 255 - flicker);

  // slight random jitter
  let offsetX = random(-2, 2);
  let offsetY = random(-2, 2);

  // draw moving foreground image
  image(img, x + offsetX, height / 2 + offsetY);

  // reset tint so it doesn’t affect later draws
  noTint();

  // move image horizontally
  x += 2;
  if (x > width) {
    x = -img.width;
  }
}
