import React, { useState, useRef } from 'react';
import { ArtPosterRequest, AspectRatio } from '../types';
import { geminiService } from '../services/geminiService';

interface StyleTransferFormProps {
  onSubmit: (request: ArtPosterRequest) => void;
  isLoading: boolean;
  lang: 'en' | 'zh';
}

const TRANSLATIONS = {
  en: {
    title: "Style DNA Replication",
    uploadStyle: "1. Reference Poster (Style DNA)",
    uploadCar: "2. Car Subject (Color DNA)",
    uploadEvent: "3. Branding / Logos (Optional)",
    ratio: "Aspect Ratio",
    analyzeBtn: "EXTRACT STYLE DNA (OPTIONAL)",
    analyzing: "ANALYZING STYLE...",
    dnaPromptLabel: "Extracted Style DNA (Editable)",
    userSupplementLabel: "Content Supplement (Design Notes)",
    userSupplementPlaceholder: "e.g. Add heavy rain, night city lights, dynamic motion blur...",
    submit: "CLONE ARTISTIC STYLE",
    loading: "REPLICATING DNA...",
    clear: "Clear",
    tip: "Manual DNA extraction is optional. If skipped, the AI will automatically clone the style from the reference image."
  },
  zh: {
    title: "海报风格复制",
    uploadStyle: "1. 参考海报风格 (DNA)",
    uploadCar: "2. 赛车主体 (色彩 DNA)",
    uploadEvent: "3. 品牌 / Logo (可选)",
    ratio: "画面比例",
    analyzeBtn: "提取风格 DNA (可选)",
    analyzing: "正在分析风格...",
    dnaPromptLabel: "提取到的风格描述 (可修改)",
    userSupplementLabel: "内容补充 (设计需求)",
    userSupplementPlaceholder: "例如：添加瓢泼大雨、深夜城市灯光、强烈的动态模糊...",
    submit: "复制艺术风格",
    loading: "正在克隆 DNA...",
    clear: "清除",
    tip: "提取风格描述为可选步骤。如果不提取，AI 将直接分析参考图风格并结合补充描述生成。"
  }
};

const StyleTransferForm: React.FC<StyleTransferFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = TRANSLATIONS[lang];
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  
  const [styleReferenceImage, setStyleReferenceImage] = useState<string | undefined>();
  const [carImage, setCarImage] = useState<string | undefined>();
  const [eventLogo, setEventLogo] = useState<string | undefined>();
  const [teamLogo, setTeamLogo] = useState<string | undefined>();
  const [dnaPrompt, setDnaPrompt] = useState<string>('');
  const [userSupplement, setUserSupplement] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const styleRef = useRef<HTMLInputElement>(null);
  const carRef = useRef<HTMLInputElement>(null);
  const eventRef = useRef<HTMLInputElement>(null);
  const teamRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, set: (s: string | undefined) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeDNA = async () => {
    if (!styleReferenceImage) return;
    setIsAnalyzing(true);
    try {
      const prompt = await geminiService.analyzeStyleDNA(styleReferenceImage, lang);
      setDnaPrompt(prompt);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const UploadBox = ({ label, value, inputRef, setter, height = "h-32" }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[9px] font-black text-uno-pink uppercase tracking-widest">{label}</label>
        {value && (
          <button type="button" onClick={() => setter(undefined)} className="text-[8px] text-zinc-600 hover:text-uno-pink font-black uppercase">{t.clear}</button>
        )}
      </div>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`${height} bg-black/40 border border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-all ${value ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/20'}`}
      >
        {value ? <img src={value} className="h-full w-full object-contain p-2" /> : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">+</span>
          </div>
        )}
        <input type="file" ref={inputRef} className="hidden" onChange={e => handleFileChange(e, setter)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 bg-zinc-900/30 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
      <div className="p-3 bg-uno-pink/10 border border-uno-pink/20 rounded-xl mb-2">
        <p className="text-[10px] text-uno-pink font-black uppercase leading-tight">{t.title}</p>
        <p className="text-[8px] text-zinc-400 mt-1 uppercase tracking-wider italic">{t.tip}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <UploadBox label={t.uploadStyle} value={styleReferenceImage} inputRef={styleRef} setter={setStyleReferenceImage} height="h-32" />
        
        <button
          onClick={handleAnalyzeDNA}
          disabled={!styleReferenceImage || isAnalyzing}
          className={`w-full py-3 bg-zinc-800 border border-white/5 text-white racing-font text-[10px] italic font-black rounded-lg transition-all hover:bg-zinc-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg`}
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : null}
          {isAnalyzing ? t.analyzing : t.analyzeBtn}
        </button>

        {dnaPrompt && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="block text-[9px] font-black text-uno-pink uppercase tracking-widest">{t.dnaPromptLabel}</label>
            <textarea
              value={dnaPrompt}
              onChange={(e) => setDnaPrompt(e.target.value)}
              className="w-full h-24 bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-medium leading-relaxed outline-none focus:border-uno-pink transition-all resize-none text-zinc-300 italic"
            />
          </div>
        )}

        <UploadBox label={t.uploadCar} value={carImage} inputRef={carRef} setter={setCarImage} height="h-32" />

        <div className="space-y-2">
          <label className="block text-[9px] font-black text-uno-pink uppercase tracking-widest">{t.userSupplementLabel}</label>
          <textarea
            value={userSupplement}
            onChange={(e) => setUserSupplement(e.target.value)}
            placeholder={t.userSupplementPlaceholder}
            className="w-full h-20 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-medium outline-none focus:border-uno-pink transition-all resize-none text-white placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <UploadBox label="Event Logo" value={eventLogo} inputRef={eventRef} setter={setEventLogo} height="h-20" />
        <UploadBox label="Team Logo" value={teamLogo} inputRef={teamRef} setter={setTeamLogo} height="h-20" />
      </div>

      <div>
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-2">{t.ratio}</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(AspectRatio).map(ratio => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`py-2 text-[10px] rounded border transition-all ${aspectRatio === ratio ? 'bg-white border-white text-black font-black' : 'bg-black/40 border-zinc-800 text-zinc-500'}`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit({ 
          style: 'STYLE_TRANSFER', 
          aspectRatio, 
          carImage, 
          styleReferenceImage, 
          eventLogo, 
          teamLogo, 
          styleCustomPrompt: dnaPrompt,
          userSupplement: userSupplement 
        })}
        disabled={isLoading || !styleReferenceImage || !carImage}
        className="w-full py-4 bg-uno-pink text-white racing-font text-xl font-black rounded-xl hover:scale-[1.02] transition-all shadow-neon-strong disabled:opacity-50"
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </div>
  );
};

export default StyleTransferForm;