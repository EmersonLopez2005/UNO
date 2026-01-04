
import React, { useState, useRef } from 'react';
import { PosterRequest, AspectRatio, GenerationFormat } from '../types';

interface CarDesignFormProps {
  onSubmit: (request: PosterRequest) => void;
  isLoading: boolean;
  lang: 'en' | 'zh';
}

const GT3_MODELS = [
  "Audi R8 LMS GT3 EVO II",
  "Mercedes-AMG GT3 EVO",
  "Porsche 911 GT3 R (992)",
  "BMW M4 GT3",
  "Ferrari 296 GT3",
  "Lamborghini Huracán GT3 EVO2",
  "Aston Martin Vantage AMR GT3 Evo",
  "McLaren 720S GT3 Evo",
  "Chevrolet Corvette Z06 GT3.R",
  "Ford Mustang GT3",
  "Lexus RC F GT3",
  "Honda NSX GT3 Evo22",
  "Nissan GT-R NISMO GT3",
  "Bentley Continental GT3"
];

const TRANSLATIONS = {
  en: {
    leadCar: "Model Selection",
    selectModel: "Please select a model",
    liveryLabel: "Livery Style Notes",
    liveryPlaceholder: "e.g. Matte finish, chrome accents",
    perspectiveLabel: "Dynamic Perspective",
    p1: "High-angle diagonal diving right",
    p2: "Low-angle aggressive front",
    p3: "Side profile panning blur",
    p4: "Rear quarter chase cam",
    p5: "Top-down hairpin entry",
    ratioLabel: "Aspect Ratio",
    formatLabel: "Generation Format",
    format3D: "3D Effect Rendering",
    format3View: "2D Design Layout",
    submit: "GENERATE RACING DESIGN",
    loading: "DESIGNING...",
    uploadSponsor: "Sponsor Logo",
    uploadTeam: "Team Logo",
    uploadPattern: "Pattern Reference",
    uploadModel: "Car Reference Image",
    logoDesc: "Upload brand assets and design patterns to be mapped onto the car",
    clear: "Clear"
  },
  zh: {
    leadCar: "车型选择",
    selectModel: "请选择车型",
    liveryLabel: "涂装风格描述",
    liveryPlaceholder: "例如：哑光质感，电镀点缀",
    perspectiveLabel: "动态视角",
    p1: "高角度对角线俯冲",
    p2: "低角度侵略性车头",
    p3: "侧面横拉模糊",
    p4: "后方侧向跟车",
    p5: "俯视发卡弯入弯",
    ratioLabel: "画面比例",
    formatLabel: "生成格式",
    format3D: "3D 效果图",
    format3View: "平面设计图",
    submit: "生成赛车设计",
    loading: "正在设计中...",
    uploadSponsor: "赞助商 Logo",
    uploadTeam: "车队 Logo",
    uploadPattern: "图案参考",
    uploadModel: "车辆参考图",
    logoDesc: "上传 Logo 和图案参考，AI 将自动完成涂装合成",
    clear: "清除"
  }
};

const CarDesignForm: React.FC<CarDesignFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = TRANSLATIONS[lang];
  const [carModel1, setCarModel1] = useState('');
  const [livery, setLivery] = useState(lang === 'zh' ? '高性能赛车涂装' : 'High performance racing livery');
  const [perspective, setPerspective] = useState(t.p1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [generationFormat, setGenerationFormat] = useState<GenerationFormat>('3D_EFFECT');
  
  const [sponsorLogo, setSponsorLogo] = useState<string | undefined>(undefined);
  const [teamLogo, setTeamLogo] = useState<string | undefined>(undefined);
  const [customPattern, setCustomPattern] = useState<string | undefined>(undefined);
  const [carReferenceImage, setCarReferenceImage] = useState<string | undefined>(undefined);

  const sponsorInputRef = useRef<HTMLInputElement>(null);
  const teamInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'sponsor' | 'team' | 'pattern' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'sponsor') setSponsorLogo(base64String);
        else if (type === 'team') setTeamLogo(base64String);
        else if (type === 'pattern') setCustomPattern(base64String);
        else setCarReferenceImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const UploadBox = ({ label, value, inputRef, type, full }: any) => (
    <div className={`space-y-2 ${full ? 'col-span-1 md:col-span-3' : 'flex-1'}`}>
      <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`group relative ${full ? 'h-32' : 'h-20'} bg-black/40 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden ${value ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/30'}`}
      >
        {value ? <img src={value} alt={label} className="w-full h-full object-contain p-2" /> : <div className="text-xl text-zinc-800">+</div>}
        <input type="file" ref={inputRef} onChange={(e) => handleFileChange(e, type)} className="hidden" accept="image/*" />
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        carModel1,
        livery,
        perspective,
        aspectRatio,
        posterStyle: 'LAUNCH', 
        generationFormat,
        sponsorLogo,
        teamLogo,
        customPattern,
        carReferenceImage
      });
    }} className="space-y-6 bg-zinc-900/30 p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
      <div className="relative">
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-2">{t.leadCar}</label>
        <select
          value={carModel1}
          onChange={(e) => setCarModel1(e.target.value)}
          className={`w-full bg-black/60 border border-zinc-800 rounded-lg px-4 py-3 focus:border-uno-pink outline-none transition-all text-sm appearance-none cursor-pointer ${!carModel1 ? 'text-zinc-500' : 'text-white'}`}
          required
        >
          <option value="" disabled className="bg-zinc-900">{t.selectModel}</option>
          {GT3_MODELS.map(model => (
            <option key={model} value={model} className="bg-zinc-900 text-white">{model}</option>
          ))}
        </select>
      </div>

      <UploadBox label={t.uploadModel} value={carReferenceImage} inputRef={modelInputRef} type="model" full />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
        <UploadBox label={t.uploadPattern} value={customPattern} inputRef={patternInputRef} type="pattern" />
        <UploadBox label={t.uploadSponsor} value={sponsorLogo} inputRef={sponsorInputRef} type="sponsor" />
        <UploadBox label={t.uploadTeam} value={teamLogo} inputRef={teamInputRef} type="team" />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{t.formatLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGenerationFormat('3D_EFFECT')}
            className={`py-3 text-[10px] rounded border transition-all uppercase font-black ${
              generationFormat === '3D_EFFECT' ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
            }`}
          >
            {t.format3D}
          </button>
          <button
            type="button"
            onClick={() => setGenerationFormat('THREE_VIEW')}
            className={`py-3 text-[10px] rounded border transition-all uppercase font-black ${
              generationFormat === 'THREE_VIEW' ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
            }`}
          >
            {t.format3View}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-2">{t.ratioLabel}</label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {Object.values(AspectRatio).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`py-2 text-[10px] rounded border transition-all ${
                aspectRatio === ratio ? 'bg-uno-pink border-uno-pink text-white font-black shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !carModel1}
        className="w-full py-5 bg-uno-pink text-white racing-font text-2xl font-black rounded-xl shadow-neon-strong hover:scale-[1.02] transition-all tracking-tighter disabled:opacity-50"
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </form>
  );
};

export default CarDesignForm;
