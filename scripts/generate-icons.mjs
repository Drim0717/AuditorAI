// Script to generate PNG icons using canvas (built-in to Node via @napi-rs/canvas or just create a simple SVG-to-PNG)
// Since we don't want extra deps, we'll write raw PNG data using a pure-JS PNG encoder for a simple solid-color icon.

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background: dark blue rounded square
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.arcTo(size, 0, size, radius, radius);
  ctx.lineTo(size, size - radius);
  ctx.arcTo(size, size, size - radius, size, radius);
  ctx.lineTo(radius, size);
  ctx.arcTo(0, size, 0, size - radius, radius);
  ctx.lineTo(0, radius);
  ctx.arcTo(0, 0, radius, 0, radius);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(1, '#4338ca');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw a simple "L" letter representing LotoAudit
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', size / 2, size / 2 + size * 0.03);

  // Small "AI" text below
  ctx.font = `bold ${size * 0.16}px Arial`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('AI', size / 2, size * 0.73);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

const publicDir = path.resolve('public');
generateIcon(192, path.join(publicDir, 'icon-192.png'));
generateIcon(512, path.join(publicDir, 'icon-512.png'));
console.log('Done!');
