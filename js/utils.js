'use strict';


// ** globals ** //
const sourceImage = new Image();
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const windowURL = window.URL || window.webkitURL || window;


// ** helpers ** //

function handleImageUpload(event) {
  loadOriginalImage(event);
  handleImage(event);
}


function loadOriginalImage(event) {
  const originalCanvasElement = document.getElementById('original');
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      originalCanvasElement.width = img.width;
      originalCanvasElement.height = img.height;
      originalCanvasElement.getContext('2d').drawImage(img, 0, 0);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
  return true;
}

function handleImage(event) {
    const reader = new FileReader();
    reader.onload = (e)=> {
      const sourceImage = new Image();
      // once the image loads
      sourceImage.onload = () => {
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;
      // call all worker funcitons
      drawMosiac(sourceImage);
    };
    sourceImage.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function drawMosiac(image) {
  const finalCanvas = document.getElementById('mosaic');
  finalCanvas.width = image.width;
  finalCanvas.height = image.height;
  const hexArray = [];
  const positions = [];
  const allSvg = [];
  // each chunk equalls 16x16px squares
  const chunkSize = image.width / TILE_WIDTH; // jshint ignore:line
  const tileData = getTileData(image);
  //split tiles into 16x16 chunks
  let chunk = tileData.splice(0, chunkSize);
  // while chunks exist break it into arrays of data
  while(chunk.length !== 0) {
    for(let i = 0; i< chunk.length; i++){
      // refactor into a generator
      chunk.map((data) => {
        //returns single svg
        const hex = data.hex;
        const posX = data.x;
        const posY = data.y;
        hexArray.push(hex);
        positions.push({x: posX, y: posY});
      });
    }
    // re-allocate to next chunk
    chunk = tileData.splice(0, chunkSize);
  }
  fetchNextColor(hexArray, positions, finalCanvas, 0, [], 0);
}

// get initial data for tiles
function getTileData(sourceImage) {
  let counter = 0;
  const tile = [];
  // read original image data to be placed into tiles
  const context = readImageData(sourceImage);
  const numX = sourceImage.width / TILE_WIDTH;    // jshint ignore:line
  const numY = sourceImage.height / TILE_HEIGHT;  // jshint ignore:line
  // getImageData built in pixel data reader function from canvas
  // returns the RGB
  const data = context.getImageData(0, 0, numX, numY).data;
  // for loop adding the hex color into object
  for(var row = 0; row < numY; row++) {
    for(var col = 0; col < numX; col++) {
      // make new tile instance
      tile.push(new MakeTile(data.subarray(counter * 4, counter * 4 + 3), col, row));
      counter++;
    }
  }
  return tile;
}

function readImageData(sourceImage) {
  // divide the image into 16x16px tiles
  canvas.width = (sourceImage.width / TILE_WIDTH);      // jshint ignore:line
  canvas.height = (sourceImage.height / TILE_HEIGHT);   // jshint ignore:line
  // draw the image starting at x,y coordinates of 0,0
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  return ctx;
}

// get image meta data and coordinates associated with it
function MakeTile(imageData, x, y) {
  this.hex = rgbToHex(imageData);
  this.x = x * TILE_WIDTH;    // jshint ignore:line
  this.y = y * TILE_HEIGHT;   // jshint ignore:line
}

function rgbToHex(rgb) {
  return compToHex(rgb[0]) + compToHex(rgb[1]) + compToHex(rgb[2]);
}

function compToHex(item) {
  var hex = item.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function fetchNextColor(hexArray, positions, finalCanvas, index, arr, count) {
  let indexCount = index;
  let i = count;
  const masterSvg = arr;
  const finalCtx = finalCanvas.getContext('2d');
  // refactor (no .catch)
  hexFetch(hexArray[indexCount])
  .then((response) => {
    return response.text();
  })
  .then((result) => {
    masterSvg.push({svg: result, x: positions[i].x, y: positions[i].y});
    indexCount++;
    i++;
    console.log(indexCount, hexArray.length);
    // refactor (could cause an infinite loop)
    if (indexCount >= hexArray.length) {
      renderRows(masterSvg, finalCtx, finalCanvas);
    } else {
      fetchNextColor(
        hexArray, positions, finalCanvas, indexCount, masterSvg, i
      );
    }
  });
}

function hexFetch(hex){
  return fetch('/color/' + hex);
}

function renderRows(arr, ctx, canvas) {
  arr.forEach(function(data) {
    renderTile(ctx, data.svg, {x: data.x, y: data.y});
  });
}

function renderTile(ctx, svg, coords) {
  const image = new Image();
  const svgBlob = getBlob(svg);
  const url = getUrl(svgBlob);
    image.src = url;
    image.onload = function() {
      try {
        ctx.drawImage(image, coords.x, coords.y);
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        revokeUrl(url);
      }
      catch(error){
        throw new Error("Image is too large");
      }
    };
  return canvas;
}

function revokeUrl(url) {
  windowURL.revokeObjectURL(url);
}

function getBlob(data) {
  const svgBlob = new Blob([data], {type: 'image/svg+xml'});
  return svgBlob;
}

function getUrl(blob) {
  const url = windowURL.createObjectURL(blob);
  return url;
}
