
import React, { useState, useCallback, useEffect } from 'react';
import PosterForm from './components/PosterForm';
import ArtPosterForm from './components/ArtPosterForm';
import StyleTransferForm from './components/StyleTransferForm';
import MerchForm from './components/MerchForm';
import CarDesignForm from './components/CarDesignForm';
import PosterDisplay from './components/PosterDisplay';
import { geminiService } from './services/geminiService';
import { GeneratedAsset, PosterRequest, MerchRequest, ArtPosterRequest, AppView } from './types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const TRANSLATIONS = {
  en: {
    title: "PITCH",
    subtitle: "Creative Engine",
    heroTitle: "ENGINEERING",
    heroHighlight: "DOMINANCE.",
    heroDesc: "The Uno CGI framework allows you to bridge the gap between concept and reality. Choose your division to begin.",
    divisionScene: "Scene Rendering",
    divisionCarDesign: "Racing Design",
    divisionArtPoster: "Poster Design",
    divisionMerch: "Merchandise Design",
    divisionStyleTransfer: "Style Transfer",
    divisionSceneDesc: "Multi-Car Track Visuals",
    divisionCarDesignDesc: "Single Car Livery Focus",
    divisionArtPosterDesc: "Artistic Event Graphics",
    divisionMerchDesc: "Branded Gear",
    divisionStyleTransferDesc: "Artistic DNA Replication",
    back: "RETURN TO HQ",
    synthesizing: "SYNTESIZING",
    cgi: "ASSET",
    errorDetail: "The render engine encountered a critical error.",
    keyRequired: "Paid API Key Required",
    selectKey: "SELECT API KEY",
    confidential: "UNO CLASSIFIED ASSET",
  },
  zh: {
    title: "视觉提案",
    subtitle: "创意引擎",
    heroTitle: "掌控",
    heroHighlight: "赛场全局",
    heroDesc: "Uno CGI 框架旨在打破创意与现实的边界。请选择您想要设计的部门开始。",
    divisionScene: "场景渲染",
    divisionCarDesign: "赛车设计",
    divisionArtPoster: "海报设计",
    divisionMerch: "周边设计",
    divisionStyleTransfer: "风格复制",
    divisionSceneDesc: "多车赛道构图渲染",
    divisionCarDesignDesc: "单车型涂装设计",
    divisionArtPosterDesc: "艺术化赛事海报",
    divisionMerchDesc: "品牌周边配件",
    divisionStyleTransferDesc: "艺术 DNA 克隆",
    back: "返回主中心",
    synthesizing: "正在合成",
    cgi: "视觉资产",
    errorDetail: "渲染引擎遇到严重错误。",
    keyRequired: "需要付费 API 密钥",
    selectKey: "选择 API 密钥",
    confidential: "UNO 内部机密资产",
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = TRANSLATIONS[lang];

  const [view, setView] = useState<AppView>('LANDING');
  const [currentAsset, setCurrentAsset] = useState<GeneratedAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGeneratePoster = useCallback(async (request: PosterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await geminiService.generatePoster(request);
      if (res) {
        setCurrentAsset({
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: res.url,
          prompt: res.prompt,
          timestamp: Date.now(),
          type: 'POSTER',
          request
        });
      }
    } catch (err) {
      setError(t.errorDetail);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleGenerateArtPoster = useCallback(async (request: ArtPosterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await geminiService.generateArtPoster(request);
      if (res) {
        setCurrentAsset({
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: res.url,
          prompt: res.prompt,
          timestamp: Date.now(),
          type: request.style === 'STYLE_TRANSFER' ? 'STYLE_TRANSFER' : 'ART_POSTER',
          request
        });
      }
    } catch (err) {
      setError(t.errorDetail);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleGenerateMerch = useCallback(async (request: MerchRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await geminiService.generateMerch(request);
      if (res) {
        setCurrentAsset({
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: res.url,
          prompt: res.prompt,
          timestamp: Date.now(),
          type: 'MERCH',
          request
        });
      }
    } catch (err) {
      setError(t.errorDetail);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const renderContent = () => {
    if (view === 'LANDING') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {[
            { id: 'CAR_DESIGN', title: t.divisionCarDesign, desc: t.divisionCarDesignDesc },
            { id: 'RACING', title: t.divisionScene, desc: t.divisionSceneDesc },
            { id: 'POSTER_DESIGN', title: t.divisionArtPoster, desc: t.divisionArtPosterDesc },
            { id: 'STYLE_TRANSFER', title: t.divisionStyleTransfer, desc: t.divisionStyleTransferDesc },
            { id: 'MERCH', title: t.divisionMerch, desc: t.divisionMerchDesc }
          ].map(div => (
            <button 
              key={div.id}
              onClick={() => setView(div.id as any)}
              className="group relative h-48 bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-uno-pink/40 transition-all text-left flex flex-col justify-end p-8 hover:bg-zinc-900/50"
            >
              <div className="space-y-1">
                <span className="text-uno-pink text-[9px] font-black uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100 transition-opacity">
                  {div.desc}
                </span>
                <h3 className="racing-font text-2xl font-black italic text-white group-hover:pink-glow transition-all">
                  {div.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <button 
            onClick={() => { setView('LANDING'); setCurrentAsset(null); }}
            className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-uno-pink transition-colors uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.back}
          </button>
          {view === 'CAR_DESIGN' && <CarDesignForm onSubmit={handleGeneratePoster} isLoading={isLoading} lang={lang} />}
          {view === 'RACING' && <PosterForm onSubmit={handleGeneratePoster} isLoading={isLoading} lang={lang} />}
          {view === 'POSTER_DESIGN' && <ArtPosterForm onSubmit={handleGenerateArtPoster} isLoading={isLoading} lang={lang} />}
          {view === 'STYLE_TRANSFER' && <StyleTransferForm onSubmit={handleGenerateArtPoster} isLoading={isLoading} lang={lang} />}
          {view === 'MERCH' && <MerchForm onSubmit={handleGenerateMerch} isLoading={isLoading} lang={lang} />}
        </div>

        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="h-full min-h-[600px] bg-zinc-900/10 rounded-3xl flex flex-col items-center justify-center p-12 border border-white/5">
              <div className="w-20 h-20 border-2 border-uno-pink border-t-transparent rounded-full animate-spin shadow-neon"></div>
              <div className="mt-10 text-center">
                <h3 className="racing-font text-3xl font-black text-white italic">{t.synthesizing} <span className="text-uno-pink">{t.cgi}</span></h3>
              </div>
            </div>
          ) : error ? (
            <div className="h-full min-h-[600px] border border-red-900/30 bg-red-950/5 rounded-3xl flex flex-col items-center justify-center text-red-500 p-12 text-center">
              <p className="racing-font text-2xl font-bold italic truncate w-full">{error}</p>
              <button onClick={() => setError(null)} className="mt-8 px-10 py-3 bg-red-500 text-white racing-font font-bold rounded-lg uppercase text-[10px]">REBOOT MODULE</button>
            </div>
          ) : (
            <PosterDisplay poster={currentAsset as any} lang={lang} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-bg selection:bg-uno-pink selection:text-white pb-12">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white racing-font text-4xl italic pink-glow cursor-pointer" onClick={() => setView('LANDING')}>Uno</span>
            <div className="h-8 w-px bg-zinc-800 mx-2"></div>
            <div>
              <h1 className="text-lg font-black leading-none text-white italic">{t.title}</h1>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-black text-uno-pink shadow-neon">
              {lang === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <h2 className="racing-font text-6xl font-black italic mb-2 leading-none tracking-tighter">
            {t.heroTitle} <span className="text-uno-pink">{t.heroHighlight}</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-2xl font-medium opacity-80">{t.heroDesc}</p>
        </div>

        {!hasApiKey ? (
          <div className="max-w-xl mx-auto mt-20 p-12 bg-zinc-900/50 border border-white/5 rounded-3xl text-center space-y-6">
            <h2 className="racing-font text-3xl font-black italic text-white">{t.keyRequired}</h2>
            <button onClick={handleOpenSelectKey} className="w-full py-4 bg-uno-pink text-white font-black rounded-xl shadow-neon-strong">{t.selectKey}</button>
          </div>
        ) : renderContent()}
      </main>

      <footer className="mt-16 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em]">
           <span>© 2025 UNO RACING DIVISION</span>
           <span>{t.confidential}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
