import React, { useState } from 'react';
import { SliderItem } from '../types';
import { FileManager } from '../utils/filemanager';
import JSZip from 'jszip';

interface ExportButtonProps {
  sliders: SliderItem[];
}

export function ExportButton({ sliders }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCurvedSliderHTML = (sliders: SliderItem[]) => {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Curved Slider</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow: hidden;
            color: #333;
        }

        .container {
            height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-wrapper {
            position: relative;
            height: 100vh;
            width: 100%;
            perspective: 2000px;
            transform-style: preserve-3d;
        }

        .content-slide {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6rem;
            padding: 2rem;
            transition: all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1);
            transform-origin: center center;
            backface-visibility: hidden;
        }

        .content-slide.active {
            transform: translateX(0) rotateY(0) scale(1);
            opacity: 1;
            z-index: 2;
        }

        .content-slide.prev {
            transform: translateX(-100%) rotateY(-75deg) scale(0.8);
            opacity: 0;
            z-index: 1;
        }

        .content-slide.next {
            transform: translateX(100%) rotateY(75deg) scale(0.8);
            opacity: 0;
            z-index: 1;
        }

        .text-content {
            flex: 1;
            max-width: 500px;
            text-align: left;
            transform: translateZ(50px);
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
        }

        .text-content h2 {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            color: #333;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.6s ease 0.3s;
            line-height: 1.2;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .text-content p {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #555;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.6s ease 0.5s;
        }

        .content-slide.active .text-content h2,
        .content-slide.active .text-content p {
            opacity: 1;
            transform: translateX(0);
        }

        .image-content {
            flex: 1;
            max-width: 500px;
            transform: translateZ(100px);
        }

        .image-content img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            transition: transform 0.6s ease;
        }

        .content-slide.active .image-content img {
            transform: scale(1.05);
        }

        .nav-controls {
            position: fixed;
            bottom: 2rem;
            width: 100%;
            display: flex;
            justify-content: space-between;
            padding: 0 4rem;
            z-index: 10;
        }

        .nav-arrow {
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            font-weight: bold;
        }

        .nav-arrow:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-3px) scale(1.1);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .nav-arrow:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .slide-indicator {
            position: fixed;
            bottom: 6rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.5rem;
            z-index: 10;
        }

        .indicator-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .indicator-dot.active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.3);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .slide-counter {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            font-weight: bold;
            z-index: 10;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .slide-title-overlay {
            position: fixed;
            top: 2rem;
            left: 2rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: bold;
            z-index: 10;
            backdrop-filter: blur(10px);
            max-width: 300px;
            transition: all 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .content-slide {
                flex-direction: column;
                gap: 2rem;
                padding: 1rem;
            }

            .text-content,
            .image-content {
                max-width: 100%;
                text-align: center;
            }

            .text-content {
                padding: 2rem;
            }

            .text-content h2 {
                font-size: 2rem;
            }

            .text-content p {
                font-size: 1rem;
            }

            .nav-controls {
                padding: 0 2rem;
            }

            .nav-arrow {
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
            }

            .slide-counter,
            .slide-title-overlay {
                position: relative;
                top: auto;
                right: auto;
                left: auto;
                margin: 1rem;
                display: inline-block;
            }
        }

        /* Loading animation */
        .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 1.5rem;
            z-index: 1000;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        Yükleniyor...
    </div>

    <div class="container" id="slider-container" style="display: none;">
        <div class="slide-counter">
            <span id="current-slide">1</span> / <span id="total-slides">${sliders.length}</span>
        </div>

        <div class="slide-title-overlay" id="slide-title">
            ${sliders[0]?.title || 'Slide 1'}
        </div>

        <div class="content-wrapper">
            ${sliders.map((slider, index) => `
            <div class="content-slide ${index === 0 ? 'active' : index === 1 ? 'next' : ''}" data-slide="${index}">
                <div class="text-content">
                    <h2>${slider.title || `Slide ${index + 1}`}</h2>
                    <p>${slider.text}</p>
                </div>
                <div class="image-content">
                    ${slider.isLocalFile ? `
                    <img src="./slider-images/${slider.imageFileName}" 
                         alt="${slider.title || `Slide ${index + 1}`}"
                         onload="console.log('✅ Image loaded: ${slider.imageFileName}')"
                         onerror="console.error('❌ Image failed to load: ${slider.imageFileName}'); this.style.display='none'; this.parentNode.innerHTML='<div style=\\'display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;background:#f0f0f0;border-radius:20px;color:#666;font-size:1rem;text-align:center;\\'>📷 Resim bulunamadı<br/><small style=\\'color:#999;margin-top:10px;\\'>Dosya: ${slider.imageFileName}</small><br/><small style=\\'color:#999;\\'>Yol: ./slider-images/${slider.imageFileName}</small></div>';">
                    ` : `
                    <img src="${slider.image}" 
                         alt="${slider.title || `Slide ${index + 1}`}"
                         onload="console.log('✅ URL Image loaded')"
                         onerror="console.error('❌ URL Image failed to load'); this.style.display='none'; this.parentNode.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:300px;background:#f0f0f0;border-radius:20px;color:#666;font-size:1.2rem;\\'>📷 URL resmi yüklenemedi</div>';">
                    `}
                </div>
            </div>
            `).join('')}
        </div>

        <div class="nav-controls">
            <button class="nav-arrow prev" id="prev-btn" title="Önceki Slide (←)">←</button>
            <button class="nav-arrow next" id="next-btn" title="Sonraki Slide (→)">→</button>
        </div>

        <div class="slide-indicator">
            ${sliders.map((slider, index) => `
            <div class="indicator-dot ${index === 0 ? 'active' : ''}" 
                 data-slide="${index}" 
                 title="${slider.title || `Slide ${index + 1}`}"></div>
            `).join('')}
        </div>
    </div>

    <script>
        // Simplified initialization - show immediately
        document.addEventListener('DOMContentLoaded', function() {
            // Hide loading and show slider after a short delay
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('slider-container').style.display = 'flex';
                initializeSlider();
            }, 500);
        });

        // Fallback: If DOMContentLoaded already fired
        if (document.readyState === 'loading') {
            // Document is still loading
        } else {
            // Document is already loaded
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('slider-container').style.display = 'flex';
                initializeSlider();
            }, 500);
        }

        function initializeSlider() {
            const slides = document.querySelectorAll('.content-slide');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const indicators = document.querySelectorAll('.indicator-dot');
            const currentSlideSpan = document.getElementById('current-slide');
            const slideTitleOverlay = document.getElementById('slide-title');
            let currentIndex = 0;

            const slideData = [
                ${sliders.map(slider => `{ title: "${slider.title || ''}" }`).join(',\n                ')}
            ];

            function updateSlides() {
                slides.forEach((slide, index) => {
                    slide.classList.remove('active', 'prev', 'next');
                    if (index === currentIndex) {
                        slide.classList.add('active');
                    } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
                        slide.classList.add('prev');
                    } else {
                        slide.classList.add('next');
                    }
                });

                // Update indicators
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentIndex);
                });

                // Update counter and title
                currentSlideSpan.textContent = currentIndex + 1;
                slideTitleOverlay.textContent = slideData[currentIndex].title || \`Slide \${currentIndex + 1}\`;

                // Update navigation button states
                prevBtn.disabled = false;
                nextBtn.disabled = false;
            }

            function goToSlide(index) {
                if (index >= 0 && index < slides.length) {
                    currentIndex = index;
                    updateSlides();
                }
            }

            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlides();
            });

            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlides();
            });

            // Indicator click events
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    goToSlide(index);
                });
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateSlides();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlides();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    goToSlide(0);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    goToSlide(slides.length - 1);
                }
            });

            // Touch/swipe support for mobile
            let startX = 0;
            let startY = 0;
            let distX = 0;
            let distY = 0;
            const threshold = 100;

            document.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });

            document.addEventListener('touchend', (e) => {
                distX = e.changedTouches[0].clientX - startX;
                distY = e.changedTouches[0].clientY - startY;

                if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
                    if (distX > 0) {
                        // Swipe right - go to previous
                        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    } else {
                        // Swipe left - go to next
                        currentIndex = (currentIndex + 1) % slides.length;
                    }
                    updateSlides();
                }
            });

            // Auto-play (optional - uncomment to enable)
            /*
            let autoPlayInterval;
            const autoPlayDelay = 5000; // 5 seconds

            function startAutoPlay() {
                autoPlayInterval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlides();
                }, autoPlayDelay);
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
            }

            // Start auto-play
            startAutoPlay();

            // Pause auto-play on user interaction
            document.addEventListener('click', stopAutoPlay);
            document.addEventListener('keydown', stopAutoPlay);
            document.addEventListener('touchstart', stopAutoPlay);
            */

            // Initialize
            updateSlides();
        }
    </script>
</body>
</html>`;
  };

  const downloadAsZip = async () => {
    try {
      console.log('Starting ZIP export...');
      console.log('Sliders data:', sliders);
      
      const zip = new JSZip();
      const htmlContent = generateCurvedSliderHTML(sliders);
      
      // Add HTML file
      zip.file('index.html', htmlContent);
      console.log('Added index.html to ZIP');
      
      // Create images folder
      const imgFolder = zip.folder('slider-images');
      console.log('Created slider-images folder');
      
      // Process each slider and add local images to zip
      let imageCount = 0;
      for (let i = 0; i < sliders.length; i++) {
        const slider = sliders[i];
        console.log(`Processing slider ${i + 1}:`, {
          title: slider.title,
          isLocalFile: slider.isLocalFile,
          imageFileName: slider.imageFileName,
          hasImageData: !!slider.image,
          imageDataStart: slider.image?.substring(0, 50)
        });
        
        if (slider.isLocalFile && slider.image && slider.imageFileName) {
          try {
            // Convert base64 to blob
            const base64Data = slider.image.split(',')[1];
            if (base64Data) {
              imgFolder?.file(slider.imageFileName, base64Data, { base64: true });
              imageCount++;
              console.log(`✅ Added image to zip: ${slider.imageFileName} (${base64Data.length} chars)`);
            } else {
              console.error(`❌ No base64 data for: ${slider.imageFileName}`);
            }
          } catch (error) {
            console.error(`❌ Error processing image ${slider.imageFileName}:`, error);
          }
        } else {
          console.log(`⏭️ Skipping slider ${i + 1} - not a local file or missing data`);
        }
      }
      
      console.log(`Total images added to ZIP: ${imageCount}`);
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      console.log('ZIP generated, size:', zipBlob.size);
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curved-slider-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('ZIP download initiated');
      
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const downloadHTMLOnly = async () => {
    const htmlContent = generateCurvedSliderHTML(sliders);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curved-slider-export-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = async () => {
    if (sliders.length === 0) {
      alert('Export edilecek slider bulunamadı.');
      return;
    }

    setIsExporting(true);

    try {
      const hasLocalImages = sliders.some(slider => slider.isLocalFile);
      
      if (hasLocalImages) {
        // Export as ZIP with images folder
        await downloadAsZip();
        
        // Show instructions with debug info
        setTimeout(() => {
          const debugInfo = sliders.map((slider, index) => {
            if (slider.isLocalFile) {
              return `${index + 1}. "${slider.title}" → slider-images/${slider.imageFileName}`;
            } else {
              return `${index + 1}. "${slider.title}" → URL: ${slider.image.substring(0, 50)}...`;
            }
          }).join('\n');

          alert(
            '📁 ZIP dosyası indirildi!\n\n' +
            '📋 Dosya yapısı:\n' +
            '├── index.html\n' +
            '└── slider-images/\n' +
            `    ├── ${sliders.filter(s => s.isLocalFile).map(s => s.imageFileName).join('\n    ├── ')}\n\n` +
            '🔧 Debug bilgisi:\n' + debugInfo + '\n\n' +
            '📖 Nasıl kullanılır:\n' +
            '1. ZIP dosyasını masaüstüne çıkarın\n' +
            '2. Çıkarılan klasörde index.html ve slider-images klasörü yan yana olmalı\n' +
            '3. index.html dosyasını çift tıklayarak açın\n\n' +
            '⚠️ Eğer resimler görünmüyorsa:\n' +
            '• Dosya yollarını kontrol edin\n' +
            '• Tarayıcının geliştirici araçlarını açın (F12)\n' +
            '• Console sekmesinde hata mesajlarına bakın\n\n' +
            '🎮 Kontroller:\n' +
            '• Ok tuşları ile navigasyon\n' +
            '• Alt indikator noktalarına tıklayabilirsiniz\n' +
            '• Mobil dokunmatik destekli'
          );
        }, 1000);
      } else {
        // Only URL images, download HTML only
        await downloadHTMLOnly();
        
        setTimeout(() => {
          alert(
            '📄 HTML dosyası indirildi!\n\n' +
            '✅ Curved slider\'ınız hazır!\n\n' +
            '🎮 Kontroller:\n' +
            '• Ok tuşları ile navigasyon\n' +
            '• Alt indikator noktalarına tıklayabilirsiniz\n' +
            '• Mobil dokunmatik destekli\n' +
            '• Home/End tuşları ile ilk/son slide'
          );
        }, 500);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  const previewSliders = () => {
    if (sliders.length === 0) {
      alert('Önizleme için en az bir slider eklemeniz gerekiyor.');
      return;
    }

    // Debug: Log slider data
    console.log('Preview sliders data:', sliders);
    sliders.forEach((slider, index) => {
      console.log(`Slider ${index + 1}:`, {
        title: slider.title,
        text: slider.text?.substring(0, 50) + '...',
        isLocalFile: slider.isLocalFile,
        imageFileName: slider.imageFileName,
        hasImageData: !!slider.image,
        imageType: slider.image?.substring(0, 20)
      });
    });

    const htmlContent = generateCurvedSliderHTML(sliders);

    try {
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
        
        // Add debug info to the new window
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            newWindow.console.log('Slider data for debugging:', sliders);
          }
        }, 1000);
      } else {
        // Fallback if popup is blocked
        alert('⚠️ Popup engellendi!\n\nTarayıcınızın popup engellemesini devre dışı bırakın veya bu siteye izin verin.');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Önizleme açılırken bir hata oluştu. Tarayıcınızın popup ayarlarını kontrol edin.');
    }
  };

  const localImageCount = sliders.filter(s => s.isLocalFile).length;
  const urlImageCount = sliders.length - localImageCount;

  return (
    <div className="space-y-6">
      {sliders.length > 0 && (
        <div className="text-sm text-gray-600 text-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-center items-center gap-6 mb-2">
            <span className="flex items-center gap-1">
              📊 <strong>Toplam:</strong> {sliders.length} slider
            </span>
            <span className="flex items-center gap-1">
              📁 <strong>Yerel:</strong> {localImageCount}
            </span>
            <span className="flex items-center gap-1">
              🌐 <strong>URL:</strong> {urlImageCount}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {sliders.map((slider, index) => (
              <span key={slider.id} className="mr-2">
                #{index + 1}: "{slider.title || `Slide ${index + 1}`}"
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
          onClick={previewSliders}
          disabled={sliders.length === 0}
        >
          👁️ 3D Önizleme
        </button>
        
        <button
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
          onClick={exportHTML}
          disabled={isExporting || sliders.length === 0}
        >
          {isExporting ? (
            <>⚙️ Export Ediliyor...</>
          ) : (
            <>🎬 Curved Slider Export {localImageCount > 0 ? '(ZIP)' : '(HTML)'}</>
          )}
        </button>
      </div>
      
      {localImageCount > 0 && (
        <div className="text-xs text-gray-500 text-center max-w-md mx-auto bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          ℹ️ <strong>Önemli:</strong> Yerel resimler olduğu için ZIP dosyası olarak indirilecek. 
          ZIP'i açtığınızda index.html ve slider-images klasörü aynı konumda olmalı.
        </div>
      )}

      <div className="text-sm text-blue-700 text-center max-w-2xl mx-auto p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="font-bold mb-2">🎮 3D Curved Slider Özellikleri:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>• 3D dönüşüm efektleri</div>
          <div>• Keyboard navigasyonu (←→)</div>
          <div>• Dokunmatik kaydırma</div>
          <div>• İndikator noktalar</div>
          <div>• Smooth geçiş animasyonları</div>
          <div>• Mobil uyumlu tasarım</div>
          <div>• Otomatik resim yükleme</div>
          <div>• Özel başlık desteği</div>
        </div>
      </div>
    </div>
  );
}