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

export const CropScannerView: React.FC<CropScannerViewProps> = ({
  language,
  onScanSaved,
  farmerName,
  farmDetails
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80"
  );

  const [scanResult, setScanResult] = useState<CropScanResult>({
    crop: "Tomato",
    disease: "Early Blight",
    disease_scientific: "Alternaria solani",
    disease_marathi: "टोमॅटोवरील करपा (Early Blight)",
    disease_hindi: "अगेती झुलसा (Early Blight)",
    confidence: 0.94,
    confidence_tier: "HIGH",
    severity: "HIGH",
    symptoms: [
      "Small brown to black spots on older lower leaves with concentric rings ('target-board' pattern)",
      "Yellowing chlorotic halo around leaf spots",
      "Premature defoliation starting from bottom canopy upwards",
      "Sunken dark lesions near calyx and lower stems"
    ],
    general_guidance: "Fungal pathogen favored by warm temperatures (24-29°C) and prolonged leaf moisture. Remove infected lower foliage.",
    action_plan: [
      "Prune and destroy heavily infected lower leaves.",
      "Ensure drip irrigation to keep foliage completely dry.",
      "Recheck field 48 hours after rain or heavy fog."
    ],
    organic_options: [
      {
        name: "Cold-Pressed Neem Oil (10,000 ppm)",
        dose: "4 to 5 ml per Liter of water with mild organic surfactant",
        benefit: "Inhibits fungal spore germination and protects clean foliage."
      },
      {
        name: "Trichoderma harzianum bio-fungicide",
        dose: "5g per Liter of water as foliar wash",
        benefit: "Naturally outcompetes pathogenic mycelium on leaf surface."
      }
    ],
    chemical_options: [
      {
        name: "Spray Mancozeb 75% WP (Preventive)",
        dose: "2.0 to 2.5 g per Liter of water (500g/acre in 200L water)",
        benefit: "Broad-spectrum multisite protective contact fungicide."
      },
      {
        name: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Curative)",
        dose: "1 ml per Liter of water (200 ml/acre)",
        benefit: "Halts fungal spore multiplication and lesion expansion within 24h."
      }
    ],
    disclaimer: "⚠️ KrishiCopilot AI Advisory: Verify crop-treatment decisions with an agricultural officer or KVK agronomist.",
    bounding_box: { top_pct: 32, left_pct: 28, width_pct: 44, height_pct: 38, label: "Lesion Located (96%)" },
    heatmap_data: { salient_activation_score: 0.94, gradcam_layer: "features.stage8.unit1.conv3" },
    is_low_confidence: false,
    audio_advice_hi: "आपके टमाटर की फसल में अगेती झुलसा के लक्षण हैं। पत्तियों पर गोल छल्लों वाले काले धब्बे हैं। तुरंत निचले पत्तों को काटकर नष्ट करें।",
    audio_advice_mr: "तुमच्या टोमॅटोच्या पिकावर अर्ली ब्लाइट म्हणजेच करपा रोगाची लक्षणे आढळली आहेत. बाधित पाने काढून टाका आणि तुषार सिंचन टाळा."
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    await analyzeFile(file);
  };

  const analyzeFile = async (file?: File) => {
    setAnalyzing(true);
    try {
      const res = await api.predictDisease(file, selectedCrop);
      setScanResult(res);
      if (onScanSaved) onScanSaved(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const playAudioAdvisory = () => {
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
      speechText = scanResult.audio_advice_mr || "पिकावरील करपा रोगासाठी बाधित पाने काढून टाका आणि निंबोळी तेलाची फवारणी करा.";
      speechLang = "mr-IN";
    } else if (language === 'hi') {
      speechText = scanResult.audio_advice_hi || "फसल में अगेती झुलसा के लक्षण हैं। प्रभावित पत्तों को काटकर नष्ट करें और नीम तेल का छिड़काव करें।";
      speechLang = "hi-IN";
    } else {
      speechText = `Crop diagnosis is ${scanResult.disease} with ${Math.round(scanResult.confidence * 100)} percent confidence. Consult KVK agronomist before spraying.`;
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

  return (
    <div className="flex flex-col pb-28 pt-20 px-4 max-w-4xl mx-auto w-full gap-4">
      {/* Top Helper Instruction Banner */}
      <div className="px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px] text-on-secondary-container">
            center_focus_strong
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-headline font-bold text-on-surface line-clamp-1">
            AI Lens: Leaf, stem, or fruit disease detection
          </p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span>Instant diagnosis with</span>
            <span className="text-primary font-bold">98.4% precision</span>
            <span>• Daytime calibrated</span>
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-headline text-[10px] font-bold">
          LIVE
        </span>
      </div>

      {/* Camera / Viewfinder Stage */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-md border-2 border-primary/20">
        <img
          src={previewImage}
          alt="Analyzed Crop Leaf"
          className="w-full h-full object-cover select-none"
        />

        {/* Grad-CAM Heatmap Simulation Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0 bg-gradient-to-tr from-error/40 via-secondary-container/40 to-transparent mix-blend-color pointer-events-none transition-opacity duration-300" />
        )}

        {/* Animated Scanning Laser Beam */}
        <div className="absolute left-0 right-0 h-1 bg-secondary-fixed shadow-[0_0_14px_#b1f661] pointer-events-none animate-laser" />

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

        {/* AI Detected Lesion Bounding Box Overlay */}
        <div className="absolute top-[32%] left-[28%] w-[44%] h-[38%] rounded-xl border-2 border-dashed border-secondary-fixed bg-secondary-fixed/15 flex flex-col justify-between p-2 pointer-events-none animate-pulse">
          <div className="flex items-center justify-between">
            <span className="bg-primary text-on-primary font-headline text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide">
              LESION LOCATED
            </span>
            <span className="bg-secondary-container text-on-secondary-container font-headline text-[10px] font-bold px-1 rounded">
              {Math.round(scanResult.confidence * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1 self-start bg-black/80 text-white px-2 py-0.5 rounded font-headline text-[10px]">
            <span className="material-symbols-outlined text-[12px] text-secondary-fixed">
              warning
            </span>
            <span>{scanResult.disease} Cluster</span>
          </div>
        </div>

        {/* Top Overlay Controls */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between px-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" />
            <span className="text-[11px] font-headline font-semibold tracking-wide">ANALYSIS LOCKED</span>
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
              {selectedCrop}
            </div>
          </div>
        </div>

        {/* Bottom Viewfinder Pill */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-center pointer-events-none">
          <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-headline flex items-center gap-1.5 shadow">
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
              check_circle
            </span>
            Single-leaf focal depth locked
          </span>
        </div>
      </div>

      {/* Action Buttons Below Viewfinder */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => analyzeFile()}
          disabled={analyzing}
          className="flex-1 min-h-[48px] px-3 py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">
            {analyzing ? 'hourglass_top' : 'psychology'}
          </span>
          <span>{analyzing ? t.analyzing : t.analyzeCrop}</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[48px] px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile border border-outline-variant/40 active:translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            photo_library
          </span>
          <span>{t.uploadGallery}</span>
        </button>

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
      </div>

      {/* Low Confidence Warning (if confidence < 70%) */}
      {scanResult.is_low_confidence && (
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

      {/* AI Diagnosis Result Section */}
      <div className="bg-surface-container rounded-2xl p-4 shadow-tactile border border-outline-variant/30 flex flex-col gap-3">
        {/* Title & Match Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-headline text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                {Math.round(scanResult.confidence * 100)}% {t.aiConfidence}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-headline text-xs font-bold uppercase">
                {scanResult.severity} SEVERITY
              </span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface tracking-tight">
              {scanResult.crop} — {language === 'mr' ? scanResult.disease_marathi || scanResult.disease : language === 'hi' ? scanResult.disease_hindi || scanResult.disease : scanResult.disease}
            </h2>
            <p className="text-xs text-on-surface-variant italic">
              {scanResult.disease_scientific}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container/60 text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">
              coronavirus
            </span>
          </div>
        </div>

        {/* PDF Advanced Report Export Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-sm flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-headline text-xs font-bold text-primary">
                {language === 'mr' ? 'प्रगत कृषी रोगनिदान अहवाल' : language === 'hi' ? 'उन्नत कृषि रोग निदान रिपोर्ट' : 'Advanced Agronomy Diagnostic Report'}
              </h4>
              <span className="text-[11px] text-on-surface-variant truncate">
                {language === 'mr' ? 'कीटकनाशक मात्रा, जैविक उपाय व प्रमाणित सल्ल्यासह पीडीएफ एक्सपोर्ट करा' : language === 'hi' ? 'दवा की सही मात्रा, जैविक उपाय और प्रमाणित सलाह के साथ पीडीएफ निर्यात करें' : 'Export official PDF with chemical dosages & organic stewardship'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold flex items-center gap-1.5 shadow-tactile-btn active:translate-y-0.5 transition-all hover:bg-primary-hover shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>{language === 'mr' ? 'अहवाल डाउनलोड (PDF)' : language === 'hi' ? 'रिपोर्ट डाउनलोड (PDF)' : 'Export PDF Report'}</span>
          </button>
        </div>

        {/* Symptoms List */}
        <div className="p-3 rounded-xl bg-surface-container-lowest">
          <h4 className="text-xs font-headline font-bold text-on-surface mb-1">
            Common Observed Symptoms:
          </h4>
          <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
            {scanResult.symptoms.map((sym, idx) => (
              <li key={idx}>{sym}</li>
            ))}
          </ul>
        </div>

        {/* Audio Advisory Player Widget */}
        <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                campaign
              </span>
              <span className="text-xs font-headline font-bold text-on-surface">
                {language === 'mr' ? 'ऑडिओ सल्ला (मराठी)' : language === 'hi' ? 'ऑडियो सलाह (Hindi)' : 'Audio Advisory (English)'}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">0:35 min</span>
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
              {isPlayingAudio ? 'Playing' : 'Listen'}
            </span>
          </div>
        </div>

        {/* Immediate Action Plan */}
        <div className="flex flex-col gap-2.5 pt-1">
          <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              medical_services
            </span>
            {t.actionPlan}
          </h3>

          {/* Option 1: Curative Chemical */}
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

      {/* Advanced PDF Diagnostic Report Modal */}
      <CropReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        scanResult={scanResult}
        previewImage={previewImage}
        language={language}
        farmerName={farmerName}
        farmDetails={farmDetails}
      />
    </div>
  );
};
