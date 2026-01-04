import { ArtPosterStyle } from '../types';
import React, { useState, useRef } from 'react';
import { ArtPosterRequest, AspectRatio } from '../types';

interface ArtPosterFormProps {
  onSubmit: (request: ArtPosterRequest) => void;
  isLoading: boolean;
  lang: 'en' | 'zh';
}

const ART_STYLES: { id: ArtPosterStyle, label: Record<'en' | 'zh', string> }[] = [
  { id: 'ILLUSTRATION', label: { en: 'Illustration', zh: '动态插画' } },
  { id: 'MINIMALIST_ILLUSTRATION', label: { en: 'Minimalist Illustration', zh: '极简插画' } },
  { id: 'COEN_POHL', label: { en: 'Geometric Vector', zh: '几何矢量' } },
  { id: 'SPEED_GRAFFITI', label: { en: 'Modern Vector', zh: '现代矢量' } },
  { id: 'REALISTIC', label: { en: 'Technical Spec', zh: '技术图纸' } },
  { id: 'LAUNCH_CLOSEUP', label: { en: 'Launch Studio', zh: '发布会现场' } },
  { id: 'NEON_NIGHT', label: { en: 'Neon Night', zh: '赛博霓虹' } },
  { id: 'SURREALIST', label: { en: 'City Pop', zh: '都市流行' } },
  { id: 'HOLOGRAPHIC', label: { en: 'Holographic', zh: '全息插画' } },
  { id: 'COMIC_BOOM', label: { en: 'City Art Painting', zh: '城市艺术绘卷' } }
];

const TRANSLATIONS = {
  en: {
    visualStyle: "Visual Style",
    uploadCar: "Car Subject 1",
    uploadCar2: "Car Subject 2 (Optional)",
    uploadEvent: "Event Logo (Title)",
    uploadSponsor: "Sponsor Logo",
    uploadTeam: "Team Logo",
    customRequirements: "Design Notes",
    reqPlaceholder: "e.g. Add aggressive motion blur, neon lighting...",
    ratio: "Aspect Ratio",
    submit: "GENERATE ART POSTER",
    loading: "DESIGNING...",
    tip: "Upload one or two cars. If two are uploaded, a multi-car poster will be generated.",
    clear: "Clear"
  },
  zh: {
    visualStyle: "视觉风格",
    uploadCar: "赛车主体 1",
    uploadCar2: "赛车主体 2 (可选)",
    uploadEvent: "赛事 Logo (主标题)",
    uploadSponsor: "赞助商 Logo",
    uploadTeam: "车队 Logo",
    customRequirements: "设计需求补充",
    reqPlaceholder: "例如：添加强烈的动态模糊、霓虹光影效果...",
    ratio: "画面比例",
    submit: "生成艺术海报",
    loading: "正在设计中...",
    tip: "上传一辆或两辆赛车。如果上传两辆，将生成双车对决海报。",
    clear: "清除"
  }
};

const ArtPosterForm: React.FC<ArtPosterFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = TRANSLATIONS[lang];
  const [style, setStyle] = useState<ArtPosterStyle>('ILLUSTRATION');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  
  const [carImage, setCarImage] = useState<string | undefined>();
  const [carImage2, setCarImage2] = useState<string | undefined>();
  const [eventLogo, setEventLogo] = useState<string | undefined>();
  const [sponsorLogo, setSponsorLogo] = useState<string | undefined>();
  const [teamLogo, setTeamLogo] = useState<string | undefined>();
  const [styleCustomPrompt, setStyleCustomPrompt] = useState('');

  const carRef = useRef<HTMLInputElement>(null);
  const carRef2 = useRef<HTMLInputElement>(null);
  const eventRef = useRef<HTMLInputElement>(null);
  const sponsorRef = useRef<HTMLInputElement>(null);
  const teamRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, set: (s: string | undefined) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const UploadBox = ({ label, value, inputRef, setter }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[9px] font-black text-uno-pink uppercase tracking-widest">{label}</label>
        {value && (
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setter(undefined); }} 
            className="text-[8px] text-zinc-600 hover:text-uno-pink font-black uppercase"
          >
            {t.clear}
          </button>
        )}
      </div>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`h-24 bg-black/40 border border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-all ${value ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/20'}`}
      >
        {value ? <img src={value} className="h-full w-full object-contain p-2" /> : <div className="text-xl text-zinc-800">+</div>}
        <input type="file" ref={inputRef} className="hidden" onChange={e => handleFileChange(e, setter)} />
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ style, aspectRatio, carImage, carImage2, eventLogo, sponsorLogo, teamLogo, styleCustomPrompt });
    }} className="space-y-5 bg-zinc-900/30 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
      <div>
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-3">{t.visualStyle}</label>
        <div className="grid grid-cols-2 gap-2">
          {ART_STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={`py-2 px-1 text-[9px] rounded border transition-all uppercase font-black ${
                style === s.id ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {s.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <UploadBox label={t.uploadCar} value={carImage} inputRef={carRef} setter={setCarImage} />
        <UploadBox label={t.uploadCar2} value={carImage2} inputRef={carRef2} setter={setCarImage2} />
        <UploadBox label={t.uploadEvent} value={eventLogo} inputRef={eventRef} setter={setEventLogo} />
        <UploadBox label={t.uploadSponsor} value={sponsorLogo} inputRef={sponsorRef} setter={setSponsorLogo} />
        <UploadBox label={t.uploadTeam} value={teamLogo} inputRef={teamRef} setter={setTeamLogo} />
      </div>

      <div className="space-y-2">
        <label className="block text-[9px] font-black text-uno-pink uppercase tracking-widest">{t.customRequirements}</label>
        <textarea
          value={styleCustomPrompt}
          onChange={(e) => setStyleCustomPrompt(e.target.value)}
          placeholder={t.reqPlaceholder}
          className="w-full h-24 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-uno-pink transition-all resize-none text-white placeholder:text-zinc-600"
        />
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

      <p className="text-[8px] text-zinc-600 uppercase tracking-widest text-center italic">{t.tip}</p>

      <button
        type="submit"
        disabled={isLoading || !carImage}
        className="w-full py-4 bg-uno-pink text-white racing-font text-xl font-black rounded-xl hover:scale-[1.02] transition-all shadow-neon-strong disabled:opacity-50"
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </form>
  );
};

export default ArtPosterForm;