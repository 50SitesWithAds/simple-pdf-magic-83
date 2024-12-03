import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FilePreview } from '@/components/FilePreview';
import { FileConverter } from '@/components/FileConverter';
import { useToast } from '@/hooks/use-toast';
import { convertWordToPdf, convertImageToPdf } from '@/utils/pdfConverters';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConvertedFile(null);
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
              <FileConverter
                converting={converting}
                convertedFile={convertedFile}
                onConvert={handleConvert}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;