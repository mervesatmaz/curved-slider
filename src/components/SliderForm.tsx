import React, { useState } from 'react';
import { SliderItem } from '../types';

interface SliderFormProps {
  onAddSlider: (slider: Omit<SliderItem, 'id'>) => void;
}

export function SliderForm({ onAddSlider }: SliderFormProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Generate a safe filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const safeFileName = `${timestamp}_${safeName}`;
      
      setImageFileName(safeFileName);
      console.log('File selected:', file.name, '→ Safe name:', safeFileName);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
          console.log('Image data loaded, size:', reader.result.length);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImage(url);
    setImageFileName(''); // Clear filename when using URL
  };

  const handleSubmit = () => {
    if (title.trim() && text.trim() && image) {
      const isLocalFile = image.startsWith('data:');
      onAddSlider({ 
        title: title.trim(),
        text: text.trim(), 
        image,
        isLocalFile,
        imageFileName: isLocalFile ? imageFileName : undefined
      });
      setTitle('');
      setText('');
      setImage('');
      setImageFileName('');
      
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      alert('Lütfen tüm alanları doldurun!');
    }
  };

  return (
    <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">🎬</span> Yeni Slider Ekle
      </h2>
      
      {/* Title Input */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          📝 Slider Başlığı *
        </label>
        <input
          type="text"
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Örn: Harika Ürünümüz, Hizmetlerimiz, Hakkımızda..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <div className="text-xs text-gray-500 mt-1 flex justify-between">
          <span>{title.length}/100 karakter</span>
          {title.length > 80 && (
            <span className="text-orange-500">⚠️ Uzun başlık</span>
          )}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          📄 Slider Metni *
        </label>
        <textarea
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          rows={4}
          placeholder="Slider için açıklama metni yazın..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1 flex justify-between">
          <span>{text.length}/500 karakter</span>
          {text.length > 400 && (
            <span className="text-orange-500">⚠️ Uzun metin</span>
          )}
        </div>
      </div>

      {/* Image Input */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          🖼️ Görsel *
        </label>
        
        {/* URL Input */}
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          className="w-full p-3 border-2 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={image.startsWith('data:') ? '' : image}
          onChange={handleURLChange}
        />
        
        <div className="text-center text-gray-500 text-sm my-3 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative bg-white px-4">veya</div>
        </div>
        
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="file-input"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="file-input" 
            className="cursor-pointer block"
          >
            <div className="text-4xl mb-2">📁</div>
            <div className="text-blue-600 hover:text-blue-700 font-medium">
              Bilgisayardan Dosya Seç
            </div>
            <div className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF, WebP desteklenir
            </div>
          </label>
          
          {imageFileName && (
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <div className="text-sm text-green-700 font-medium">
                ✅ {imageFileName}
              </div>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {image && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Önizleme:</div>
            <div className="relative">
              <img 
                src={image} 
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border-2 shadow-md"
                onError={() => {
                  alert('Resim yüklenemedi. URL\'yi kontrol edin.');
                  if (!image.startsWith('data:')) {
                    setImage('');
                  }
                }}
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {image.startsWith('data:') ? '📁 Yerel' : '🌐 URL'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 transform ${
          title.trim() && text.trim() && image
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        onClick={handleSubmit}
        disabled={!title.trim() || !text.trim() || !image}
      >
        {title.trim() && text.trim() && image ? (
          <>➕ Slider Ekle</>
        ) : (
          <>⚠️ Tüm alanları doldurun</>
        )}
      </button>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
        <div className="font-medium mb-1">💡 İpuçları:</div>
        <ul className="space-y-1">
          <li>• Yerel dosyalar ZIP olarak export edilir</li>
          <li>• URL resimler direkt HTML olarak export edilir</li>
          <li>• Başlık kısa ve etkileyici olmalı</li>
          <li>• Resim boyutu 1200x600 piksel önerilir</li>
        </ul>
      </div>
    </div>
  );
}