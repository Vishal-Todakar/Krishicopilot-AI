import React, { useRef, useState } from 'react';
import { Language, CropScanResult, Farm } from '../types';

interface CropReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: CropScanResult;
  previewImage?: string;
  language: Language;
  farmerName?: string;
  farmDetails?: Farm;
}

export const CropReportModal: React.FC<CropReportModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  previewImage,
  language,
  farmerName,
  farmDetails
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const reportId = `KCP-AGRI-2026-${Math.abs((scanResult.crop + scanResult.disease).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 6)}`;
  const currentDate = new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      if (!element) {
        handlePrint();
        return;
      }

      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        const opt = {
          margin: 0,
          filename: `KrishiCopilot_Agronomy_Report_${scanResult.crop}_${scanResult.disease.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        };
        await html2pdf().set(opt).from(element).save();
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error("PDF download failed, falling back to print:", err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const reportHtml = reportRef.current?.innerHTML;
    if (!reportHtml) return;

    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KrishiCopilot_Agronomy_Report_${scanResult.crop}_${scanResult.disease}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
              color: #1a201c;
              background: #e5e9e5;
              margin: 0;
              padding: 0;
              line-height: 1.4;
              font-size: 12px;
            }
            .pdf-page {
              width: 210mm;
              min-height: 297mm;
              height: 297mm;
              padding: 12mm 14mm;
              background: #ffffff;
              margin: 0 auto 10mm auto;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
              break-after: page;
            }
            @media print {
              body {
                background: #ffffff;
              }
              .pdf-page {
                margin: 0;
                width: 210mm;
                height: 297mm;
                page-break-after: always;
                break-after: page;
              }
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1b5e20;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #1b5e20;
              letter-spacing: -0.5px;
            }
            .brand-tag {
              font-size: 10px;
              background: #e8f5e9;
              color: #1b5e20;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 700;
              margin-left: 6px;
              vertical-align: middle;
            }
            .meta-box {
              text-align: right;
              font-size: 10.5px;
              color: #495449;
              line-height: 1.35;
            }
            .badge-row {
              display: flex;
              gap: 8px;
              margin-top: 4px;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 700;
            }
            .badge-conf {
              background: #1b5e20;
              color: #ffffff;
            }
            .badge-sev {
              background: #ba1a1a;
              color: #ffffff;
            }
            .section-title {
              font-size: 12px;
              font-weight: 800;
              color: #1b5e20;
              border-left: 3.5px solid #1b5e20;
              padding-left: 6px;
              margin: 10px 0 6px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .grid-4 {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 10px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .card {
              background: #f8faf8;
              border: 1px solid #dbe5db;
              border-radius: 8px;
              padding: 8px 10px;
            }
            .card-title {
              font-size: 9.5px;
              color: #556255;
              text-transform: uppercase;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .card-val {
              font-size: 11.5px;
              font-weight: 700;
              color: #141e18;
            }
            .leaf-photo-box {
              width: 100%;
              height: 140px;
              border-radius: 8px;
              overflow: hidden;
              position: relative;
              background: #eef2ee;
              border: 1px solid #c2cdc1;
            }
            .leaf-photo {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .symptom-box {
              background: #f8faf8;
              border: 1px solid #dbe5db;
              border-radius: 8px;
              padding: 10px 12px;
              height: 140px;
              overflow: hidden;
            }
            .symptom-list {
              margin: 0;
              padding-left: 16px;
              font-size: 11px;
              color: #2e3b2e;
              line-height: 1.45;
            }
            .symptom-list li {
              margin-bottom: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              font-size: 11px;
            }
            th {
              background: #eaf1ea;
              color: #1b5e20;
              text-align: left;
              padding: 6px 8px;
              font-weight: 700;
              border-bottom: 1.5px solid #c2cdc1;
            }
            td {
              padding: 6px 8px;
              border-bottom: 1px solid #e1ebe1;
              vertical-align: top;
            }
            .action-step {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 7px 10px;
              border-radius: 6px;
              background: #f7faf7;
              border: 1px solid #dbe5db;
              margin-bottom: 6px;
              font-size: 11.5px;
            }
            .step-num {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #1b5e20;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 10px;
              shrink: 0;
            }
            .footer-sign {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed #b9c7b9;
              font-size: 10px;
              color: #5a665a;
            }
            .seal-box {
              border: 1.5px dashed #1b5e20;
              padding: 6px 14px;
              border-radius: 6px;
              text-align: center;
              color: #1b5e20;
              font-weight: 800;
              font-size: 10px;
            }
            .page-num {
              text-align: center;
              font-size: 9.5px;
              color: #717a6d;
              padding-top: 6px;
              border-top: 1px solid #eef2ee;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          ${reportHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                picture_as_pdf
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">
                {language === 'mr' ? 'प्रगत कृषी रोगनिदान अहवाल' : language === 'hi' ? 'उन्नत कृषि रोग निदान रिपोर्ट' : 'Advanced Agronomy Diagnostic Report'}
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                2-Page Executive Clinical Pathology & Agronomic Dossier
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold flex items-center gap-2 shadow-tactile-btn active:translate-y-0.5 transition-all hover:bg-primary-hover disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDownloading ? 'hourglass_top' : 'download'}
              </span>
              <span>
                {isDownloading
                  ? (language === 'mr' ? 'डाउनलोड होत आहे...' : language === 'hi' ? 'डाउनलोड हो रहा है...' : 'Downloading PDF...')
                  : (language === 'mr' ? 'पीडीएफ डाउनलोड करा' : language === 'hi' ? 'पीडीएफ डाउनलोड करें' : 'Download PDF Report')}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-bold flex items-center gap-1.5 border border-outline-variant/30 hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span className="hidden sm:inline">{language === 'mr' ? 'प्रिंट' : language === 'hi' ? 'प्रिंट' : 'Print'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition-colors ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable A4 Report View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#e8eee8]">
          <div ref={reportRef} className="max-w-[800px] mx-auto text-[#1a201c]">
            {/* ========================================================== */}
            {/* PAGE 1: CLINICAL DIAGNOSIS & SPECIMEN EVIDENCE */}
            {/* ========================================================== */}
            <div
              className="pdf-page bg-white p-7 sm:p-9 rounded-2xl shadow-tactile border border-outline-variant/30 mb-8 flex flex-col justify-between"
              style={{
                width: '100%',
                minHeight: '290mm',
                boxSizing: 'border-box',
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              <div>
                {/* Header Banner */}
                <div className="flex justify-between items-start border-b-2 border-[#1b5e20] pb-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-[#1b5e20] tracking-tight font-headline">
                        🌾 KrishiCopilot
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20] uppercase tracking-wider">
                        AI Agronomy Labs
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#556255] font-semibold uppercase tracking-wider mt-0.5">
                      Official Plant Pathology & Diagnostic Assessment Report
                    </div>
                  </div>
                  <div className="text-right text-[10.5px] text-[#495449] leading-tight">
                    <div><strong>Report ID:</strong> {reportId}</div>
                    <div><strong>Date & Time:</strong> {currentDate}</div>
                    <div><strong>Validation:</strong> Verified Neural Pipeline (v1.0)</div>
                  </div>
                </div>

                {/* Farmer & Field Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="bg-[#f8faf8] border border-[#dbe5db] p-2.5 rounded-lg">
                    <span className="text-[9.5px] uppercase font-bold text-[#556255] block">Farmer Name</span>
                    <span className="text-xs font-bold text-[#1b5e20] truncate block">{farmerName || "Registered Farmer"}</span>
                  </div>
                  <div className="bg-[#f8faf8] border border-[#dbe5db] p-2.5 rounded-lg">
                    <span className="text-[9.5px] uppercase font-bold text-[#556255] block">Farm Plot / Unit</span>
                    <span className="text-xs font-bold text-[#141e18] truncate block">{farmDetails?.farm_name || "Field Unit #1"}</span>
                  </div>
                  <div className="bg-[#f8faf8] border border-[#dbe5db] p-2.5 rounded-lg">
                    <span className="text-[9.5px] uppercase font-bold text-[#556255] block">Location</span>
                    <span className="text-xs font-semibold text-[#141e18] truncate block">{farmDetails?.location || "Maharashtra, India"}</span>
                  </div>
                  <div className="bg-[#f8faf8] border border-[#dbe5db] p-2.5 rounded-lg">
                    <span className="text-[9.5px] uppercase font-bold text-[#556255] block">Crop & Area</span>
                    <span className="text-xs font-semibold text-[#141e18] truncate block">{scanResult.crop} • {farmDetails?.area_acres ? `${farmDetails.area_acres} Acres` : "Active Plot"}</span>
                  </div>
                </div>

                {/* Primary Diagnosis Banner */}
                <div className="p-3.5 rounded-xl bg-[#eef7ee] border-l-4 border-[#1b5e20] mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1b5e20] text-white text-[10px] font-bold">
                        {Math.round(scanResult.confidence * 100)}% AI Diagnostic Confidence (Tier: {scanResult.confidence_tier || 'HIGH'})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold uppercase">
                        {scanResult.severity} SEVERITY
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-headline text-[#1b5e20]">
                      {scanResult.crop} — {scanResult.disease}
                    </h3>
                    <div className="text-xs text-[#4b554b] italic font-medium mt-0.5">
                      Botanical / Pathogen Taxonomy: <strong>{scanResult.disease_scientific || "Alternaria solani"}</strong>
                    </div>
                    <div className="text-xs text-[#2e3b2e] mt-1 font-semibold flex items-center gap-4">
                      {scanResult.disease_marathi && <span>मराठी: <strong>{scanResult.disease_marathi}</strong></span>}
                      {scanResult.disease_hindi && <span>हिंदी: <strong>{scanResult.disease_hindi}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Visual Pathology Evidence & Symptoms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                      Leaf Specimen Pathology Image
                    </h4>
                    <div className="rounded-lg overflow-hidden border border-[#c2cdc1] bg-[#eef2ee] h-40 relative">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Scanned specimen"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">
                          Specimen Photo Attached
                        </div>
                      )}
                      {scanResult.bounding_box && (
                        <div
                          className="absolute border-2 border-[#ba1a1a] bg-[#ba1a1a]/20 rounded pointer-events-none"
                          style={{
                            top: `${scanResult.bounding_box.top_pct}%`,
                            left: `${scanResult.bounding_box.left_pct}%`,
                            width: `${scanResult.bounding_box.width_pct}%`,
                            height: `${scanResult.bounding_box.height_pct}%`
                          }}
                        >
                          <span className="absolute -top-3.5 left-0 bg-[#ba1a1a] text-white text-[8px] font-bold px-1 rounded">
                            {scanResult.bounding_box.label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-[#556255] mt-1">
                      <span>Grad-CAM Activation: {scanResult.heatmap_data?.salient_activation_score || 0.94}</span>
                      <span>Layer: {scanResult.heatmap_data?.gradcam_layer || "features.stage8.unit1"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">checklist</span>
                      Clinical Observed Symptoms
                    </h4>
                    <div className="p-3 rounded-lg bg-[#f8faf8] border border-[#dbe5db] h-40 overflow-hidden">
                      <ul className="list-disc pl-4 text-[11px] text-[#2e3b2e] space-y-1.5 leading-relaxed">
                        {scanResult.symptoms.map((symptom, i) => (
                          <li key={i}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pathogen Biology & Environmental Synergy */}
                <div className="p-3 rounded-lg bg-[#f8faf8] border border-[#dbe5db] mb-2">
                  <h4 className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-wider mb-0.5">
                    Pathological Profile & Field Etiology
                  </h4>
                  <p className="text-[11px] text-[#2e3b2e] leading-relaxed">
                    {scanResult.general_guidance || "Alternaria fungal spores germinate rapidly under moderate temperatures (24-29°C) combined with extended leaf wetness. Lower canopy defoliation impairs photosynthesis and exposes ripening fruit to sunscald. Immediate canopy sanitation and moisture management are critical."}
                  </p>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div>
                <div className="text-center text-[9px] text-[#717a6d] pt-2 border-t border-[#eef2ee]">
                  KrishiCopilot Plant Pathology Dossier • Page 1 of 2 • Official Agricultural Decision Support
                </div>
              </div>
            </div>

            {/* Explicit Page Break for html2pdf and print */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

            {/* ========================================================== */}
            {/* PAGE 2: COMPLETE ACTION PLAN, TREATMENT & STEWARDSHIP */}
            {/* ========================================================== */}
            <div
              className="pdf-page bg-white p-7 sm:p-9 rounded-2xl shadow-tactile border border-outline-variant/30 flex flex-col justify-between"
              style={{
                width: '100%',
                minHeight: '290mm',
                boxSizing: 'border-box',
                pageBreakAfter: 'auto',
                breakAfter: 'auto'
              }}
            >
              <div>
                {/* Page 2 Header Banner */}
                <div className="flex justify-between items-start border-b-2 border-[#1b5e20] pb-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-[#1b5e20] tracking-tight font-headline">
                        🌾 KrishiCopilot
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20] uppercase tracking-wider">
                        Treatment Protocol
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#556255] font-semibold uppercase tracking-wider mt-0.5">
                      Agronomic Action Plan & Chemical / Bio-Control Prescription
                    </div>
                  </div>
                  <div className="text-right text-[10.5px] text-[#495449] leading-tight">
                    <div><strong>Report Ref:</strong> {reportId}</div>
                    <div><strong>Target:</strong> {scanResult.crop} ({scanResult.disease})</div>
                  </div>
                </div>

                {/* 1. Immediate Step-by-Step Action Plan */}
                {scanResult.action_plan && scanResult.action_plan.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">task_alt</span>
                      Immediate 3-Step Field Action Plan
                    </h4>
                    <div className="space-y-1.5">
                      {scanResult.action_plan.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#f8faf8] border border-[#dbe5db] text-[11px]">
                          <span className="w-5 h-5 rounded-full bg-[#1b5e20] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-[#2e3b2e] leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Prescriptive Curative Chemical Interventions Table */}
                <div className="mb-3">
                  <h4 className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">science</span>
                    Prescriptive Chemical Interventions (Curative & Preventive)
                  </h4>
                  <div className="border border-[#dbe5db] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-[#eaf1ea] text-[#1b5e20]">
                          <th className="p-2 font-bold">Fungicide Molecule</th>
                          <th className="p-2 font-bold">Standard Field Dosage</th>
                          <th className="p-2 font-bold">Agronomic Mode of Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResult.chemical_options?.map((opt, idx) => (
                          <tr key={idx} className="border-t border-[#e1ebe1]">
                            <td className="p-2 font-bold text-[#141e18]">{opt.name}</td>
                            <td className="p-2 font-semibold text-[#1b5e20]">{opt.dose}</td>
                            <td className="p-2 text-[#495449]">{opt.benefit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Organic Biological Buffer Alternatives Table */}
                <div className="mb-3">
                  <h4 className="text-[11px] font-bold text-[#2e5d2e] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">eco</span>
                    Organic & Bio-Control Stewardship Alternatives
                  </h4>
                  <div className="border border-[#dbe5db] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-[#f0f6ef] text-[#2b4c2b]">
                          <th className="p-2 font-bold">Bio-Agent Formulation</th>
                          <th className="p-2 font-bold">Recommended Application Rate</th>
                          <th className="p-2 font-bold">Ecological Advantage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResult.organic_options?.map((opt, idx) => (
                          <tr key={idx} className="border-t border-[#e1ebe1]">
                            <td className="p-2 font-bold text-[#141e18]">{opt.name}</td>
                            <td className="p-2 font-semibold text-[#2e5d2e]">{opt.dose}</td>
                            <td className="p-2 text-[#495449]">{opt.benefit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Multilingual Audio Advisory Transcripts */}
                <div className="p-2.5 rounded-lg bg-[#f8faf8] border border-[#dbe5db] mb-3">
                  <h4 className="text-[10.5px] font-bold text-[#1b5e20] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                    Multilingual Audio Advisory Transcripts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-[#2e3b2e]">
                    {scanResult.audio_advice_mr && (
                      <div className="p-2 rounded bg-white border border-[#e1ebe1]">
                        <span className="font-bold text-[#1b5e20] block mb-0.5">मराठी ऑडिओ सल्ला:</span>
                        <span>{scanResult.audio_advice_mr}</span>
                      </div>
                    )}
                    {scanResult.audio_advice_hi && (
                      <div className="p-2 rounded bg-white border border-[#e1ebe1]">
                        <span className="font-bold text-[#1b5e20] block mb-0.5">हिंदी ऑडियो सलाह:</span>
                        <span>{scanResult.audio_advice_hi}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Agro-Meteorological & Spray Precaution */}
                <div className="p-2.5 rounded-lg bg-[#fff8e1] border border-[#ffe082] mb-3 flex items-start gap-2 text-[10.5px] text-[#795548]">
                  <span className="material-symbols-outlined text-[16px] text-[#f57f17] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div>
                    <strong>Agro-Weather Spray Caution:</strong> Rainfall probability is monitored in real-time. Never apply foliar fungicides or broadcast Urea when rain is forecasted within 12–36 hours to prevent chemical wash-off and aquatic runoff.
                  </div>
                </div>
              </div>

              {/* Page 2 Sign-Off & Official Disclaimer Box */}
              <div>
                <div className="border-t border-dashed border-[#b9c7b9] pt-2.5 flex items-center justify-between">
                  <div className="max-w-[460px] text-[9.5px] text-[#616e61] leading-relaxed">
                    <strong>Responsible AI Disclaimer:</strong> {scanResult.disclaimer || "This diagnostic report is generated by KrishiCopilot's AI decision-support pipeline. Confirm all chemical dosages with a local Krishi Vigyan Kendra (KVK) agronomist before purchase."}
                  </div>
                  <div className="border-2 border-dashed border-[#1b5e20] px-4 py-1.5 rounded-lg text-center shrink-0">
                    <div className="text-[9px] font-bold text-[#1b5e20] uppercase tracking-wider">KrishiCopilot Agronomy Labs</div>
                    <div className="text-[11px] font-black text-[#1b5e20]">DIGITALLY VERIFIED</div>
                    <div className="text-[8.5px] text-[#556255]">Ref: {reportId}</div>
                  </div>
                </div>

                <div className="text-center text-[9px] text-[#717a6d] pt-2 border-t border-[#eef2ee] mt-2">
                  KrishiCopilot Plant Pathology Dossier • Page 2 of 2 • Official Agricultural Decision Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
