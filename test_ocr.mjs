import { createWorker } from 'tesseract.js';

async function testOCR() {
  const imagePath = 'C:/Users/marwan.sa/.gemini/antigravity-ide/brain/71df5248-4c29-49ec-b4d8-2500dbe44a22/media__1785907435656.jpg'; // Path to the copied artifact
  
  try {
    const worker = await createWorker('tha+eng');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    
    console.log("Raw OCR Text:");
    console.log(text);
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    console.log("Clean Text:", cleanText);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testOCR();
