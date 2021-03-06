'use strict';

// ** globals ** //

const newCanvasElement = document.createElement('canvas');
const originalCanvasElement = document.getElementById('original');
const ctx = newCanvasElement.getContext('2d');
const windowURL = window.URL || window.webkitURL || window;

// ** helpers ** //

function handleImageUpload(event) {
  document.getElementById('loader').style.visibility = 'visible';
  loadImage(event, false, (err, res) => {
    if (err) console.log(err);
  });
  loadImage(event, true, (err, res) => {
    if (err) console.log(err);
  });
}

function loadImage(event, newImage, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      if (newImage) {
        newCanvasElement.width = img.width;
        newCanvasElement.height = img.height;
        const finalCanvas = createNewCanvas(img);
        // each chunks are 16x16px squares
        const chunkSize = img.width / TILE_WIDTH; // jshint ignore:line
        const tileData = getTileData(img);
        const tileInfo = drawMosiac(chunkSize, tileData);
        createTileColor(
          tileInfo.positions, tileInfo.hexArray, finalCanvas, 0, [], 0);
      } else {
        originalCanvasElement.width = img.width;
        originalCanvasElement.height = img.height;
        originalCanvasElement.getContext('2d').drawImage(img, 0, 0);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
  callback(null, true);
}

function createNewCanvas(image) {
  const canvas = document.getElementById('mosaic');
  canvas.width = image.width;
  canvas.height = image.height;
  return canvas;
}

function createChunk(data, size) {
  return data.splice(0, size);
}

function drawMosiac(chunkSize, tileData) {
  const hexArray = [];
  const positions = [];
  // split tiles into a 16x16 chunk
  let chunk = createChunk(tileData, chunkSize);
  // while chunks exist break it up into arrays of data
  while(chunk.length !== 0) {
    var gen = chunkGen(chunk, hexArray, positions);
    for(var i = 0; i< chunk.length; i++){
      gen.next(chunk, hexArray, positions);
    }
    chunk = createChunk(tileData, chunkSize);
  }
  return {
    hexArray,
    positions,
  };
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
  // add the hex color into object
  for(var row = 0; row < numY; row++) {
    for(var col = 0; col < numX; col++) {
      // make new tile instance
      const newTile = createTile(
        data.subarray(counter * 4, counter * 4 + 3), col, row);
      tile.push(newTile);
      counter++;
    }
  }
  return tile;
}

// get image meta data and coordinates associated with it
function createTile(imageData, x, y) {
  return {
    hex: rgbToHex(imageData),
    x: x * TILE_WIDTH,          // jshint ignore:line
    y: y * TILE_HEIGHT          // jshint ignore:line
  };
}

function readImageData(sourceImage) {
  // divide the image into 16x16px tiles
  newCanvasElement.width = (sourceImage.width / TILE_WIDTH);      // jshint ignore:line
  newCanvasElement.height = (sourceImage.height / TILE_HEIGHT);   // jshint ignore:line
  // draw the image starting at x,y coordinates of 0,0
  ctx.drawImage(
    sourceImage, 0, 0, newCanvasElement.width, newCanvasElement.height);
  return ctx;
}

function rgbToHex(rgb) {
  return compToHex(rgb[0]) + compToHex(rgb[1]) + compToHex(rgb[2]);
}

function compToHex(item) {
  let hex = item.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

// refactor - too much happening here!
function createTileColor(positions, hexArray, finalCanvas, index, arr, count) {
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
    // refactor (could cause an infinite loop)
    if (indexCount >= hexArray.length) {
      renderRows(masterSvg, finalCtx, finalCanvas);
      document.getElementById('loader').style.display = 'none';
      document.getElementById('upload-container').style.display = 'none';
    } else {
      createTileColor(
        positions, hexArray, finalCanvas, indexCount, masterSvg, i
      );
    }
  });
}

function hexFetch(hex) {
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
        windowURL.revokeObjectURL(url);
      }
      catch(error){
        throw new Error("Image is too large");
      }
    };
  return newCanvasElement;
}

function getBlob(data) {
  const svgBlob = new Blob([data], {type: 'image/svg+xml'});
  return svgBlob;
}

function getUrl(blob) {
  const url = windowURL.createObjectURL(blob);
  return url;
}

// generator to iterate over mapping data
function* chunkGen(chunk, hexArray, positions){
  yield chunkMap(chunk, hexArray, positions);
}

//map over chunk data - this and the generator allow for faster rendering, and larger image handling
function chunkMap(chunk, hexArray, positions){
  chunk.map(function(data) {
    var hex = data.hex;
    var posX = data.x;
    var posY = data.y;
    hexArray.push(hex);
    positions.push({ x: posX, y: posY });
  });
}
