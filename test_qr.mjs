import jsQR from 'jsqr';
import { createCanvas, loadImage } from 'canvas';

async function testQR() {
  try {
    const imagePath = 'C:/Users/marwan.sa/.gemini/antigravity-ide/brain/71df5248-4c29-49ec-b4d8-2500dbe44a22/media__1785907435656.jpg'; // Path to the copied artifact
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log("Found QR code:", code.data);
    } else {
      console.log("No QR code found.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testQR();
