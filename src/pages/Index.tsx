import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FilePreview } from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Document } from 'docx';

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
    const arrayBuffer = await file.arrayBuffer();
    const doc = new Document(arrayBuffer);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    
    // Extract text content from Word document
    const text = doc.getText();
    const fontSize = 12;
    const font = await pdfDoc.embedFont('Helvetica');
    
    page.drawText(text, {
      x: 50,
      y: page.getHeight() - 50,
      size: fontSize,
      font,
    });
    
    return await pdfDoc.save();
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
    
    // Calculate scaling to fit the page while maintaining aspect ratio
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
        pdfBytes = await convertWordToPdf(selectedFile);
      } else {
        pdfBytes = await convertImageToPdf(selectedFile);
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setConvertedFile(URL.createObjectURL(blob));
      
      toast({
        title: "Conversion complete!",
        description: "Your file has been converted to PDF successfully.",
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "There was an error converting your file. Please try again.",
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