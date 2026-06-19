'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
  maxSize?: number;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  placeholder = 'Enter image URL or upload',
  className = '',
  maxSize = 5,
}: ImageUploadProps) {
  const [url, setUrl] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleUrlSubmit = () => {
    if (url) {
      onChange?.(url);
      setError('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (onUpload) {
        const uploadedUrl = await onUpload(file);
        setUrl(uploadedUrl);
        onChange?.(uploadedUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setUrl(base64);
          onChange?.(base64);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
          dragOver
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : url ? (
          <div className="relative w-full">
            <img
              src={url}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg object-contain"
              onError={() => setError('Invalid image URL')}
            />
            <button
              onClick={() => { setUrl(''); onChange?.(''); }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Drop an image here or click to upload</p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to {maxSize}MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUrlSubmit}
          disabled={!url}
          className="shrink-0"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

export default ImageUpload;