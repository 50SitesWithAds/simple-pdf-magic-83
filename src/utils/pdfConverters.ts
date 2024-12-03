import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';

const PAGE_MARGIN = 50;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const MAX_LINE_WIDTH = 500;

export const convertWordToPdf = async (file: File): Promise<ArrayBuffer> => {
  console.log('Starting Word to PDF conversion for file:', file.name);
  const arrayBuffer = await file.arrayBuffer();
  console.log('File loaded as ArrayBuffer');
  
  try {
    // Extract text with formatting from Word document
    console.log('Extracting text with mammoth...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    const textContent = result.value;
    console.log('Text extracted successfully:', textContent.substring(0, 100) + '...');

    // Create PDF document
    console.log('Creating PDF document...');
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size in points
    const font = await pdfDoc.embedFont('Helvetica');
    console.log('PDF document created with initial page');

    // Split content into paragraphs
    const paragraphs = textContent.split('\n\n');
    let y = page.getHeight() - PAGE_MARGIN;

    console.log('Processing', paragraphs.length, 'paragraphs');
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // Word wrap text to fit page width
      const words = paragraph.split(' ');
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, FONT_SIZE);

        if (width > MAX_LINE_WIDTH && currentLine) {
          // Draw current line and move to next
          page.drawText(currentLine, {
            x: PAGE_MARGIN,
            y,
            size: FONT_SIZE,
            font,
          });
          y -= LINE_HEIGHT;
          currentLine = word;

          // Check if we need a new page
          if (y < PAGE_MARGIN) {
            page = pdfDoc.addPage([595, 842]);
            y = page.getHeight() - PAGE_MARGIN;
            console.log('Added new page to PDF');
          }
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text in current line
      if (currentLine) {
        page.drawText(currentLine, {
          x: PAGE_MARGIN,
          y,
          size: FONT_SIZE,
          font,
        });
        y -= LINE_HEIGHT * 1.5; // Add extra space after paragraph
      }

      // Add new page if needed
      if (y < PAGE_MARGIN) {
        page = pdfDoc.addPage([595, 842]);
        y = page.getHeight() - PAGE_MARGIN;
        console.log('Added new page to PDF');
      }
    }
    
    console.log('Saving PDF...');
    return await pdfDoc.save();
  } catch (error) {
    console.error('Detailed error in Word to PDF conversion:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to convert Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const convertImageToPdf = async (file: File): Promise<ArrayBuffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  const imageBytes = await file.arrayBuffer();
  let image;
  
  if (file.type.includes('png')) {
    image = await pdfDoc.embedPng(imageBytes);
  } else {
    image = await pdfDoc.embedJpg(imageBytes);
  }
  
  const { width, height } = image.scale(1);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  
  const scale = Math.min(
    pageWidth / width,
    pageHeight / height
  );
  
  page.drawImage(image, {
    x: (pageWidth - width * scale) / 2,
    y: (pageHeight - height * scale) / 2,
    width: width * scale,
    height: height * scale,
  });
  
  return await pdfDoc.save();
};
