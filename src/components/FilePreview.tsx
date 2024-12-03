import React from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  return (
    <div className="flex items-center justify-between p-4 mt-4 border rounded-lg bg-secondary/50">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};