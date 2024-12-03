import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const FileUploadZone = ({ onFileSelect }: FileUploadZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "drop-zone",
        isDragActive && "dragging",
        "cursor-pointer text-center"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
      <p className="text-lg font-medium">
        {isDragActive ? (
          "Drop your file here..."
        ) : (
          "Drag & drop your file here, or click to select"
        )}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Supports PDF, Word documents, and images
      </p>
    </div>
  );
};