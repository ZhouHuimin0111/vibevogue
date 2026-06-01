/**
 * VibeVogue - Fashion Try-On Application
 * Enhanced Dashboard with Smart Wardrobe, AI Recommendations, and Trend Feed
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { liveQuery } from 'dexie';
import { db, getModelPhoto, saveModelPhoto, saveOutfitRecord, checkAndSeedDemoData, getWardrobeStats, incrementUtilizationCount } from './db';
import { virtualTryOn, generateOutfit } from './services/aiService';
import { WeatherEffects, type WeatherType } from './components/WeatherEffects';
import { WeatherWidget } from './components/WeatherWidget';
import { MuchaLoader } from './components/MuchaLoader';
import { WardrobeDashboard } from './components/WardrobeDashboard';
import { WardrobeFilter } from './components/WardrobeFilter';
import { SmartUpload } from './components/SmartUpload';
import { UserProfile as UserProfileComponent, getUserProfile } from './components/UserProfile';
import { AIRecommendations } from './components/AIRecommendations';
import { WelcomeModal, isWelcomeCompleted } from './components/WelcomeModal';
import { MoodWidget } from './components/MoodWidget';
import { AIStyleAssistant } from './components/AIStyleAssistant';
import { Trends } from './components/Trends';
import type { WardrobeItem, OutfitRecord, GarmentCategory, Season, AIRecommendationResult, OutfitRecommendation } from './types';
import type { WardrobeStats } from './db';
import './App.css';

type NavItem = 'tryon' | 'wardrobe' | 'history' | 'recommend' | 'chat' | 'trends';

interface CanvasItem extends WardrobeItem {
  canvasId: string;
}

function App() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [outfitRecords, setOutfitRecords] = useState<OutfitRecord[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('处理中...');
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>('tryon');
  const [showWelcome, setShowWelcome] = useState(false);

  // Filter and sort state
  const [filterCategory, setFilterCategory] = useState<GarmentCategory | 'all'>('all');
  const [filterSeason, setFilterSeason] = useState<Season | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-used' | 'name'>('newest');

  // Stats
  const [wardrobeStats, setWardrobeStats] = useState<WardrobeStats>({
    totalItems: 0,
    categoryBreakdown: { 'Top': 0, 'Bottom': 0, 'Dress': 0, 'Shoes': 0, 'Outerwear': 0, 'Accessory': 0 },
    topUtilized: [],
  });

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<AIRecommendationResult>({ recommendations: [] });
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);

  const modelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if welcome is needed
    if (!isWelcomeCompleted()) {
      setShowWelcome(true);
    }

    const initApp = async () => {
      await checkAndSeedDemoData();
    };
    initApp();

    const wardrobeSub = liveQuery(() => db.wardrobe.toArray()).subscribe({
      next: async (items) => {
        setWardrobeItems(items);
        const stats = await getWardrobeStats();
        setWardrobeStats(stats);
      },
      error: (err) => console.error('Wardrobe query error:', err),
    });

    const outfitSub = liveQuery(() => db.outfits.toArray()).subscribe({
      next: (records) => setOutfitRecords(records),
      error: (err) => console.error('Outfit records query error:', err),
    });

    loadModelPhoto();

    return () => {
      wardrobeSub.unsubscribe();
      outfitSub.unsubscribe();
    };
  }, []);

  const loadModelPhoto = async () => {
    const photo = await getModelPhoto();
    if (photo) {
      setModelPhoto(photo.imageData);
    }
  };

  const handleModelPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setModelPhoto(imageData);
      await saveModelPhoto(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleItemSelect = (item: WardrobeItem) => {
    setSelectedItem(item);
  };

  const handleRemoveFromCanvas = (canvasId: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.canvasId !== canvasId));
  };

  const handleVirtualTryOn = async () => {
    if (!modelPhoto) {
      setError('请先上传模特照片');
      return;
    }

    if (canvasItems.length === 0) {
      setError('请先添加服装到穿搭组合');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('正在生成试穿效果...');
    setError(null);

    try {
      // Increment utilization count for used items
      for (const item of canvasItems) {
        if (item.id) {
          await incrementUtilizationCount(item.id);
        }
      }

      // Use first item for try-on
      const result = await virtualTryOn(
        modelPhoto,
        canvasItems[0].imageData
      );

      setTryOnResult(result.imageUrl);

      await saveOutfitRecord(
        `试穿 ${new Date().toLocaleDateString('zh-CN')}`,
        canvasItems.map((item) => item.id!),
        weather,
        '',
        '',
        '',
        result.imageUrl
      );

      setActiveNav('tryon');
    } catch (err) {
      const message = err instanceof Error ? err.message : '试穿生成失败';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (wardrobeItems.length === 0) {
      setError('衣橱为空，请先添加服装');
      return;
    }

    setIsGeneratingRec(true);
    setError(null);

    try {
      const userProfile = getUserProfile();
      const result = await generateOutfit(userProfile, weather, wardrobeItems);
      setRecommendations(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '推荐生成失败';
      setError(message);
    } finally {
      setIsGeneratingRec(false);
    }
  };

  const handleRecommendationTryOn = async (rec: OutfitRecommendation, images: { model?: string; garment?: string }) => {
    if (!modelPhoto && !images.model) {
      setError('请先上传模特照片');
      return;
    }

    const garmentId = rec.dress ?? rec.top ?? rec.bottom ?? rec.outerwear;
    const garmentItem = wardrobeItems.find(item => item.id === garmentId);

    if (!garmentItem && !images.garment) {
      setError('未找到对应的服装图片');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('正在生成试穿效果...');
    setError(null);

    try {
      const result = await virtualTryOn(
        modelPhoto || images.model!,
        garmentItem?.imageData || images.garment!
      );

      setTryOnResult(result.imageUrl);

      const itemIds = [rec.top, rec.bottom, rec.dress, rec.shoes, rec.outerwear, rec.accessory]
        .filter((id): id is number => id !== null);
      for (const id of itemIds) {
        await incrementUtilizationCount(id);
      }

      await saveOutfitRecord(
        `AI推荐穿搭 ${new Date().toLocaleDateString('zh-CN')}`,
        itemIds,
        weather,
        rec.reason,
        '',
        '',
        result.imageUrl
      );

      setActiveNav('tryon');
    } catch (err) {
      const message = err instanceof Error ? err.message : '试穿生成失败';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: WardrobeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const item = JSON.parse(data) as WardrobeItem;

      const exists = canvasItems.some((ci) => ci.id === item.id);
      if (!exists) {
        const newCanvasItem: CanvasItem = {
          ...item,
          canvasId: `canvas-${item.id}-${Date.now()}`,
        };
        setCanvasItems((prev) => [...prev, newCanvasItem]);
        setSelectedItem(item);
      }
    } catch (err) {
      console.error('Failed to parse dropped item:', err);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleTrendsMatch = (style: string) => {
    // Navigate to wardrobe
    setActiveNav('wardrobe');
    // Could trigger a filter based on the matched style
    console.log('Match to style:', style);
  };

  // Filtered and sorted wardrobe items
  const filteredItems = useMemo(() => {
    let items = [...wardrobeItems];

    if (filterCategory !== 'all') {
      items = items.filter(item => item.category === filterCategory);
    }

    if (filterSeason !== 'all') {
      items = items.filter(item => item.seasons.includes(filterSeason));
    }

    switch (sortBy) {
      case 'newest':
        items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
        break;
      case 'most-used':
        items.sort((a, b) => b.utilizationCount - a.utilizationCount);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        break;
    }

    return items;
  }, [wardrobeItems, filterCategory, filterSeason, sortBy]);

  const getNavTitle = () => {
    switch (activeNav) {
      case 'tryon': return '虚拟试穿';
      case 'wardrobe': return '智能衣橱';
      case 'recommend': return 'AI穿搭推荐';
      case 'chat': return '时尚助手';
      case 'trends': return '流行趋势';
      case 'history': return '穿搭历史';
      default: return '';
    }
  };

  const getNavSubtitle = () => {
    switch (activeNav) {
      case 'tryon': return '组合您的穿搭';
      case 'wardrobe': return '管理您的服装';
      case 'recommend': return '个性化穿搭方案';
      case 'chat': return 'AI智能对话';
      case 'trends': return '探索当季时尚';
      case 'history': return '查看历史记录';
      default: return '';
    }
  };

  return (
    <div className="app">
      <WeatherEffects weather={weather} />

      <WelcomeModal isOpen={showWelcome} onComplete={handleWelcomeComplete} />

      <div className="dashboard">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar__logo">
            <span className="sidebar__logo-text">VV</span>
          </div>

          <nav className="sidebar__nav">
            <button
              className={`sidebar__nav-item ${activeNav === 'tryon' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('tryon')}
              title="虚拟试穿"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="sidebar__nav-label">试穿</span>
            </button>

            <button
              className={`sidebar__nav-item ${activeNav === 'wardrobe' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('wardrobe')}
              title="我的衣橱"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="sidebar__nav-label">衣橱</span>
            </button>

            <button
              className={`sidebar__nav-item ${activeNav === 'recommend' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('recommend')}
              title="AI推荐"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="sidebar__nav-label">推荐</span>
            </button>

            <button
              className={`sidebar__nav-item ${activeNav === 'chat' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('chat')}
              title="AI时尚助手"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="sidebar__nav-label">助手</span>
            </button>

            <button
              className={`sidebar__nav-item ${activeNav === 'trends' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('trends')}
              title="流行趋势"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="sidebar__nav-label">趋势</span>
            </button>

            <button
              className={`sidebar__nav-item ${activeNav === 'history' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveNav('history')}
              title="穿搭历史"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="sidebar__nav-label">历史</span>
            </button>
          </nav>

          <div className="sidebar__weather">
            <WeatherWidget weather={weather} onWeatherChange={setWeather} compact />
          </div>
        </aside>

        {/* Action Panel */}
        <section className="action-panel">
          <div className="action-panel__header">
            <h1 className="action-panel__title">{getNavTitle()}</h1>
            <p className="action-panel__subtitle">{getNavSubtitle()}</p>
          </div>

          <div className="action-panel__content">
            {/* Try-On Panel */}
            {activeNav === 'tryon' && (
              <>
                <MoodWidget weather={weather} />

                <div className="upload-zone">
                  <div className="upload-zone__header">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>模特照片</span>
                    <span className="upload-zone__hint">点击上传</span>
                  </div>
                  <input
                    type="file"
                    ref={modelInputRef}
                    onChange={handleModelPhotoSelect}
                    accept="image/*"
                    className="hidden-input"
                  />

                  {modelPhoto ? (
                    <div className="upload-zone__preview" onClick={() => modelInputRef.current?.click()}>
                      <img src={modelPhoto} alt="Model" />
                      <div className="upload-zone__overlay">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>点击更换照片</span>
                      </div>
                    </div>
                  ) : (
                    <button className="upload-zone__button" onClick={() => modelInputRef.current?.click()}>
                      <div className="upload-zone__button-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span className="upload-zone__button-text">上传正脸照片</span>
                      <span className="upload-zone__button-hint">支持 JPG、PNG 格式</span>
                    </button>
                  )}
                </div>

                {/* Quick Add from Wardrobe */}
                {wardrobeItems.length > 0 && (
                  <div className="quick-add-section">
                    <div className="quick-add-section__header">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>从衣橱添加</span>
                    </div>
                    <div className="quick-add-section__grid">
                      {wardrobeItems.slice(0, 8).map((item) => {
                        const isInCanvas = canvasItems.some(ci => ci.id === item.id);
                        return (
                          <button
                            key={item.id}
                            className={`quick-add-item ${isInCanvas ? 'quick-add-item--selected' : ''}`}
                            onClick={() => {
                              if (isInCanvas) {
                                const canvasItem = canvasItems.find(ci => ci.id === item.id);
                                if (canvasItem) {
                                  handleRemoveFromCanvas(canvasItem.canvasId);
                                }
                              } else {
                                const newCanvasItem: CanvasItem = {
                                  ...item,
                                  canvasId: `canvas-${item.id}-${Date.now()}`,
                                };
                                setCanvasItems(prev => [...prev, newCanvasItem]);
                              }
                            }}
                          >
                            <img src={item.imageData} alt={item.name} />
                            <span className="quick-add-item__name">{item.name}</span>
                            {isInCanvas && (
                              <div className="quick-add-item__check">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="outfit-canvas">
                  <div className="outfit-canvas__header">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>穿搭组合</span>
                    <span className="outfit-canvas__count">{canvasItems.length} 件</span>
                  </div>

                  <div
                    className={`outfit-canvas__area ${isDragOver ? 'outfit-canvas__area--drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {canvasItems.length > 0 ? (
                      <div className="outfit-canvas__items">
                        {canvasItems.map((item) => (
                          <div key={item.canvasId} className="outfit-canvas__item">
                            <img src={item.imageData} alt={item.name} />
                            <button
                              className="outfit-canvas__remove"
                              onClick={() => handleRemoveFromCanvas(item.canvasId)}
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                            <span className="outfit-canvas__name">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="outfit-canvas__placeholder">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M12 8v8m-4-4h8" />
                        </svg>
                        <span>从衣橱拖拽服装到这里</span>
                      </div>
                    )}

                    <div className="outfit-canvas__corner outfit-canvas__corner--tl" />
                    <div className="outfit-canvas__corner outfit-canvas__corner--tr" />
                    <div className="outfit-canvas__corner outfit-canvas__corner--bl" />
                    <div className="outfit-canvas__corner outfit-canvas__corner--br" />
                  </div>
                </div>

                <div className="action-panel__footer">
                  <button
                    className="generate-button"
                    onClick={handleVirtualTryOn}
                    disabled={!modelPhoto || canvasItems.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="generate-button__spinner" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        生成穿搭
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Wardrobe Panel */}
            {activeNav === 'wardrobe' && (
              <>
                <UserProfileComponent />
                <SmartUpload compact onUploadComplete={() => {}} />
                <WardrobeDashboard stats={wardrobeStats} />
              </>
            )}

            {/* Recommend Panel */}
            {activeNav === 'recommend' && (
              <>
                <UserProfileComponent />
                <button
                  className="generate-button"
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRec || wardrobeItems.length === 0}
                >
                  {isGeneratingRec ? (
                    <>
                      <span className="generate-button__spinner" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      获取穿搭推荐
                    </>
                  )}
                </button>
                {recommendations.recommendations.length > 0 && (
                  <AIRecommendations
                    recommendations={recommendations}
                    wardrobeItems={wardrobeItems}
                    onGenerateTryOn={handleRecommendationTryOn}
                    isGenerating={isLoading}
                  />
                )}
              </>
            )}

            {/* AI Chat Panel */}
            {activeNav === 'chat' && (
              <AIStyleAssistant
                wardrobeItems={wardrobeItems}
                weather={weather}
              />
            )}

            {/* Trends Panel */}
            {activeNav === 'trends' && (
              <div className="trends-intro">
                <div className="trends-intro__icon">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <p className="trends-intro__text">探索当季流行趋势，寻找穿搭灵感</p>
              </div>
            )}
          </div>
        </section>

        {/* Gallery Area */}
        <section className="gallery-area">
          <div className="gallery-area__header">
            <h2 className="gallery-area__title">{getNavTitle()}</h2>
            <span className="gallery-area__count">
              {activeNav === 'wardrobe' && `${filteredItems.length} 件`}
              {activeNav === 'tryon' && (tryOnResult ? '1 个结果' : '暂无结果')}
              {activeNav === 'recommend' && `${recommendations.recommendations.length} 套方案`}
              {activeNav === 'history' && `${outfitRecords.length} 条记录`}
            </span>
          </div>

          <div className="gallery-area__content">
            {/* Wardrobe Gallery */}
            {activeNav === 'wardrobe' && (
              <>
                <WardrobeFilter
                  selectedCategory={filterCategory}
                  selectedSeason={filterSeason}
                  sortBy={sortBy}
                  onCategoryChange={setFilterCategory}
                  onSeasonChange={setFilterSeason}
                  onSortChange={setSortBy}
                />
                {filteredItems.length === 0 ? (
                  <div className="gallery-empty">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <p className="gallery-empty__title">
                      {wardrobeItems.length === 0 ? '您的衣橱是空的' : '没有符合条件的服装'}
                    </p>
                    <p className="gallery-empty__subtitle">
                      {wardrobeItems.length === 0 ? '使用上方智能上传添加服装' : '调整筛选条件重试'}
                    </p>
                  </div>
                ) : (
                  <div className="gallery-grid">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`gallery-card ${selectedItem?.id === item.id ? 'gallery-card--selected' : ''}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="gallery-card__image">
                          <img src={item.imageData} alt={item.name} />
                          <div className="gallery-card__glow" />
                        </div>
                        <div className="gallery-card__info">
                          <span className="gallery-card__name">{item.name}</span>
                          <span className="gallery-card__category">
                            {item.category === 'Top' ? '上衣' :
                             item.category === 'Bottom' ? '下装' :
                             item.category === 'Dress' ? '连衣裙' :
                             item.category === 'Shoes' ? '鞋子' :
                             item.category === 'Outerwear' ? '外套' : '配饰'}
                          </span>
                          {item.utilizationCount > 0 && (
                            <span className="gallery-card__uses">{item.utilizationCount} 次使用</span>
                          )}
                        </div>
                        <div className="gallery-card__frame gallery-card__frame--tl" />
                        <div className="gallery-card__frame gallery-card__frame--tr" />
                        <div className="gallery-card__frame gallery-card__frame--bl" />
                        <div className="gallery-card__frame gallery-card__frame--br" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Try-On Gallery */}
            {activeNav === 'tryon' && (
              <>
                {!tryOnResult ? (
                  <div className="gallery-empty">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="gallery-empty__title">暂无试穿结果</p>
                    <p className="gallery-empty__subtitle">上传照片并生成您的穿搭</p>
                  </div>
                ) : (
                  <div className="gallery-featured">
                    <div className="gallery-featured__frame">
                      <img src={tryOnResult} alt="试穿结果" />
                      <div className="gallery-featured__glow" />
                    </div>
                    <div className="gallery-featured__actions">
                      <button
                        className="gallery-featured__button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tryOnResult;
                          link.download = 'vibevogue-result.png';
                          link.click();
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载
                      </button>
                      <button
                        className="gallery-featured__button"
                        onClick={() => setTryOnResult(null)}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        重新生成
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Trends Gallery */}
            {activeNav === 'trends' && (
              <Trends
                onMatchToWardrobe={handleTrendsMatch}
              />
            )}

            {/* History Gallery */}
            {activeNav === 'history' && (
              <>
                {outfitRecords.length === 0 ? (
                  <div className="gallery-empty">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="gallery-empty__title">暂无穿搭历史</p>
                    <p className="gallery-empty__subtitle">您生成的穿搭将显示在这里</p>
                  </div>
                ) : (
                  <div className="gallery-grid gallery-grid--history">
                    {outfitRecords.map((record) => (
                      <div key={record.id} className="gallery-card">
                        {record.tryOnImageUrl && (
                          <div className="gallery-card__image">
                            <img src={record.tryOnImageUrl} alt={record.name} />
                            <div className="gallery-card__glow" />
                          </div>
                        )}
                        <div className="gallery-card__info">
                          <span className="gallery-card__name">{record.name}</span>
                          <span className="gallery-card__category">{record.reasoning}</span>
                        </div>
                        <div className="gallery-card__frame gallery-card__frame--tl" />
                        <div className="gallery-card__frame gallery-card__frame--tr" />
                        <div className="gallery-card__frame gallery-card__frame--bl" />
                        <div className="gallery-card__frame gallery-card__frame--br" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {error && (
        <div className="error-toast">
          <span className="error-toast__message">{error}</span>
          <button className="error-toast__dismiss" onClick={() => setError(null)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <MuchaLoader message={loadingMessage} />
        </div>
      )}
    </div>
  );
}

export default App;
