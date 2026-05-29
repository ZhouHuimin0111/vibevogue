import { useState, useEffect, useRef } from 'react';
import { liveQuery } from 'dexie';
import { db, type ClothingItem } from './db';
import { generateTryOn } from './services/falApi';
import { MuchaLoader } from './components/MuchaLoader';

function App() {
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在生成穿搭效果...');
  const [error, setError] = useState<string | null>(null);

  const modelInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clothingSub = liveQuery(() => db.clothing.toArray()).subscribe({
      next: (items) => setClothingItems(items),
      error: (err) => console.error('Clothing query error:', err),
    });

    return () => {
      clothingSub.unsubscribe();
    };
  }, []);

  const handleModelPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setModelPhoto(imageData);

      const existingPhotos = await db.userPhotos.toArray();
      const modelPhotoRecord = existingPhotos.find((p) => p.type === 'model');

      if (modelPhotoRecord) {
        await db.userPhotos.update(modelPhotoRecord.id!, { imageData });
      } else {
        await db.userPhotos.add({
          type: 'model',
          imageData,
          createdAt: new Date(),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClothingPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;

      await db.clothing.add({
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'top',
        imageData,
        createdAt: new Date(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleStartTryOn = async () => {
    if (!modelPhoto) {
      setError('请先选择模特照片');
      return;
    }
    if (!selectedClothing) {
      setError('请先选择衣物照片');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage('正在上传图片...');

    try {
      setLoadingMessage('正在生成穿搭效果，请稍候...');

      const result = await generateTryOn({
        humanImage: modelPhoto,
        garmentImage: selectedClothing.imageData,
        garmentDescription: 'tops',
      });

      setPreviewImage(result.image.url);

      await db.tryOnResults.add({
        modelId: 1,
        clothingIds: [selectedClothing.id!],
        resultImageUrl: result.image.url,
        createdAt: new Date(),
      });

      setLoadingMessage('穿搭效果已生成！');
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败，请重试';
      setError(message);
      console.error('Try-on error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClothing = (item: ClothingItem) => {
    setSelectedClothing(item);
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-stone-800">VibeVogue 穿搭体验</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Photo Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Photo Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-stone-700 mb-4">模特照片</h2>

              <input
                type="file"
                ref={modelInputRef}
                onChange={handleModelPhotoSelect}
                accept="image/*"
                className="hidden"
              />

              {modelPhoto ? (
                <div className="relative">
                  <img
                    src={modelPhoto}
                    alt="Model"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <button
                    onClick={() => modelInputRef.current?.click()}
                    className="absolute bottom-3 right-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-stone-700 hover:bg-white transition-colors shadow-lg"
                  >
                    更换照片
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => modelInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium">点击上传模特照片</span>
                </button>
              )}
            </div>

            {/* Clothing Selection Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-700">衣物照片</h2>
                <input
                  type="file"
                  ref={clothingInputRef}
                  onChange={handleClothingPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => clothingInputRef.current?.click()}
                  className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  + 添加
                </button>
              </div>

              {clothingItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {clothingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectClothing(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                        selectedClothing?.id === item.id
                          ? 'ring-3 ring-amber-500 scale-105'
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={item.imageData}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedClothing?.id === item.id && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <p className="text-sm">暂无衣物照片</p>
                  <p className="text-xs mt-1">点击右上角添加</p>
                </div>
              )}
            </div>
          </div>

          {/* Center - Action Button */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <button
              onClick={handleStartTryOn}
              disabled={!modelPhoto || !selectedClothing || isLoading}
              className={`px-12 py-5 rounded-2xl text-xl font-bold transition-all shadow-xl ${
                !modelPhoto || !selectedClothing || isLoading
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? '生成中...' : '开始穿搭'}
            </button>

            {error && (
              <div className="mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm text-center max-w-xs">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full min-h-96">
              <h2 className="text-lg font-semibold text-stone-700 mb-4">穿搭预览</h2>

              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <MuchaLoader message={loadingMessage} />
                </div>
              ) : previewImage ? (
                <div className="space-y-4">
                  <img
                    src={previewImage}
                    alt="Try-on result"
                    className="w-full rounded-xl shadow-md"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewImage;
                        link.download = 'vibevogue-result.png';
                        link.click();
                      }}
                      className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
                    >
                      下载图片
                    </button>
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-80 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">预览区域</p>
                  <p className="text-xs mt-1">生成穿搭后将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
