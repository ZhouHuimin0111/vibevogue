/**
 * AI Style Assistant Component
 * Chat interface for fashion recommendations
 */

import { useState, useRef, useEffect } from 'react';
import type { WardrobeItem } from '../types';
import { getStylePersona } from './UserProfile';
import './AIStyleAssistant.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIStyleAssistantProps {
  wardrobeItems: WardrobeItem[];
  weather: string;
}

const MOOD_KEY = 'vibevogue_daily_mood';

export function AIStyleAssistant({ wardrobeItems, weather }: AIStyleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是您的专属时尚助手。请告诉我您今天想要什么风格的穿搭，或者有什么时尚问题想咨询？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContextPrompt = (): string => {
    const stylePersona = getStylePersona();
    const mood = localStorage.getItem(MOOD_KEY) || '';

    const wardrobeSummary = wardrobeItems.map(item =>
      `${item.name}(${item.category})-${item.mainColor}-${item.styleTags.join(',')}`
    ).join('; ');

    return `
当前用户信息:
- 时尚人格: ${stylePersona || '时尚达人'}
- 今日心情: ${mood || '未记录'}
- 天气状况: ${weather}
- 衣柜单品: ${wardrobeSummary || '暂无'}
    `.trim();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, call OpenAI API)
    setTimeout(() => {
      buildContextPrompt();
      const response = generateSimulatedResponse(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateSimulatedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('推荐') || input.includes('建议')) {
      return '根据您的时尚人格和今天的天气，我建议您尝试以下穿搭方案：\n\n1. **都市通勤风**：真丝衬衫搭配高腰阔腿裤，干练利落\n2. **浪漫约会风**：蕾丝连衣裙配针织开衫，优雅温柔\n3. **休闲出街风**：刺绣上衣配波点半身裙，活泼可爱\n\n您想让我生成其中哪套的试穿图吗？';
    }

    if (input.includes('颜色') || input.includes('配色')) {
      return '根据您今天的的心情记录，我为您推荐以下配色方案：\n\n- **主色调**：暖米色系，营造温柔氛围\n- **点缀色**：复古金色，低调奢华\n- **搭配技巧**：同色系深浅搭配，层次分明\n\n需要我为您具体搭配一套吗？';
    }

    if (input.includes('场合') || input.includes('穿什么')) {
      if (input.includes('工作') || input.includes('上班')) {
        return '职场穿搭建议：\n\n- 上装：真丝衬衫或简约针织衫\n- 下装：高腰阔腿裤或及膝铅笔裙\n- 配色：黑白灰为主，局部金色点缀\n- 配饰：简约手表、小型手提包\n\n整体风格应注重专业与得体。';
      }
      if (input.includes('约会')) {
        return '约会穿搭建议：\n\n- 上装：露肩针织衫或蕾丝上衣\n- 下装：及踝半身裙\n- 配色：柔粉色系或酒红色系\n- 配饰：精致项链、小巧耳饰\n\n营造温柔浪漫又不失女人味的氛围。';
      }
      return '请告诉我具体的场合（如：职场、约会、休闲聚会等），我可以为您推荐更精准的穿搭方案。';
    }

    if (input.includes('流行') || input.includes('趋势')) {
      return '本季流行趋势：\n\n- **色彩**：静谧蓝、奶油白、焦糖色持续流行\n- **元素**：蝴蝶结、荷叶边等女性化细节\n- **材质**：缎面、蕾丝等光泽感面料\n- **廓形**：泡泡袖、收腰设计\n\n我可以帮您从衣柜中挑选符合趋势的单品哦！';
    }

    return `感谢您的提问！作为您的专属时尚助手，我可以帮您：\n\n1. 根据场合和心情推荐穿搭\n2. 分析您的衣柜并给出搭配建议\n3. 解答配色、风格等时尚问题\n4. 生成个性化试穿效果图\n\n请告诉我您今天的需求吧~`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant__header">
        <div className="ai-assistant__avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="ai-assistant__info">
          <span className="ai-assistant__title">时尚助手</span>
          <span className="ai-assistant__status">在线</span>
        </div>
      </div>

      <div className="ai-assistant__messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-assistant__message ai-assistant__message--${message.role}`}
          >
            {message.role === 'assistant' && (
              <div className="ai-assistant__message-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}
            <div className="ai-assistant__message-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-assistant__message ai-assistant__message--assistant">
            <div className="ai-assistant__message-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="ai-assistant__message-content">
              <div className="ai-assistant__typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-assistant__input">
        <textarea
          className="ai-assistant__textarea"
          placeholder="输入您的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="ai-assistant__send"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
