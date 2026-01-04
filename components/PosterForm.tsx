import React, { useState, useRef } from 'react';
import { PosterRequest, AspectRatio, PosterStyle } from '../types';

interface PosterFormProps {
  onSubmit: (request: PosterRequest) => void;
  isLoading: boolean;
  lang: 'en' | 'zh';
}

const TRANSLATIONS = {
  en: {
    liveryLabel: "Livery Style Notes",
    liveryPlaceholder: "e.g. Matte finish, chrome accents",
    perspectiveLabel: "Dynamic Perspective",
    p1: "High-angle diagonal diving right",
    p2: "Low-angle aggressive front",
    p3: "Side profile panning blur",
    p4: "Rear quarter chase cam",
    p5: "Top-down hairpin entry",
    ratioLabel: "Aspect Ratio",
    styleLabel: "Scenario",
    styleRace: "Track",
    styleLaunch: "Studio",
    styleGarage: "Garage",
    stylePaddock: "Paddock",
    submit: "RENDER PITCH PROPOSAL",
    loading: "INITIATING RENDER...",
    uploadModel1: "Main Car Reference",
    uploadModel2: "Supporting Car Reference",
    uploadSponsor: "Sponsor Logo",
    uploadTeam: "Team Logo",
    uploadPattern: "Pattern Reference",
    logoDesc: "Upload car references. If two are uploaded, the second becomes the supporting car.",
    paddockDesc: "In Paddock mode, walls match your Pattern Reference or Car livery colors.",
    clear: "Clear"
  },
  zh: {
    liveryLabel: "涂装风格描述",
    liveryPlaceholder: "例如：哑光质感，电镀点缀",
    perspectiveLabel: "动态视角",
    p1: "高角度对角线俯冲",
    p2: "低角度侵略性车头",
    p3: "侧面横拉模糊",
    p4: "后方侧向跟车",
    p5: "俯视发卡弯入弯",
    ratioLabel: "画面比例",
    styleLabel: "场景",
    styleRace: "赛道",
    styleLaunch: "工作室",
    styleGarage: "车库",
    stylePaddock: "围场",
    submit: "生成视觉提案",
    loading: "正在开始渲染...",
    uploadModel1: "主角车参考图",
    uploadModel2: "配角车参考图",
    uploadSponsor: "赞助商 Logo",
    uploadTeam: "车队 Logo",
    uploadPattern: "图案参考",
    logoDesc: "上传车辆参考图。若上传两张，第二张将作为配角车呈现。",
    paddockDesc: "围场模式下，围板图案将优先参考上传的“图案参考”，否则参考车身色系。",
    clear: "清除"
  }
};

const PosterForm: React.FC<PosterFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = TRANSLATIONS[lang];
  const [carModel1] = useState('GT3 Racing Car');
  const [carModel2] = useState('');
  
  const [livery] = useState(lang === 'zh' ? '高性能赛车涂装' : 'High performance racing livery');
  const [perspective] = useState(t.p1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [posterStyle, setPosterStyle] = useState<PosterStyle>('RACE');
  
  const [carReferenceImage, setCarReferenceImage] = useState<string | undefined>(undefined);
  const [carReferenceImage2, setCarReferenceImage2] = useState<string | undefined>(undefined);
  const [sponsorLogo, setSponsorLogo] = useState<string | undefined>(undefined);
  const [teamLogo, setTeamLogo] = useState<string | undefined>(undefined);
  const [customPattern, setCustomPattern] = useState<string | undefined>(undefined);
  
  const modelInputRef1 = useRef<HTMLInputElement>(null);
  const modelInputRef2 = useRef<HTMLInputElement>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);
  const teamInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ref1' | 'ref2' | 'sponsor' | 'team' | 'pattern') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'ref1') setCarReferenceImage(result);
        else if (type === 'ref2') setCarReferenceImage2(result);
        else if (type === 'sponsor') setSponsorLogo(result);
        else if (type === 'team') setTeamLogo(result);
        else if (type === 'pattern') setCustomPattern(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carReferenceImage) return;

    onSubmit({
      carModel1,
      carModel2: carModel2 || undefined,
      livery,
      perspective,
      aspectRatio,
      posterStyle,
      carReferenceImage,
      carReferenceImage2,
      sponsorLogo,
      teamLogo,
      customPattern
    });
  };

  const UploadBox = ({ label, value, inputRef, setter, type, height = "h-40" }: { label: string, value?: string, inputRef: React.RefObject<HTMLInputElement>, setter: (v: string | undefined) => void, type: any, height?: string }) => (
    <div className="space-y-2 flex-1">
      <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`group relative ${height} bg-black/40 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden ${value ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/30'}`}
      >
        {value ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button type="button" onClick={(e) => { e.stopPropagation(); setter(undefined); }} className="text-[10px] font-bold text-white uppercase">{t.clear}</button>
          </div>
        ) : null}
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-6 h-6 text-zinc-700 group-hover:text-uno-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-[8px] font-black text-zinc-600 uppercase">{label}</span>
          </div>
        )}
        <input type="file" ref={inputRef} onChange={(e) => handleFileChange(e, type)} className="hidden" accept="image/*" />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/30 p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4">
        <UploadBox label={t.uploadModel1} value={carReferenceImage} inputRef={modelInputRef1} setter={setCarReferenceImage} type="ref1" />
        <UploadBox label={t.uploadModel2} value={carReferenceImage2} inputRef={modelInputRef2} setter={setCarReferenceImage2} type="ref2" />
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
        <UploadBox label={t.uploadPattern} value={customPattern} inputRef={patternInputRef} setter={setCustomPattern} type="pattern" height="h-20" />
        <UploadBox label={t.uploadSponsor} value={sponsorLogo} inputRef={sponsorInputRef} setter={setSponsorLogo} type="sponsor" height="h-20" />
        <UploadBox label={t.uploadTeam} value={teamLogo} inputRef={teamInputRef} setter={setTeamLogo} type="team" height="h-20" />
      </div>

      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest text-center">{t.logoDesc}</p>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-2">{t.styleLabel}</label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setPosterStyle('RACE')}
              className={`py-3 text-[9px] rounded border transition-all flex items-center justify-center gap-2 uppercase font-black ${
                posterStyle === 'RACE' ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {t.styleRace}
            </button>
            <button
              type="button"
              onClick={() => setPosterStyle('PADDOCK')}
              className={`py-3 text-[9px] rounded border transition-all flex items-center justify-center gap-2 uppercase font-black ${
                posterStyle === 'PADDOCK' ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {t.stylePaddock}
            </button>
            <button
              type="button"
              onClick={() => setPosterStyle('GARAGE')}
              className={`py-3 text-[9px] rounded border transition-all flex items-center justify-center gap-2 uppercase font-black ${
                posterStyle === 'GARAGE' ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {t.styleGarage}
            </button>
            <button
              type="button"
              onClick={() => setPosterStyle('LAUNCH')}
              className={`py-3 text-[9px] rounded border transition-all flex items-center justify-center gap-2 uppercase font-black ${
                posterStyle === 'LAUNCH' ? 'bg-white border-white text-black shadow-lg' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {t.styleLaunch}
            </button>
          </div>
        </div>
      </div>

      {posterStyle === 'PADDOCK' && (
        <p className="text-[8px] text-uno-pink font-bold uppercase tracking-widest text-center animate-pulse">{t.paddockDesc}</p>
      )}
      
      <div className="grid grid-cols-1">
        <div>
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-2">{t.ratioLabel}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(AspectRatio).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`py-3 text-xs rounded border transition-all ${
                  aspectRatio === ratio ? 'bg-uno-pink border-uno-pink text-white font-black shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !carReferenceImage}
        className={`w-full py-5 bg-uno-pink text-white racing-font text-2xl font-black rounded-xl shadow-neon-strong hover:scale-[1.02] transition-all flex items-center justify-center gap-3 tracking-tighter ${isLoading || !carReferenceImage ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </form>
  );
};

export default PosterForm;