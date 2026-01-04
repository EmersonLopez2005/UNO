import React, { useState, useRef } from 'react';
import { MerchRequest, AspectRatio, MerchItemType } from '../types';

interface MerchFormProps {
  onSubmit: (request: MerchRequest) => void;
  isLoading: boolean;
  lang: 'en' | 'zh';
}

const MERCH_ITEMS: { id: MerchItemType, label: Record<'en' | 'zh', string> }[] = [
  { id: 'SHORT_SLEEVE', label: { en: 'Short Sleeve', zh: '车队短袖' } },
  { id: 'CAR_MODEL', label: { en: 'Racing Model', zh: '赛车模型' } },
  { id: 'COFFEE', label: { en: 'Iced Coffee', zh: '赛车咖啡' } },
  { id: 'MERCH_COLLECTION', label: { en: 'Collection', zh: '周边集合' } }
];

const PRESET_COLORS = [
  { name: 'Pure Black', value: '#000000' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Racing Navy', value: '#0A1A2F' },
  { name: 'Soft Cream', value: '#F5F5DC' },
  { name: 'Uno Pink', value: '#FF007F' },
];

const TRANSLATIONS = {
  en: {
    itemType: "Merchandise Item",
    submit: "RENDER MERCH DESIGN",
    uploadSponsor: "Sponsor Logo",
    uploadTeam: "Team Logo",
    uploadCar: "Car Reference",
    uploadPatternRef: "Pattern Reference",
    loading: "CRAFTING ASSET...",
    styleLabel: "Back Graphic Style",
    stylePlaceholder: "e.g. Cyberpunk glitch, Vintage sketch, Streetwear graffiti...",
    baseColorLabel: "Base Color Selection"
  },
  zh: {
    itemType: "周边种类",
    submit: "生成周边设计",
    uploadSponsor: "赞助商 Logo",
    uploadTeam: "车队 Logo",
    uploadCar: "赛车上传",
    uploadPatternRef: "图案参考",
    loading: "正在打造资产...",
    styleLabel: "背后图案风格",
    stylePlaceholder: "例如：赛博朋克、复古手绘、街头涂鸦风格...",
    baseColorLabel: "颜色选择"
  }
};

const MerchForm: React.FC<MerchFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = TRANSLATIONS[lang];
  const [itemType, setItemType] = useState<MerchItemType>('SHORT_SLEEVE');
  const [teamLogo, setTeamLogo] = useState<string | undefined>();
  const [sponsorLogo, setSponsorLogo] = useState<string | undefined>();
  const [carReference, setCarReference] = useState<string | undefined>();
  const [patternReference, setPatternReference] = useState<string | undefined>();
  const [styleDescription, setStyleDescription] = useState('');
  const [baseColor, setBaseColor] = useState('#000000');

  const teamInputRef = useRef<HTMLInputElement>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);
  const carInputRef = useRef<HTMLInputElement>(null);
  const patternRefInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, set: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const showColorPicker = itemType === 'SHORT_SLEEVE' || itemType === 'MERCH_COLLECTION';

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ 
        itemType, 
        teamLogo, 
        sponsorLogo, 
        carReference, 
        patternReference,
        styleDescription: itemType === 'SHORT_SLEEVE' ? styleDescription : undefined,
        baseColor: showColorPicker ? baseColor : undefined,
        aspectRatio: itemType === 'MERCH_COLLECTION' ? AspectRatio.PORTRAIT : AspectRatio.LANDSCAPE_4_3 
      });
    }} className="space-y-6 bg-zinc-900/30 p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
      <div>
        <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em] mb-3">{t.itemType}</label>
        <div className="grid grid-cols-2 gap-2">
          {MERCH_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setItemType(item.id)}
              className={`py-3 px-1 text-[10px] rounded border transition-all uppercase font-black ${
                itemType === item.id ? 'bg-uno-pink border-uno-pink text-white shadow-neon' : 'bg-black/40 border-zinc-800 text-zinc-500'
              }`}
            >
              {item.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {showColorPicker && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{t.baseColorLabel}</label>
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800">
            <input 
              type="color" 
              value={baseColor} 
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded overflow-hidden"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBaseColor(c.value)}
                  className={`w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform ${baseColor === c.value ? 'ring-2 ring-uno-pink ring-offset-2 ring-offset-black' : ''}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase ml-auto">{baseColor}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{t.uploadCar}</label>
          <div 
            onClick={() => carInputRef.current?.click()}
            className={`h-40 bg-black/40 border-2 border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-all ${carReference ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/30'}`}
          >
            {carReference ? <img src={carReference} className="h-full w-full object-contain p-2" /> : (
               <div className="flex flex-col items-center gap-2">
                 <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 <span className="text-[8px] font-black text-zinc-600 uppercase text-center">{t.uploadCar}</span>
               </div>
            )}
            <input type="file" ref={carInputRef} className="hidden" onChange={e => handleFileChange(e, setCarReference)} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{t.uploadPatternRef}</label>
          <div 
            onClick={() => patternRefInputRef.current?.click()}
            className={`h-40 bg-black/40 border-2 border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-all ${patternReference ? 'border-uno-pink/50 shadow-neon' : 'border-zinc-800 hover:border-uno-pink/30'}`}
          >
            {patternReference ? <img src={patternReference} className="h-full w-full object-contain p-2" /> : (
               <div className="flex flex-col items-center gap-2 text-center">
                 <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 <span className="text-[8px] font-black text-zinc-600 uppercase">{t.uploadPatternRef}</span>
               </div>
            )}
            <input type="file" ref={patternRefInputRef} className="hidden" onChange={e => handleFileChange(e, setPatternReference)} />
          </div>
        </div>
      </div>

      {itemType === 'SHORT_SLEEVE' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-[10px] font-black text-uno-pink uppercase tracking-[0.2em]">{t.styleLabel}</label>
          <textarea
            value={styleDescription}
            onChange={(e) => setStyleDescription(e.target.value)}
            placeholder={t.stylePlaceholder}
            className="w-full h-24 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-uno-pink transition-all resize-none text-white placeholder:text-zinc-600"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => sponsorInputRef.current?.click()}
          className={`h-24 bg-black/40 border-2 border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden ${sponsorLogo ? 'border-uno-pink/50' : 'border-zinc-800'}`}
        >
          {sponsorLogo ? <img src={sponsorLogo} className="h-full w-full object-contain p-2" /> : <span className="text-[8px] font-black text-zinc-600 uppercase">{t.uploadSponsor}</span>}
          <input type="file" ref={sponsorInputRef} className="hidden" onChange={e => handleFileChange(e, setSponsorLogo)} />
        </div>
        <div 
          onClick={() => teamInputRef.current?.click()}
          className={`h-24 bg-black/40 border-2 border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden ${teamLogo ? 'border-uno-pink/50' : 'border-zinc-800'}`}
        >
          {teamLogo ? <img src={teamLogo} className="h-full w-full object-contain p-2" /> : <span className="text-[8px] font-black text-zinc-600 uppercase">{t.uploadTeam}</span>}
          <input type="file" ref={teamInputRef} className="hidden" onChange={e => handleFileChange(e, setTeamLogo)} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-5 bg-uno-pink text-white racing-font text-2xl font-black rounded-xl shadow-neon-strong hover:scale-[1.02] transition-all tracking-tighter"
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </form>
  );
};

export default MerchForm;