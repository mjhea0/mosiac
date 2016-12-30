function createNewCanvas(image) {
  console.log(image);
  // const canvas = document.getElementById('mosaic');
  canvas.width = image.width;
  canvas.height = image.height;
  console.log(canvas);
  return canvas;
}

const image = '<img src="sample.png">';
const results = createNewCanvas(image); // jshint ignore:line
console.log(results);
// expect(1 + 1).to.eql(2);
