/**
 * Welcome Modal Component
 * MBTI-based style personality quiz and avatar creation
 */

import { useState, useEffect, useRef } from 'react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (data: UserWelcomeData) => void;
}

export interface UserWelcomeData {
  mbti: string;
  stylePersona: string;
  avatarImage?: string;
  mood?: string;
}

const MBTI_QUESTIONS = [
  {
    id: 'E-I',
    question: '你更倾向于?',
    options: [
      { value: 'E', label: '从社交活动中获得能量', icon: '👥' },
      { value: 'I', label: '从独处中获得能量', icon: '📚' },
    ],
  },
  {
    id: 'S-N',
    question: '你更关注?',
    options: [
      { value: 'S', label: '实际细节与眼前事实', icon: '🔍' },
      { value: 'N', label: '抽象概念与未来可能', icon: '💡' },
    ],
  },
  {
    id: 'T-F',
    question: '做决定时你更看重?',
    options: [
      { value: 'T', label: '逻辑与客观分析', icon: '⚖️' },
      { value: 'F', label: '情感与人际关系', icon: '❤️' },
    ],
  },
  {
    id: 'J-P',
    question: '你的生活方式是?',
    options: [
      { value: 'J', label: '有计划、有组织', icon: '📋' },
      { value: 'P', label: '灵活、开放适应', icon: '🎯' },
    ],
  },
];

const STYLE_PERSONAS: Record<string, { name: string; description: string; colors: string[] }> = {
  'INTJ-ISTJ': { name: '极简先锋', description: '线条利落、剪裁精准的现代都市风格', colors: ['#2C3E50', '#34495E', '#7F8C8D'] },
  'ENTJ-ESTJ': { name: '商务精英', description: '干练得体、注重品质的正式穿搭', colors: ['#1A1A2E', '#4A4A6A', '#C9A87C'] },
  'INFJ-INFP': { name: '文艺优雅', description: '飘逸柔美、注重材质与细节', colors: ['#E8D5C4', '#DDA0DD', '#F5DEB3'] },
  'ENFJ-ENFP': { name: '活泼创意', description: '色彩丰富、搭配大胆的个性表达', colors: ['#E74C3C', '#F39C12', '#9B59B6'] },
  'ISTP-ISFP': { name: '自在随性', description: '舒适自然、慵懒随意的街头风格', colors: ['#2C3E50', '#95A5A6', '#ECF0F1'] },
  'ESTP-ESFP': { name: '时尚先锋', description: '紧随潮流、大胆尝试的时尚态度', colors: ['#E91E63', '#FF5722', '#FFC107'] },
  'INTP-ENTP': { name: '智识经典', description: '简约不简单、低调有内涵', colors: ['#34495E', '#BDC3C7', '#2C3E50'] },
  'ESFJ-ISFJ': { name: '温婉亲和', description: '柔和色调、注重舒适与得体', colors: ['#F8BBD9', '#FFCCBC', '#E1BEE7'] },
};

const STORAGE_KEY = 'vibevogue_welcome_completed';
const MOOD_KEY = 'vibevogue_daily_mood';

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [step, setStep] = useState<'intro' | 'mbti' | 'avatar' | 'complete'>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mbtiResult, setMbtiResult] = useState('');
  const [stylePersona, setStylePersona] = useState<{ name: string; description: string; colors: string[] } | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyMood, setDailyMood] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (completed) {
        setStep('complete');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const savedMood = localStorage.getItem(MOOD_KEY);
    if (savedMood) {
      setDailyMood(savedMood);
    }
  }, []);

  const handleMbtiAnswer = (value: string) => {
    const questionId = MBTI_QUESTIONS[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate MBTI result
      const mbti =
        (newAnswers['E-I'] || 'I') +
        (newAnswers['S-N'] || 'N') +
        (newAnswers['T-F'] || 'F') +
        (newAnswers['J-P'] || 'P');
      setMbtiResult(mbti);

      // Find style persona
      const firstLetter = mbti[0];
      const thirdLetter = mbti[2];

      let personaKey = '';
      if (firstLetter === 'I' && thirdLetter === 'T') personaKey = 'INTJ-ISTJ';
      else if (firstLetter === 'E' && thirdLetter === 'T') personaKey = 'ENTJ-ESTJ';
      else if (firstLetter === 'I' && thirdLetter === 'F' && mbti[2] === 'F') personaKey = 'INFJ-INFP';
      else if (firstLetter === 'E' && thirdLetter === 'F') personaKey = 'ENFJ-ENFP';
      else if (mbti[1] === 'S' && thirdLetter === 'T') personaKey = 'ISTP-ISFP';
      else if (mbti[1] === 'S' && thirdLetter === 'F') personaKey = 'ESFJ-ISFJ';
      else if (mbti[1] === 'N' && thirdLetter === 'T') personaKey = 'INTP-ENTP';
      else personaKey = 'ESTP-ESFP';

      setStylePersona(STYLE_PERSONAS[personaKey]);
      setStep('avatar');
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setIsGenerating(true);

      // Simulate AI avatar generation
      setTimeout(() => {
        // In production, call Fal.ai here
        setAvatarImage(imageData);
        setIsGenerating(false);
        setStep('complete');
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    setStep('complete');
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(MOOD_KEY, dailyMood);
    localStorage.setItem('vibevogue_style_persona', stylePersona?.name || '时尚达人');
    localStorage.setItem('vibevogue_mbti', mbtiResult || '');

    const data: UserWelcomeData = {
      mbti: mbtiResult,
      stylePersona: stylePersona?.name || '时尚达人',
      avatarImage: avatarImage || undefined,
      mood: dailyMood,
    };
    onComplete(data);
  };

  const handleMoodChange = (value: string) => {
    setDailyMood(value);
    localStorage.setItem(MOOD_KEY, value);
  };

  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="welcome-modal__header">
          <div className="welcome-modal__logo">
            <span>VV</span>
          </div>
          <h1 className="welcome-modal__title">欢迎来到 VibeVogue</h1>
          <p className="welcome-modal__subtitle">探索您的专属时尚风格</p>
        </div>

        <div className="welcome-modal__content">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="welcome-modal__intro">
              <div className="welcome-modal__intro-illustration">
                <svg viewBox="0 0 200 200" width="160" height="160">
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#B8960C" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="url(#goldGradient)" strokeWidth="1" />
                  <path d="M100 20 Q 140 60 100 100 Q 60 140 100 180 Q 140 140 100 100 Q 60 60 100 20" fill="url(#goldGradient)" opacity="0.3" />
                </svg>
              </div>
              <p className="welcome-modal__intro-text">
                通过简短的性格测试，我们将为您生成专属的时尚人格标签，并创建您的虚拟形象。
              </p>
              <button className="welcome-modal__btn welcome-modal__btn--primary" onClick={() => setStep('mbti')}>
                开始探索
              </button>
            </div>
          )}

          {/* MBTI Step */}
          {step === 'mbti' && (
            <div className="welcome-modal__mbti">
              <div className="welcome-modal__progress">
                <div
                  className="welcome-modal__progress-bar"
                  style={{ width: `${((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="welcome-modal__progress-text">
                {currentQuestion + 1} / {MBTI_QUESTIONS.length}
              </span>

              <h2 className="welcome-modal__question">{MBTI_QUESTIONS[currentQuestion].question}</h2>

              <div className="welcome-modal__options">
                {MBTI_QUESTIONS[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    className="welcome-modal__option"
                    onClick={() => handleMbtiAnswer(option.value)}
                  >
                    <span className="welcome-modal__option-icon">{option.icon}</span>
                    <span className="welcome-modal__option-label">{option.label}</span>
                  </button>
                ))}
              </div>

              <button className="welcome-modal__skip" onClick={handleSkip}>
                跳过测试，使用默认风格
              </button>
            </div>
          )}

          {/* Avatar Step */}
          {step === 'avatar' && (
            <div className="welcome-modal__avatar">
              <div className="welcome-modal__mbti-result">
                <span className="welcome-modal__mbti-badge">{mbtiResult}</span>
                <span className="welcome-modal__persona-name">{stylePersona?.name}</span>
                <p className="welcome-modal__persona-desc">{stylePersona?.description}</p>
              </div>

              <div className="welcome-modal__avatar-upload">
                {isGenerating ? (
                  <div className="welcome-modal__generating">
                    <div className="welcome-modal__spinner" />
                    <span>正在生成您的专属形象...</span>
                  </div>
                ) : avatarImage ? (
                  <div className="welcome-modal__avatar-preview">
                    <img src={avatarImage} alt="Your avatar" />
                    <button className="welcome-modal__avatar-change" onClick={() => avatarInputRef.current?.click()}>
                      重新上传
                    </button>
                  </div>
                ) : (
                  <button className="welcome-modal__avatar-btn" onClick={() => avatarInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>上传正脸照片</span>
                    <span className="welcome-modal__avatar-hint">我们将为您生成穆夏风格形象</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarSelect}
                  accept="image/*"
                  className="hidden-input"
                />
              </div>

              <div className="welcome-modal__mood">
                <label className="welcome-modal__mood-label">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                  今日心情
                </label>
                <input
                  type="text"
                  className="welcome-modal__mood-input"
                  placeholder="记录今天的心情..."
                  value={dailyMood}
                  onChange={(e) => handleMoodChange(e.target.value)}
                />
              </div>

              <button className="welcome-modal__btn welcome-modal__btn--primary" onClick={handleComplete}>
                {avatarImage ? '完成设置' : '稍后创建形象'}
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="welcome-modal__complete">
              <div className="welcome-modal__complete-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="welcome-modal__complete-title">设置完成</h2>
              <p className="welcome-modal__complete-text">
                您的时尚人格标签为：
              </p>
              <div className="welcome-modal__complete-persona">
                <span className="welcome-modal__complete-badge">{mbtiResult || '时尚达人'}</span>
                <span className="welcome-modal__complete-persona-name">{stylePersona?.name || '时尚达人'}</span>
              </div>
              <button className="welcome-modal__btn welcome-modal__btn--primary" onClick={handleComplete}>
                开始使用
              </button>
            </div>
          )}
        </div>

        <div className="welcome-modal__decoration">
          <svg viewBox="0 0 400 100" preserveAspectRatio="none">
            <path
              d="M0 50 Q 100 20 200 50 Q 300 80 400 50"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="2"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function getDailyMood(): string {
  return localStorage.getItem(MOOD_KEY) || '';
}

export function getStylePersona(): string {
  return localStorage.getItem('vibevogue_style_persona') || '时尚达人';
}

export function getMbtiType(): string {
  return localStorage.getItem('vibevogue_mbti') || '';
}

export function isWelcomeCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}
