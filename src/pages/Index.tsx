import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FilePreview } from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';

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

    setConverting(true);
    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would be the URL or blob from the server
    setConvertedFile(URL.createObjectURL(selectedFile));
    
    toast({
      title: "Conversion complete!",
      description: "Your file has been converted successfully.",
    });
    setConverting(false);
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile;
    link.download = `converted-${selectedFile?.name || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started!",
      description: "Your converted file is being downloaded.",
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