const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.resolve(__dirname, '../assets/png/logo.png'));
png2icons.setLogger(console.log);
let output = png2icons.createICNS(input, png2icons.BILINEAR, 0);
if (output) {
    fs.writeFileSync(path.resolve(__dirname, '../assets/png/logo.icns'), output);
}
output = png2icons.createICO(input, png2icons.BEZIER, 20, true);
if (output) {
    fs.writeFileSync(path.resolve(__dirname, '../assets/png/logo.ico'), output);
}
