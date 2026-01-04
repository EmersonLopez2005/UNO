
import React, { useState } from 'react';
import { GeneratedAsset, PosterRequest, MerchRequest, ArtPosterRequest } from '../types';

interface PosterDisplayProps {
  poster: GeneratedAsset | null;
  lang: 'en' | 'zh';
}

const TRANSLATIONS = {
  en: {
    waiting: "WAITING FOR INPUT",
    configure: "Configure assets and styles to generate the pitch proposal.",
    badge: "UNO CGI ENGINE v3",
    export: "EXPORT HIGH-RESOLUTION PROPOSAL",
    params: "Proposal Parameters",
    leadCar: "Subject / Car",
    itemType: "Design Style",
    promptSummary: "AI GENERATION LOGIC",
    styleTransfer: "Style Transfer",
    copy: "COPY",
    copied: "COPIED!"
  },
  zh: {
    waiting: "等待输入",
    configure: "配置资产与风格以生成视觉提案。",
    badge: "UNO CGI 引擎 v3",
    export: "导出高分辨率视觉提案",
    params: "提案参数",
    leadCar: "设计主体 / 赛车",
    itemType: "设计风格",
    promptSummary: "AI 生成逻辑总结",
    styleTransfer: "风格复制",
    copy: "复制",
    copied: "已复制!"
  }
};

const PosterDisplay: React.FC<PosterDisplayProps> = ({ poster, lang }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  if (!poster) {
    return (
      <div className="h-full min-h-[600px] border-2 border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-zinc-700 p-12 text-center group">
        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:border-uno-pink/20 transition-all group-hover:shadow-neon">
          <svg className="w-10 h-10 text-zinc-800 group-hover:text-uno-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="racing-font text-2xl tracking-widest mb-3 text-zinc-600">{t.waiting}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-xs opacity-40">{t.configure}</p>
      </div>
    );
  }

  const isPoster = poster.type === 'POSTER';
  const isStyleTransfer = poster.type === 'STYLE_TRANSFER';
  const request = poster.request;

  const cssAspectRatio = request.aspectRatio.replace(':', ' / ');

  const handleCopyPrompt = () => {
    if (poster.prompt) {
      navigator.clipboard.writeText(poster.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
      <div 
        className="relative group overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black flex justify-center items-center max-h-[75vh] max-w-full mx-auto"
        style={{ aspectRatio: cssAspectRatio }}
      >
        <img
          src={poster.imageUrl}
          alt="Generated Racing Asset"
          className="w-full h-full object-contain transition-transform duration-[2000ms] group-hover:scale-[1.05]"
        />
        
        <div className="absolute top-6 left-6 flex gap-2">
          <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 bg-uno-pink rounded-full animate-pulse shadow-neon"></span>
            {t.badge}
          </div>
          <div className="bg-uno-pink px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white shadow-neon">
            {request.aspectRatio}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
           <a 
            href={poster.imageUrl} 
            download={`uno-asset-${poster.id}.png`}
            className="w-full bg-white text-black font-black py-5 rounded-xl text-center text-sm uppercase racing-font tracking-[0.3em] hover:bg-uno-pink hover:text-white transition-all shadow-2xl transform translate-y-4 group-hover:translate-y-0 duration-500"
           >
            {t.export}
           </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm h-full">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-black text-uno-pink uppercase tracking-[0.3em]">{t.params}</h4>
             <span className="text-[10px] font-black text-zinc-600 uppercase tabular-nums">ID: {poster.id}</span>
          </div>
          <div className="space-y-3">
             <div className="space-y-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{t.leadCar}</span>
                <p className="text-xs font-bold text-white uppercase italic truncate">
                  {isPoster ? (request as PosterRequest).carModel1 : isMerch(request) ? (request as MerchRequest).itemType : 'Visual Asset'}
                </p>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{t.itemType}</span>
                <p className="text-xs font-bold text-zinc-300 uppercase">
                  {isPoster ? (request as PosterRequest).posterStyle : isStyleTransfer ? t.styleTransfer : (request as ArtPosterRequest).style}
                </p>
             </div>
          </div>
        </div>

        {poster.prompt && (
          <div className="bg-black/60 p-6 rounded-2xl border border-white/5 border-l-uno-pink border-l-2 flex flex-col relative h-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">{t.promptSummary}</h4>
              <button 
                onClick={handleCopyPrompt}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black transition-all border ${
                  copied ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {copied ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  )}
                </svg>
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic whitespace-pre-wrap">
                {poster.prompt}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for type narrowing
function isMerch(req: any): req is MerchRequest {
  return (req as MerchRequest).itemType !== undefined;
}

export default PosterDisplay;
