import { SliderItem } from '../types';

export interface ExportImage {
  fileName: string;
  data: string; // base64 data URL
}

export interface ExportData {
  images: ExportImage[];
}

export class FileManager {
  static async exportWithImages(sliders: SliderItem[]): Promise<ExportData> {
    const images: ExportImage[] = [];
    
    for (const slider of sliders) {
      if (slider.isLocalFile && slider.imageFileName && slider.image) {
        images.push({
          fileName: slider.imageFileName,
          data: slider.image
        });
      }
    }
    
    return { images };
  }
  
  static generateFileName(originalName: string): string {
    // Remove special characters and spaces
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    // Get file extension
    const lastDotIndex = cleanName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const name = cleanName.substring(0, lastDotIndex);
      const extension = cleanName.substring(lastDotIndex);
      return `${name}_${timestamp}_${random}${extension}`;
    }
    
    return `${cleanName}_${timestamp}_${random}`;
  }
  
  static async validateImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    });
  }
  
  static getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    });
  }
  
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}