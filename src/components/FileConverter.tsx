import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface FileConverterProps {
  converting: boolean;
  convertedFile: string | null;
  onConvert: () => void;
  onDownload: () => void;
}

export const FileConverter: React.FC<FileConverterProps> = ({
  converting,
  convertedFile,
  onConvert,
  onDownload,
}) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      {!convertedFile ? (
        <Button
          size="lg"
          onClick={onConvert}
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
          onClick={onDownload}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      )}
    </div>
  );
};