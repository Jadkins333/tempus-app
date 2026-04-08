// Generate Tempus app icons as PNG using canvas
const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const scale = size / 512;

  // Background
  ctx.fillStyle = '#08090a';
  ctx.fillRect(0, 0, size, size);

  // Subtle radial glow
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c * 0.8);
  glow.addColorStop(0, 'rgba(94,106,210,0.15)');
  glow.addColorStop(1, 'rgba(94,106,210,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Outer circle
  ctx.strokeStyle = '#5e6ad2';
  ctx.lineWidth = 12 * scale;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Progress arc (about 27% of year - matching current date approximately)
  ctx.strokeStyle = '#5e6ad2';
  ctx.lineWidth = 14 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(c, c, c * 0.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.27);
  ctx.stroke();

  // Hour hand
  ctx.strokeStyle = '#f7f8f8';
  ctx.lineWidth = 10 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.lineTo(c, c - c * 0.35);
  ctx.stroke();

  // Minute hand
  ctx.lineWidth = 8 * scale;
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.lineTo(c + c * 0.22, c + c * 0.15);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#5e6ad2';
  ctx.beginPath();
  ctx.arc(c, c, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Accent dot at progress endpoint
  const angle = -Math.PI / 2 + Math.PI * 2 * 0.27;
  const dx = c + c * 0.6 * Math.cos(angle);
  const dy = c + c * 0.6 * Math.sin(angle);
  ctx.fillStyle = '#828fff';
  ctx.beginPath();
  ctx.arc(dx, dy, 10 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

generateIcon(192, 'icons/icon-192.png');
generateIcon(512, 'icons/icon-512.png');
console.log('Icons generated!');
