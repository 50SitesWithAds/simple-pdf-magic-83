import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FilePreview } from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConvertedFile(null);
  };

  const convertWordToPdf = async (file: File): Promise<ArrayBuffer> => {
    console.log('Starting Word to PDF conversion for file:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded as ArrayBuffer');
    
    try {
      // Extract text from Word document using mammoth first
      console.log('Extracting text with mammoth...');
      const result = await mammoth.extractRawText({ arrayBuffer });
      const textContent = result.value;
      console.log('Text extracted successfully:', textContent.substring(0, 100) + '...');

      // Create a new PDF document
      console.log('Creating PDF document...');
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont('Helvetica');
      console.log('PDF document created with initial page');

      // Split text into lines and draw on PDF
      const lines = textContent.split('\n');
      let y = page.getHeight() - 50;
      
      console.log('Processing', lines.length, 'lines of text');
      for (const line of lines) {
        if (line.trim()) {
          page.drawText(line, {
            x: 50,
            y,
            size: 12,
            font,
          });
          y -= 20; // Move down for next line
          
          // Add new page if we run out of space
          if (y < 50) {
            page = pdfDoc.addPage();
            y = page.getHeight() - 50;
            console.log('Added new page to PDF');
          }
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

  const convertImageToPdf = async (file: File): Promise<ArrayBuffer> => {
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

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      setConverting(true);
      let pdfBytes: ArrayBuffer;

      if (selectedFile.type.includes('word') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.doc')) {
        console.log('Starting Word document conversion...');
        pdfBytes = await convertWordToPdf(selectedFile);
        console.log('Word conversion completed successfully');
      } else {
        console.log('Starting image conversion...');
        pdfBytes = await convertImageToPdf(selectedFile);
        console.log('Image conversion completed successfully');
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setConvertedFile(URL.createObjectURL(blob));
      
      toast({
        title: "Conversion complete!",
        description: "Your file has been converted to PDF successfully.",
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "There was an error converting your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile;
    link.download = `converted-${selectedFile?.name.split('.')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your PDF file is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-3xl px-4 mx-auto">
        <h1 className="mb-2 text-4xl font-bold text-center">PDF Converter</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Convert your documents to PDF format in seconds
        </p>

        <div className="p-8 bg-white border rounded-xl shadow-sm">
          {!selectedFile ? (
            <FileUploadZone onFileSelect={handleFileSelect} />
          ) : (
            <div>
              <FilePreview
                file={selectedFile}
                onRemove={() => {
                  setSelectedFile(null);
                  setConvertedFile(null);
                }}
              />
              <div className="flex justify-center gap-4 mt-6">
                {!convertedFile ? (
                  <Button
                    size="lg"
                    onClick={handleConvert}
                    disabled={converting}
                    className="gap-2"
                  >
                    {converting ? (
                      "Converting..."
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Convert to PDF
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
