import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FilePreview } from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setConverting(true);
    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Conversion complete!",
      description: "Your file has been converted successfully.",
    });
    setConverting(false);
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
                onRemove={() => setSelectedFile(null)}
              />
              <div className="flex justify-center mt-6">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;