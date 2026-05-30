/**
 * VibeVogue - Fashion Try-On Application
 * Main Application Component
 */

import { useState, useEffect, useRef } from 'react';
import { liveQuery } from 'dexie';
import { GlassPanel, ImageFrame } from './components/ui';
import { MuchaLoader } from './components/MuchaLoader';
import './App.css';
import {
  db,
  getModelPhoto,
  saveModelPhoto,
  saveOutfitRecord,
} from './db';
import { analyzeGarment, virtualTryOn } from './services/aiService';
import type { WardrobeItem } from './types';

function App() {
  // State management
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const modelInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // Load wardrobe data on mount
  useEffect(() => {
    const wardrobeSub = liveQuery(() => db.wardrobe.toArray()).subscribe({
      next: (items) => setWardrobeItems(items),
      error: (err) => console.error('Wardrobe query error:', err),
    });

    loadModelPhoto();

    return () => {
      wardrobeSub.unsubscribe();
    };
  }, []);

  // Load model photo from database
  const loadModelPhoto = async () => {
    const photo = await getModelPhoto();
    if (photo) {
      setModelPhoto(photo.imageData);
    }
  };

  // Handle model photo selection
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

  // Handle garment photo upload with AI analysis
  const handleGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;

      setIsLoading(true);
      setLoadingMessage('Analyzing garment...');
      setError(null);

      try {
        const analysis = await analyzeGarment(imageData);
        console.log('Garment analyzed:', analysis);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze garment';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle item selection for outfit
  const handleItemSelect = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    setTryOnResult(null);
  };

  // Virtual try-on
  const handleVirtualTryOn = async () => {
    if (!modelPhoto) {
      setError('Please upload a model photo first');
      return;
    }

    const selectedWardrobeItems = wardrobeItems.filter((item) =>
      selectedItems.has(item.id!)
    );

    if (selectedWardrobeItems.length === 0) {
      setError('Please select at least one garment');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Generating try-on effect...');
    setError(null);

    try {
      const result = await virtualTryOn(
        modelPhoto,
        selectedWardrobeItems[0].imageData
      );

      setTryOnResult(result.imageUrl);

      // Save outfit record
      await saveOutfitRecord(
        `Try-on ${new Date().toLocaleDateString('zh-CN')}`,
        Array.from(selectedItems),
        'Sunny, 22C',
        '',
        '',
        '',
        result.imageUrl
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate try-on';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__content">
          <h1 className="app-header__title">VibeVogue</h1>
          <p className="app-header__subtitle">Fashion Try-On Experience</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="app-grid">
          {/* Left Panel - Wardrobe */}
          <section className="app-panel app-panel--left">
            <GlassPanel variant="solid" padding="lg">
              <div className="panel-header">
                <h2 className="panel-title">My Wardrobe</h2>
                <input
                  type="file"
                  ref={garmentInputRef}
                  onChange={handleGarmentUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  className="btn btn-outline"
                  onClick={() => garmentInputRef.current?.click()}
                >
                  Add Item
                </button>
              </div>

              <div className="wardrobe-grid">
                {wardrobeItems.length === 0 ? (
                  <div className="empty-state">
                    <p>Your wardrobe is empty</p>
                    <p className="empty-state__hint">Upload a garment photo to begin</p>
                  </div>
                ) : (
                  wardrobeItems.map((item) => (
                    <ImageFrame
                      key={item.id}
                      variant="art-nouveau"
                      showGrain={true}
                      decorative={true}
                    >
                      <button
                        className={`wardrobe-item ${selectedItems.has(item.id!) ? 'wardrobe-item--selected' : ''}`}
                        onClick={() => handleItemSelect(item.id!)}
                      >
                        <img
                          src={item.imageData}
                          alt={item.name}
                          className="wardrobe-item__image"
                        />
                        <div className="wardrobe-item__overlay">
                          <span className="wardrobe-item__name">{item.name}</span>
                          <span className="wardrobe-item__category">{item.category}</span>
                        </div>
                        {selectedItems.has(item.id!) && (
                          <div className="wardrobe-item__check">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                              <path
                                fill="currentColor"
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    </ImageFrame>
                  ))
                )}
              </div>
            </GlassPanel>
          </section>

          {/* Center Panel - Model Photo & Actions */}
          <section className="app-panel app-panel--center">
            {/* Model Photo */}
            <GlassPanel variant="solid" padding="lg">
              <h2 className="panel-title">Model Photo</h2>
              <input
                type="file"
                ref={modelInputRef}
                onChange={handleModelPhotoSelect}
                accept="image/*"
                className="hidden"
              />

              {modelPhoto ? (
                <ImageFrame variant="art-nouveau" aspectRatio="portrait">
                  <div className="model-photo">
                    <img
                      src={modelPhoto}
                      alt="Model"
                      className="model-photo__image"
                    />
                    <button
                      className="model-photo__change btn btn-secondary"
                      onClick={() => modelInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
                  </div>
                </ImageFrame>
              ) : (
                <button
                  className="upload-zone"
                  onClick={() => modelInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <path
                      fill="currentColor"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                  <span>Upload Model Photo</span>
                </button>
              )}
            </GlassPanel>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleVirtualTryOn}
                disabled={!modelPhoto || selectedItems.size === 0 || isLoading}
              >
                {isLoading ? 'Processing...' : 'Virtual Try-On'}
              </button>
            </div>
          </section>

          {/* Right Panel - Preview */}
          <section className="app-panel app-panel--right">
            <GlassPanel variant="solid" padding="lg">
              <h2 className="panel-title">Preview</h2>

              {isLoading ? (
                <div className="preview-loading">
                  <MuchaLoader message={loadingMessage} />
                </div>
              ) : tryOnResult ? (
                <div className="preview-result">
                  <ImageFrame variant="art-nouveau" aspectRatio="portrait" decorative={true}>
                    <img
                      src={tryOnResult}
                      alt="Try-on result"
                      className="preview-result__image"
                    />
                  </ImageFrame>
                  <div className="preview-result__actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = tryOnResult;
                        link.download = 'vibevogue-result.png';
                        link.click();
                      }}
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setTryOnResult(null)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="preview-empty">
                  <svg viewBox="0 0 24 24" width="64" height="64">
                    <path
                      fill="currentColor"
                      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                    />
                  </svg>
                  <p>Preview Area</p>
                  <p className="preview-empty__hint">
                    Generate a try-on to see the result
                  </p>
                </div>
              )}
            </GlassPanel>
          </section>
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <MuchaLoader message={loadingMessage} />
        </div>
      )}
    </div>
  );
}

export default App;
