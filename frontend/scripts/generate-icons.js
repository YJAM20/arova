const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const iconsDir = path.join(__dirname, '..', 'public', 'assets', 'icons');

// Ensure output directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Define the SVG logo content representing Arova's brand
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="128" fill="#051424" />
  <!-- Nebula Glow -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="#dfe0ff" stroke-width="8" opacity="0.25" />
  <ellipse cx="256" cy="256" rx="200" ry="80" fill="none" stroke="#f6be38" stroke-width="6" transform="rotate(-30 256 256)" opacity="0.35" />
  <!-- Orbiting dots -->
  <circle cx="256" cy="96" r="12" fill="#dfe0ff" />
  <circle cx="416" cy="256" r="8" fill="#f6be38" />
  <!-- Elegant Letter A -->
  <text x="256" y="325" font-family="'Playfair Display', serif" font-size="220" font-weight="bold" fill="#dfe0ff" text-anchor="middle">A</text>
  <circle cx="256" cy="380" r="16" fill="#f6be38" opacity="0.8" />
</svg>`;

// Save the SVG file
const svgPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('Saved SVG icon to', svgPath);

// Copy base PNG icon for reference
const basePngSource = path.join('C:', 'Users', 'yajm2', '.gemini', 'antigravity-ide', 'brain', '7425669b-2e5d-4b35-a7df-cd4d101478df', 'arova_pwa_icon_base_1782069792520.png');
const basePngDest = path.join(iconsDir, 'icon-base.png');
if (fs.existsSync(basePngSource)) {
  fs.copyFileSync(basePngSource, basePngDest);
  console.log('Copied AI generated base PNG to', basePngDest);
}

// 2. Playwright resize logic
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generatePngs() {
  console.log('Launching browser to generate PNG icons...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set content to load canvas rendering logic
  await page.setContent(`
    <html>
      <body>
        <canvas id="canvas"></canvas>
      </body>
    </html>
  `);

  const base64Svg = Buffer.from(svgContent).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(iconsDir, filename);

    // Render image to canvas and export base64
    const base64Png = await page.evaluate(async ({ url, size }) => {
      const canvas = document.getElementById('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);

      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { url: dataUrl, size });

    fs.writeFileSync(outputPath, Buffer.from(base64Png, 'base64'));
    console.log(`Generated ${size}x${size} PNG: ${filename}`);
  }

  await browser.close();
  console.log('All PNG icons generated successfully!');
}

generatePngs().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
