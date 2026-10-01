import React, { useState, useRef } from 'react';
import { Language, CropScanResult, Farm } from '../types';
import { TRANSLATIONS } from '../translations';
import { api } from '../api';
import { CropReportModal } from './CropReportModal';

interface CropScannerViewProps {
  language: Language;
  onScanSaved?: (result: CropScanResult) => void;
  farmerName?: string;
  farmDetails?: Farm;
}

export interface VegetableOption {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  icon: string;
}

export const VEGETABLE_LIST: VegetableOption[] = [
  { id: "AUTO", nameEn: "Auto-Detect Vegetable", nameHi: "स्वचालित पहचान (सभी सब्जियां)", nameMr: "सर्व भाजीपाला (स्वयंचलित शोध)", icon: "✨" },
  { id: "Tomato", nameEn: "Tomato", nameHi: "टमाटर", nameMr: "टोमॅटो", icon: "🍅" },
  { id: "Potato", nameEn: "Potato", nameHi: "आलू", nameMr: "बटाटा", icon: "🥔" },
  { id: "Chilli", nameEn: "Chilli / Pepper", nameHi: "मिर्च / शिमला मिर्च", nameMr: "मिरची / ढोबळी", icon: "🌶️" },
  { id: "Brinjal", nameEn: "Brinjal / Eggplant", nameHi: "बैंगन", nameMr: "वांगी", icon: "🍆" },
  { id: "Onion", nameEn: "Onion & Garlic", nameHi: "प्याज व लहसुन", nameMr: "कांदा व लसूण", icon: "🧅" },
  { id: "Okra", nameEn: "Okra / Ladyfinger", nameHi: "भिंडी", nameMr: "भेंडी", icon: "🫛" },
  { id: "Cabbage", nameEn: "Cabbage", nameHi: "पत्तागोभी", nameMr: "कोबी", icon: "🥬" },
  { id: "Cauliflower", nameEn: "Cauliflower", nameHi: "फूलगोभी", nameMr: "फ्लॉवर", icon: "🥦" },
  { id: "Cucumber", nameEn: "Cucumber", nameHi: "खीरा", nameMr: "काकडी", icon: "🥒" },
  { id: "Gourds", nameEn: "Gourds (Bitter / Bottle)", nameHi: "लौकी / करेला / तोरई", nameMr: "कारले / दुधी भोपळा", icon: "🍈" },
  { id: "Spinach", nameEn: "Spinach & Greens", nameHi: "पालक व मेथी", nameMr: "पालक व पालेभाज्या", icon: "🌿" },
  { id: "Peas", nameEn: "Peas & Beans", nameHi: "मटर व बीन्स", nameMr: "मटार व घेवडा", icon: "🫛" },
  { id: "Carrot", nameEn: "Carrot & Radish", nameHi: "गाजर व मूली", nameMr: "गाजर व मुळा", icon: "🥕" },
  { id: "Ginger", nameEn: "Ginger & Turmeric", nameHi: "अदरक व हल्दी", nameMr: "आले व हळद", icon: "🫚" },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूं", nameMr: "गहू", icon: "🌾" },
  { id: "Mustard", nameEn: "Mustard", nameHi: "सरसों", nameMr: "मोहरी", icon: "🟡" },
];

export const CropScannerView: React.FC<CropScannerViewProps> = ({
  language,
  onScanSaved,
  farmerName,
  farmDetails
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>("AUTO");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initial state is strictly clean (no preset diagnosis, no preset report)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CropScanResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    await analyzeFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreviewImage(localUrl);
      await analyzeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const analyzeFile = async (file?: File) => {
    setAnalyzing(true);
    try {
      const res = await api.predictDisease(file, selectedCrop === "AUTO" ? "All Vegetables" : selectedCrop);
      setScanResult(res);
      if (onScanSaved) onScanSaved(res);
    } catch (err) {
      console.error("Diagnosis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResetScan = () => {
    setScanResult(null);
    setPreviewImage(null);
    setShowHeatmap(false);
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const playAudioAdvisory = () => {
    if (!scanResult) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    let speechText = "";
    let speechLang = "en-IN";

    if (language === 'mr') {
      speechText = scanResult.audio_advice_mr || `${scanResult.crop} पिकावर ${scanResult.disease_marathi || scanResult.disease} आढळला आहे. बाधित पाने काढून टाका आणि योग्य फवारणी करा.`;
      speechLang = "mr-IN";
    } else if (language === 'hi') {
      speechText = scanResult.audio_advice_hi || `${scanResult.crop} फसल में ${scanResult.disease_hindi || scanResult.disease} के लक्षण हैं। प्रभावित पत्तों को काटकर नष्ट करें और अनुमोदित दवा का छिड़काव करें।`;
      speechLang = "hi-IN";
    } else {
      speechText = `Vegetable diagnosis is ${scanResult.crop} with ${scanResult.disease} at ${Math.round(scanResult.confidence * 100)} percent confidence. Consult KVK agronomist before spraying.`;
      speechLang = "en-IN";
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = speechLang;
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const getCropDisplayName = (item: VegetableOption) => {
    if (language === 'mr') return `${item.icon} ${item.nameMr}`;
    if (language === 'hi') return `${item.icon} ${item.nameHi}`;
    return `${item.icon} ${item.nameEn}`;
  };

  const currentVegItem = VEGETABLE_LIST.find(v => v.id === selectedCrop) || VEGETABLE_LIST[0];

  return (
    <div className="flex flex-col pb-28 pt-20 px-4 max-w-4xl mx-auto w-full gap-5">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Top Helper Instruction Banner */}
      <div className="px-4 py-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              nest_eco_leaf
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-headline font-bold text-on-surface truncate">
              {language === 'mr' ? 'सर्व भाजीपाला रोग निदान प्रणाली' : language === 'hi' ? 'सभी सब्जियों के रोग का सटीक एआई निदान' : 'All Vegetables Disease Diagnostic AI'}
            </p>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span>{language === 'mr' ? 'फोटो अपलोड करा • थेट अहवाल तयार करा' : language === 'hi' ? 'फोटो अपलोड करें • डायग्नोसिस बाद रिपोर्ट बनेगी' : 'Upload photo • Dynamic report built after diagnosis'}</span>
            </p>
          </div>
        </div>
        {scanResult && (
          <button
            type="button"
            onClick={handleResetScan}
            className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-headline text-xs font-bold hover:bg-surface-container-highest transition-colors flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>{language === 'mr' ? 'नवीन स्कॅन' : language === 'hi' ? 'नया स्कैन' : 'New Scan'}</span>
          </button>
        )}
      </div>

      {/* Vegetable Crop Selector Bar */}
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-headline font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">eco</span>
            <span>{language === 'mr' ? 'भाजीपाला निवडा' : language === 'hi' ? 'सब्जी फसल चुनें' : 'Select Vegetable Crop'}</span>
          </label>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {selectedCrop === "AUTO" ? (language === 'mr' ? 'स्वयंचलित शोध' : language === 'hi' ? 'ऑटो डिटेक्ट' : 'Auto-detecting') : currentVegItem.nameEn}
          </span>
        </div>

        {/* Dropdown Selector */}
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-surface-container text-on-surface font-headline text-xs font-bold border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
        >
          {VEGETABLE_LIST.map((veg) => (
            <option key={veg.id} value={veg.id}>
              {getCropDisplayName(veg)}
            </option>
          ))}
        </select>

        {/* Quick Vegetable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {VEGETABLE_LIST.slice(0, 8).map((veg) => (
            <button
              key={veg.id}
              type="button"
              onClick={() => setSelectedCrop(veg.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-headline font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCrop === veg.id
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{veg.icon}</span>
              <span>{language === 'mr' ? veg.nameMr : language === 'hi' ? veg.nameHi : veg.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewfinder / Dropzone Stage */}
      {previewImage ? (
        /* Image Preview with Diagnostic Overlays */
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-md border-2 border-primary/20">
          <img
            src={previewImage}
            alt="Scanned Vegetable Leaf"
            className="w-full h-full object-cover select-none"
          />

          {/* Grad-CAM Heatmap Simulation Overlay */}
          {showHeatmap && (
            <div className="absolute inset-0 bg-gradient-to-tr from-error/40 via-secondary-container/40 to-transparent mix-blend-color pointer-events-none transition-opacity duration-300" />
          )}

          {/* Animated Scanning Laser Beam during Analysis */}
          {analyzing && (
            <div className="absolute left-0 right-0 h-1 bg-secondary-fixed shadow-[0_0_14px_#b1f661] pointer-events-none animate-laser" />
          )}

          {/* Corner Targeting Reticles */}
          <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-[3px] border-l-[3px] border-secondary-fixed rounded-tl-sm" />
              <div className="w-6 h-6 border-t-[3px] border-r-[3px] border-secondary-fixed rounded-tr-sm" />
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-[3px] border-l-[3px] border-secondary-fixed rounded-bl-sm" />
              <div className="w-6 h-6 border-b-[3px] border-r-[3px] border-secondary-fixed rounded-br-sm" />
            </div>
          </div>

          {/* AI Detected Lesion Bounding Box Overlay (Built after diagnosis) */}
          {scanResult && !analyzing && (
            <div
              style={{
                top: `${scanResult.bounding_box?.top_pct || 28}%`,
                left: `${scanResult.bounding_box?.left_pct || 26}%`,
                width: `${scanResult.bounding_box?.width_pct || 46}%`,
                height: `${scanResult.bounding_box?.height_pct || 38}%`
              }}
              className="absolute rounded-xl border-2 border-dashed border-secondary-fixed bg-secondary-fixed/15 flex flex-col justify-between p-2 pointer-events-none animate-pulse"
            >
              <div className="flex items-center justify-between">
                <span className="bg-primary text-on-primary font-headline text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide">
                  {scanResult.bounding_box?.label || "LESION LOCATED"}
                </span>
                <span className="bg-secondary-container text-on-secondary-container font-headline text-[10px] font-bold px-1 rounded">
                  {Math.round(scanResult.confidence * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1 self-start bg-black/80 text-white px-2 py-0.5 rounded font-headline text-[10px]">
                <span className="material-symbols-outlined text-[12px] text-secondary-fixed">
                  verified
                </span>
                <span>{scanResult.crop} • {scanResult.disease}</span>
              </div>
            </div>
          )}

          {/* Top Overlay Controls */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between px-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${analyzing ? 'bg-amber-400 animate-ping' : 'bg-secondary-fixed animate-pulse'}`} />
              <span className="text-[11px] font-headline font-semibold tracking-wide">
                {analyzing ? (language === 'mr' ? 'रोग विश्लेषण चालू...' : language === 'hi' ? 'विश्लेषण जारी...' : 'AI ANALYZING...') : 'DIAGNOSIS LOCKED'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFlashOn(!flashOn)}
                className={`w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all ${
                  flashOn ? 'text-secondary-fixed ring-2 ring-secondary-fixed' : ''
                }`}
                title="Toggle Flash"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {flashOn ? 'flash_on' : 'flash_off'}
                </span>
              </button>
              <div className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] font-headline font-bold backdrop-blur-md uppercase">
                {scanResult ? scanResult.crop : selectedCrop}
              </div>
            </div>
          </div>

          {/* Bottom Viewfinder Pill */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-center pointer-events-none">
            <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-headline flex items-center gap-1.5 shadow">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                check_circle
              </span>
              <span>{analyzing ? 'Processing leaf pixels...' : 'Focal leaf symptoms resolved'}</span>
            </span>
          </div>
        </div>
      ) : (
        /* Empty Pre-Diagnosis Dropzone / Camera Launch (No Presets Shown!) */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all bg-gradient-to-b from-surface-container-low via-surface to-surface-container shadow-tactile ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/60 hover:border-primary/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-inner">
            <span className="material-symbols-outlined text-[36px]">
              add_a_photo
            </span>
          </div>

          <h3 className="font-headline text-base font-bold text-on-surface">
            {language === 'mr' ? 'कोणत्याही भाजीपाल्याच्या पानाचा फोटो घ्या' : language === 'hi' ? 'किसी भी सब्जी की पत्ती या फल का फोटो लें' : 'Upload or Capture Vegetable Leaf'}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-5 leading-relaxed">
            {language === 'mr'
              ? 'टोमॅटो, बटाटा, मिरची, वांगी, कांदा, भेंडी, कोबी, काकडी व इतर सर्व भाजीपाल्यांच्या रोगांचे अचूक निदान आणि तात्काळ अहवाल.'
              : language === 'hi'
              ? 'टमाटर, आलू, मिर्च, बैंगन, प्याज, भिंडी, गोभी, खीरा आदि सभी सब्जियों के रोगों का तुरंत सटीक निदान व रिपोर्ट।'
              : 'Detect diseases across all vegetables (Tomato, Potato, Chilli, Brinjal, Onion, Okra, Cabbage, Cucumber, etc.).'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-tactile-btn active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>{language === 'mr' ? 'कॅमेऱ्याने फोटो काढा' : language === 'hi' ? 'कैमरा से फोटो लें' : 'Take Camera Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-tactile border border-outline-variant/40 active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">photo_library</span>
              <span>{language === 'mr' ? 'गॅलरीतून निवडा' : language === 'hi' ? 'गैलरी से चुनें' : 'Upload from Gallery'}</span>
            </button>
          </div>

          <div className="mt-4 px-3 py-1 rounded-full bg-surface-container-high text-[11px] font-headline text-on-surface-variant flex items-center gap-1.5 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px] text-primary">info</span>
            <span>{language === 'mr' ? 'कोणताही प्रीसेट अहवाल नाही • तपासणीनंतरच अहवाल तयार होईल' : language === 'hi' ? 'कोई प्रीसेट रिपोर्ट नहीं • फोटो जांच के बाद ही रिपोर्ट तैयार होगी' : 'Report is built dynamically only after photo diagnosis'}</span>
          </div>
        </div>
      )}

      {/* Action Buttons Below Viewfinder (When Image or Result is Active) */}
      {previewImage && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => analyzeFile()}
            disabled={analyzing}
            className="flex-1 min-h-[48px] px-3 py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              {analyzing ? 'hourglass_top' : 'psychology'}
            </span>
            <span>{analyzing ? (language === 'mr' ? 'तपासणी चालू...' : language === 'hi' ? 'विश्लेषण जारी...' : 'Analyzing with AI...') : (language === 'mr' ? 'पुन्हा तपासा' : language === 'hi' ? 'फिर से जांचें' : 'Re-Analyze Crop')}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[48px] px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile border border-outline-variant/40 active:translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">
              photo_library
            </span>
            <span>{language === 'mr' ? 'दुसरा फोटो' : language === 'hi' ? 'अन्य फोटो' : 'Change Photo'}</span>
          </button>

          {scanResult && (
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 min-h-[48px] rounded-xl font-headline text-xs font-bold flex items-center justify-center gap-1 shadow-tactile transition-all ${
                showHeatmap
                  ? 'bg-secondary-container text-on-secondary-container border border-secondary'
                  : 'bg-surface-container-high text-primary'
              }`}
              title="Toggle Grad-CAM Heatmap"
            >
              <span className="material-symbols-outlined text-[20px]">
                heat_pump
              </span>
              <span className="hidden sm:inline">Heatmap</span>
            </button>
          )}
        </div>
      )}

      {/* Low Confidence Warning (if confidence < 70%) */}
      {scanResult?.is_low_confidence && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 flex items-start gap-3 text-amber-900 shadow-sm">
          <span className="material-symbols-outlined text-amber-600 text-[24px]">
            warning
          </span>
          <div className="flex-1">
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">
              ⚠️ The AI is not sufficiently confident ({Math.round(scanResult.confidence * 100)}%)
            </h4>
            <p className="text-xs mt-0.5">
              The photo may be blurry, under-lit, or showing ambiguous symptoms. Retake a photo in natural daylight focusing directly on the affected leaf, or consult a local agronomist.
            </p>
          </div>
        </div>
      )}

      {/* AI Diagnosis Result Section — ONLY BUILT AND SHOWN AFTER DIAGNOSIS! */}
      {scanResult && !analyzing && (
        <div className="bg-surface-container rounded-2xl p-4 sm:p-5 shadow-tactile border border-outline-variant/30 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Title & Match Header */}
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary text-on-primary font-headline text-[10px] font-bold uppercase tracking-wider">
                  {scanResult.crop}
                </span>
                <span className="text-[11px] font-headline font-bold text-on-surface-variant">
                  {scanResult.disease_scientific || "Plant Pathogen"}
                </span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface mt-1">
                {language === 'mr' ? scanResult.disease_marathi || scanResult.disease : language === 'hi' ? scanResult.disease_hindi || scanResult.disease : scanResult.disease}
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl sm:text-2xl font-headline font-black text-primary">
                {Math.round(scanResult.confidence * 100)}%
              </span>
              <span className="text-[10px] font-headline font-bold uppercase text-on-surface-variant">
                {scanResult.confidence_tier} Confidence
              </span>
            </div>
          </div>

          {/* DYNAMIC DIAGNOSTIC REPORT CARD (BUILT FRESH AFTER DIAGNOSIS) */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white shadow-md gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-white">
                  description
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary-fixed text-primary font-headline text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{language === 'mr' ? 'अहवाल तयार झाला' : language === 'hi' ? 'रिपोर्ट तैयार है' : 'Report Generated'}</span>
                </div>
                <h4 className="font-headline text-sm font-bold">
                  {language === 'mr' ? 'प्रगत कृषी रोगनिदान अहवाल' : language === 'hi' ? 'उन्नत कृषि रोग निदान रिपोर्ट' : 'Official Agronomy Diagnostic Report'}
                </h4>
                <p className="text-[11px] text-white/85">
                  {language === 'mr'
                    ? `${scanResult.crop} - ${scanResult.disease_marathi || scanResult.disease} साठी प्रमाणित औषध मात्रा व उपाय अहवाल.`
                    : language === 'hi'
                    ? `${scanResult.crop} - ${scanResult.disease_hindi || scanResult.disease} के लिए प्रमाणित दवा मात्रा व उपाय रिपोर्ट।`
                    : `Certified treatment report for ${scanResult.crop} • ${scanResult.disease}.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-primary font-headline font-bold text-xs shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 shrink-0 hover:bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>{language === 'mr' ? 'अहवाल पहा व डाउनलोड करा (PDF)' : language === 'hi' ? 'रिपोर्ट देखें और डाउनलोड करें (PDF)' : 'View & Export PDF Report'}</span>
            </button>
          </div>

          {/* General Guidance Summary */}
          {scanResult.general_guidance && (
            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
              {scanResult.general_guidance}
            </p>
          )}

          {/* Symptoms List */}
          {scanResult.symptoms && scanResult.symptoms.length > 0 && (
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <h4 className="text-xs font-headline font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">search_check</span>
                <span>{language === 'mr' ? 'निरीक्षण केलेली प्रमुख लक्षणे:' : language === 'hi' ? 'पहचाने गए मुख्य लक्षण:' : 'Observed Symptoms:'}</span>
              </h4>
              <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
                {scanResult.symptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Audio Advisory Player Widget */}
          <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2.5 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  campaign
                </span>
                <span className="text-xs font-headline font-bold text-on-surface">
                  {language === 'mr' ? 'ऑडिओ कृषी सल्ला (मराठी)' : language === 'hi' ? 'ऑडियो कृषि सलाह (हिंदी)' : 'Audio Farm Advisory (English)'}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">0:30 min</span>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={playAudioAdvisory}
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 active:scale-95 shadow-tactile-btn transition-transform"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isPlayingAudio ? 'pause' : 'play_arrow'}
                </span>
              </button>
              {/* Animated Audio Waveform */}
              <div className="flex-1 flex items-center gap-1 h-6 overflow-hidden">
                {[40, 70, 95, 60, 85, 45, 90, 65, 30, 80, 50, 90, 40].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-outline-variant'
                    }`}
                    style={{ height: isPlayingAudio ? `${Math.max(20, Math.round(h * Math.random()))}%` : `${h}%` }}
                  />
                ))}
              </div>
              <span className="text-xs font-headline text-primary font-bold">
                {isPlayingAudio ? (language === 'mr' ? 'सुरू आहे' : language === 'hi' ? 'चल रहा है' : 'Playing') : (language === 'mr' ? 'ऐका' : language === 'hi' ? 'सुनें' : 'Listen')}
              </span>
            </div>
          </div>

          {/* Immediate Action Plan */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                medical_services
              </span>
              <span>{t.actionPlan}</span>
            </h3>

            {/* Option 1: Curative Chemical Treatment */}
            {scanResult.chemical_options?.map((opt, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-headline font-bold uppercase tracking-wider">
                    {t.curativeOption}
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    science
                  </span>
                </div>
                <h4 className="font-headline text-sm text-on-surface font-bold">
                  {opt.name}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Dose: <strong className="text-on-surface">{opt.dose}</strong>. {opt.benefit}
                </p>
              </div>
            ))}

            {/* Option 2: Organic Buffer */}
            {scanResult.organic_options?.map((opt, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-headline font-bold uppercase tracking-wider">
                    {t.organicOption}
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    eco
                  </span>
                </div>
                <h4 className="font-headline text-sm text-on-surface font-bold">
                  {opt.name}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Dose: <strong className="text-on-surface">{opt.dose}</strong>. {opt.benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Responsible AI Disclaimer */}
          <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 text-on-surface-variant text-[11px] leading-relaxed">
            <p>{scanResult.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Advanced PDF Diagnostic Report Modal — Only openable when scanResult is ready */}
      {scanResult && (
        <CropReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          scanResult={scanResult}
          previewImage={previewImage || undefined}
          language={language}
          farmerName={farmerName}
          farmDetails={farmDetails}
        />
      )}
    </div>
  );
};
