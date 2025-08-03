import React, { useState, useCallback } from 'react';
import { SliderItem } from '../types';

interface SliderPreviewProps {
  sliders: SliderItem[];
  onRemoveSlider: (id: string) => void;
}

export function SliderPreview({ sliders, onRemoveSlider }: SliderPreviewProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Validate that onRemoveSlider is a function
  const safeOnRemoveSlider = useCallback((id: string) => {
    if (typeof onRemoveSlider === 'function') {
      onRemoveSlider(id);
    } else {
      console.error('onRemoveSlider is not a function:', typeof onRemoveSlider);
      alert('Silme fonksiyonu bulunamadı. Parent component\'te onRemoveSlider prop\'unu kontrol edin.');
    }
  }, [onRemoveSlider]);

  const handleImageError = useCallback((id: string) => {
    console.log('Image error for slider:', id);
    setImageErrors(prev => new Set(prev).add(id));
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    console.log('Image loaded for slider:', id);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    console.log('Delete button clicked for slider:', id);
    setConfirmDelete(id);
    
    // Auto-cancel confirmation after 5 seconds
    setTimeout(() => {
      setConfirmDelete(null);
    }, 5000);
  }, []);

  const handleConfirmDelete = useCallback((id: string) => {
    console.log('Confirming delete for slider:', id);
    
    try {
      safeOnRemoveSlider(id);
      console.log('safeOnRemoveSlider called successfully');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error calling safeOnRemoveSlider:', error);
      alert('Silme işleminde hata oluştu: ' + error);
    }
  }, [safeOnRemoveSlider]);

  const handleCancelDelete = useCallback(() => {
    console.log('Delete cancelled');
    setConfirmDelete(null);
  }, []);

  return (
    <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🎬</span>
          Canlı Önizleme ({sliders.length})
        </h2>
        {sliders.length > 0 && (
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            📁 {sliders.filter(s => s.isLocalFile).length} yerel | 
            🌐 {sliders.filter(s => !s.isLocalFile).length} URL
          </div>
        )}
      </div>

      {sliders.length === 0 ? (
        <div className="text-gray-500 text-center py-16">
          <div className="text-6xl mb-4">📸</div>
          <div className="text-xl font-medium mb-3 text-gray-700">Henüz slider eklenmedi</div>
          <div className="text-sm text-gray-500">Sol taraftan yeni slider ekleyerek başlayın.</div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
            <div className="text-sm text-blue-700">
              <strong>🚀 Hızlı Başlangıç:</strong><br/>
              1. Başlık girin<br/>
              2. Açıklama yazın<br/>
              3. Resim ekleyin<br/>
              4. "Slider Ekle" butonuna tıklayın
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-h-96 lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {sliders.map((item, index) => (
            <div 
              key={`slider-preview-${item.id}-${index}`} 
              className="border-2 p-4 rounded-lg relative group hover:shadow-lg transition-all duration-200 bg-gray-50 hover:bg-white border-gray-200 hover:border-blue-300"
            >
              {/* Delete Button Area */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                {confirmDelete === item.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(item.id)}
                      className="bg-red-600 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-red-700 transition-colors shadow-lg"
                      title="Evet, sil"
                    >
                      ✓ EVET
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="bg-gray-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-gray-600 transition-colors shadow-lg"
                      title="Hayır, iptal et"
                    >
                      ✕ HAYIR
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(item.id)}
                    className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white"
                    title="Slider'ı sil"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Slide Number */}
              <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold z-10 shadow-md">
                #{index + 1}
              </div>

              {/* Local file indicator */}
              {item.isLocalFile && (
                <div className="absolute top-12 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md">
                  📁 Yerel
                </div>
              )}

              {/* URL indicator */}
              {!item.isLocalFile && (
                <div className="absolute top-12 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md">
                  🌐 URL
                </div>
              )}
              
              {/* Image Section */}
              <div className="mt-8 mb-4">
                {imageErrors.has(item.id) ? (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-2 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-400">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-3">📷</div>
                      <div className="text-sm font-medium">Resim yüklenemedi</div>
                      {item.imageFileName && (
                        <div className="text-xs mt-1 text-gray-400 break-all">
                          📁 {item.imageFileName}
                        </div>
                      )}
                      <div className="text-xs mt-2 text-red-500 max-w-48 break-all">
                        {item.image.substring(0, 50)}...
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.id);
                            return newSet;
                          });
                        }}
                        className="mt-3 text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        🔄 Yeniden Dene
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.title || `Slider ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border shadow-md hover:shadow-lg transition-shadow"
                      onError={() => handleImageError(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                      loading="lazy"
                    />
                    {/* Image overlay info */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                      {item.isLocalFile ? '📁 Yerel Dosya' : '🌐 URL'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="space-y-4">
                {/* Title Display */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
                  <div className="text-xs font-medium mb-1 opacity-90">📝 BAŞLIK</div>
                  <div className="font-bold text-lg leading-tight">
                    {item.title || `Slide ${index + 1}`}
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4 shadow-sm">
                  <div className="text-xs font-medium text-gray-600 mb-2">📄 İÇERİK</div>
                  <div 
                    className="text-sm break-words leading-relaxed text-gray-800" 
                    dangerouslySetInnerHTML={{ 
                      __html: item.text || '<em class="text-gray-400">Metin girilmemiş</em>' 
                    }} 
                  />
                </div>
                
                {/* File Info */}
                {item.isLocalFile && item.imageFileName && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <span className="font-medium">📁 Dosya:</span>
                    <span className="break-all">{item.imageFileName}</span>
                  </div>
                )}

                {/* URL Info */}
                {!item.isLocalFile && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="font-medium">🌐 URL:</span>
                    <span className="break-all truncate max-w-xs">
                      {item.image.substring(0, 60)}
                      {item.image.length > 60 ? '...' : ''}
                    </span>
                  </div>
                )}

                {/* Character counts */}
                <div className="flex justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                  <span className="flex items-center gap-1">
                    📝 Başlık: <strong>{item.title?.length || 0}</strong> karakter
                  </span>
                  <span className="flex items-center gap-1">
                    📄 Metin: <strong>{item.text?.length || 0}</strong> karakter
                  </span>
                </div>
              </div>

              {/* Confirmation warning overlay */}
              {confirmDelete === item.id && (
                <div className="absolute inset-0 bg-red-50 bg-opacity-98 rounded-lg flex items-center justify-center z-20 border-2 border-red-300">
                  <div className="text-center p-6 bg-white rounded-xl shadow-2xl border-2 border-red-200 max-w-sm">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-xl font-bold text-red-700 mb-3">
                      Slider'ı Sil?
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>"{item.title || `Slide ${index + 1}`}"</strong>
                    </div>
                    <div className="text-xs text-gray-500 mb-6">
                      Bu işlem geri alınamaz!<br/>
                      ID: {item.id}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(item.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
                      >
                        ✓ EVET, SİL
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-lg"
                      >
                        ✕ İPTAL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}