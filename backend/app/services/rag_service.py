import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

# Pre-seeded verified agricultural university and government knowledge documents
AGRICULTURAL_KNOWLEDGE_BASE = [
    {
        "id": "KB-TOM-01",
        "title": "Integrated Management of Tomato Early Blight (Alternaria solani)",
        "crop": "Tomato",
        "category": "Disease Management",
        "organization": "ICAR - Indian Institute of Vegetable Research (IIVR)",
        "source_url": "https://iivr.icar.gov.in/crop-protection/tomato-early-blight",
        "keywords": ["tomato", "early blight", "alternaria", "black spots", "leaves", "टोमॅटो", "करपा", "काळे डाग", "झुलसा"],
        "content_en": (
            "Tomato Early Blight is caused by Alternaria solani. Symptoms start as small dark brown to black spots "
            "with concentric rings on older leaves. In severe cases, extensive defoliation occurs. "
            "Cultural control: Remove and burn infected lower foliage. Ensure spacing of 60x45cm. Avoid overhead sprinkler irrigation. "
            "Biological & Organic: Spray 5% Neem Seed Kernel Extract (NSKE) or Cold-Pressed Neem Oil (10,000 ppm) at 5ml/L at first sign. "
            "Chemical control: Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin + Difenoconazole @ 1ml/L during calm morning hours."
        ),
        "content_hi": (
            "टमाटर का अगेती झुलसा (Early Blight) अल्टरनेरिया सोलेनी कवक द्वारा होता है। पत्तियों पर गोल छल्लों वाले काले-भूरे धब्बे बनते हैं। "
            "उपाय: 1. निचले संक्रमित पत्तों को तुरंत काटकर नष्ट करें। 2. तुषार सिंचाई न करें। "
            "जैविक नियंत्रण: नीम का तेल (10,000 ppm) 5 मिली प्रति लीटर पानी में मिलाकर छिड़कें। "
            "रासायनिक नियंत्रण: मैंकोजेब 75% WP (2.5 ग्राम/लीटर) या एज़ोक्सीस्ट्रोबिन + डाइफेनोकोनाज़ोल (1 मिली/लीटर) का छिड़काव करें।"
        ),
        "content_mr": (
            "टोमॅटोवरील अर्ली ब्लाइट (करपा) हा अल्टरनेरिया सोलेनी या बुरशीमुळे होतो. जुन्या पानांवर काळे-किरमिजी गोल कड्यांचे डाग पडतात. "
            "उपाययोजना: 1. झाडांची खालील बाधित पाने त्वरित काढून नष्ट करावीत. 2. पाण्याचा अतिवापर व पानांवर पाणी उडणे टाळावे. "
            "सेंद्रिय उपाय: निंबोळी तेल (10,000 ppm) 5 मिली प्रति लिटर पाण्यात मिसळून फवारावे. "
            "रासायनिक फवारणी: मॅनकोझेब 75% WP (2.5 ग्रॅम/लिटर) किंवा अझॉक्सीस्ट्रॉबिन + डायफेनोकोनॅझोल (1 मिली/लिटर) ची फवारणी करावी."
        )
    },
    {
        "id": "KB-WHT-02",
        "title": "Package of Practices for Wheat Yellow Rust & Irrigation Stages",
        "crop": "Wheat",
        "category": "Crop Protection & Water Management",
        "organization": "ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal",
        "source_url": "https://iiwbr.icar.gov.in/wheat-protection/yellow-rust",
        "keywords": ["wheat", "yellow rust", "irrigation", "water", "urea", "cri stage", "गहू", "तांबेरा", "पाणी", "गेंहू", "पीला रतुआ", "सिंचाई"],
        "content_en": (
            "Wheat requires critical irrigations: First at Crown Root Initiation (CRI) 21-25 days after sowing (DAS), "
            "second at Tillering (40-45 DAS), third at Booting (65-70 DAS). "
            "Yellow Rust (Puccinia striiformis) produces bright yellow stripes of powdery spores. "
            "Management: Avoid excessive nitrogen top-dressing. At first appearance, spray Propiconazole 25% EC @ 1ml/L (200ml/acre in 200L water)."
        ),
        "content_hi": (
            "गेहूं में पहला पानी बुवाई के 21-25 दिन बाद क्राउन रूट (CRI) अवस्था में बहुत जरूरी है। दूसरा पानी 40-45 दिन (कल्ले फूटते समय) दें। "
            "पीला रतुआ (Yellow Rust) की रोकथाम: यूरिया का अत्यधिक उपयोग न करें। लक्षण दिखने पर प्रोपिकोनाजोल 25% EC 1 मिली प्रति लीटर पानी के हिसाब से स्प्रे करें।"
        ),
        "content_mr": (
            "गव्हाला पहिले पाणी पेरणीनंतर २१ ते २५ दिवसांनी (मुकुट मुळे फुटताना - CRI Stage) देणे अत्यंत गरजेचे आहे. दुसरे पाणी ४०-४५ दिवसांनी द्यावे. "
            "पिवळा तांबेरा रोगासाठी: अति युरिया देणे टाळावे. लक्षणे दिसताच प्रोपिकोनाझोल २५% EC (१ मिली प्रति लिटर पाणी) फवारावे."
        )
    },
    {
        "id": "KB-ONION-03",
        "title": "Onion Purple Blotch & Irrigation Optimization in Maharashtra",
        "crop": "Onion",
        "category": "Vegetable Agronomy",
        "organization": "Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri",
        "source_url": "https://mpkv.ac.in/extension/onion-production-technology",
        "keywords": ["onion", "purple blotch", "thrips", "irrigation", "कांदा", "जांभळा करपा", "पाणी", "प्याज"],
        "content_en": (
            "Onion Purple Blotch is caused by Alternaria porri. High humidity and thrips infestation aggravate the disease. "
            "Stop irrigation 10-15 days prior to harvest to enhance bulb storage life. "
            "Management: Spray Mancozeb 75% WP @ 2.5g/L + Carbosulfan for thrips with a sticker/spreader."
        ),
        "content_hi": (
            "प्याज में बैंगनी धब्बा (Purple Blotch) अधिक नमी और थ्रिप्स कीट से बढ़ता है। "
            "खुदाई से 15 दिन पहले पानी देना पूरी तरह बंद कर दें ताकि प्याज भंडारण में सड़े नहीं।"
        ),
        "content_mr": (
            "कांद्यावरील जांभळा करपा (Purple Blotch) रोगाचा प्रादुर्भाव ढगाळ व दमट हवामानात जास्त होतो. "
            "कांदा काढणीच्या १०-१५ दिवस आधी पाणी बंद करावे. "
            "नियंत्रण: मॅनकोझेब २.५ ग्रॅम + स्टीकर प्रति लिटर पाण्यात मिसळून फवारावे."
        )
    },
    {
        "id": "KB-GOVT-04",
        "title": "Pradhan Mantri Krishi Sinchayee Yojana & PM-KUSUM Solar Subsidy",
        "crop": "General",
        "category": "Government Schemes",
        "organization": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "source_url": "https://pmksy.gov.in",
        "keywords": ["subsidy", "solar pump", "kusum", "drip", "अनुदान", "योजना", "सब्सिडी", "ड्रिप", "सोलर"],
        "content_en": (
            "Under PM-KUSUM, farmers receive up to 60-75% subsidy for installing standalone solar agricultural pumps (3HP to 7.5HP). "
            "Per Drop More Crop under PMKSY provides up to 55% subsidy for small and marginal farmers on drip and sprinkler micro-irrigation systems."
        ),
        "content_hi": (
            "PM-KUSUM योजना के तहत किसानों को 3 से 7.5 एचपी के सोलर पंप पर 60% से 75% तक की सब्सिडी मिलती है। "
            "ड्रिप और स्प्रिंकलर सिंचाई लगाने के लिए पीएमकेएसवाई के तहत 55% तक अनुदान उपलब्ध है।"
        ),
        "content_mr": (
            "पीएम-कुसुम (PM-KUSUM) योजनेअंतर्गत शेतकऱ्यांना सौर कृषी पंपावर ७५% पर्यंत अनुदान दिले जाते. "
            "तसेच ठिबक व तुषार सिंचन पद्धतीसाठी 'प्रति थेंब अधिक पीक' योजनेतून ५५% पर्यंत अनुदान मिळते."
        )
    }
]

class RAGAssistantService:
    """
    Agricultural RAG assistant that retrieves authoritative university / government documents
    and produces grounded, source-aware answers in Marathi, Hindi, and English.
    """

    def detect_language(self, text: str, user_preference: str = "en") -> str:
        """Detect language from script: Devanagari (Marathi vs Hindi) or English."""
        marathi_markers = ["आहे", "करावे", "नाही", "माझ्या", "टोमॅटो", "पाणी", "पिकावर", "गहू", "कांदा", "कधी", "द्यावे"]
        hindi_markers = ["है", "करें", "नहीं", "मेरे", "टमाटर", "सिंचाई", "कितना", "गेहूं", "कब", "लगाना"]

        for marker in marathi_markers:
            if marker in text:
                return "mr"
        for marker in hindi_markers:
            if marker in text:
                return "hi"

        # Check for devanagari characters
        if re.search(r'[\u0900-\u097F]', text):
            return user_preference if user_preference in ("mr", "hi") else "hi"

        return user_preference if user_preference in ("mr", "hi", "en") else "en"

    def search_knowledge_base(self, query: str, crop: Optional[str] = None) -> List[Dict[str, Any]]:
        query_words = set(re.findall(r'\w+', query.lower()))
        scored_docs = []

        for doc in AGRICULTURAL_KNOWLEDGE_BASE:
            score = 0
            # Crop match
            if crop and doc["crop"].lower() == crop.lower():
                score += 5
            # Keyword matches
            for kw in doc["keywords"]:
                if kw.lower() in query.lower():
                    score += 3
            # Content word overlap
            content_sample = (doc["content_en"] + " " + doc.get("content_hi", "") + " " + doc.get("content_mr", "")).lower()
            for qw in query_words:
                if len(qw) > 2 and qw in content_sample:
                    score += 1

            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_docs[:3]]

    def generate_response(
        self,
        query: str,
        user_language: str = "en",
        farm_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        detected_lang = self.detect_language(query, user_language)
        crop_hint = farm_context.get("primary_crop", "Tomato") if farm_context else None

        relevant_docs = self.search_knowledge_base(query, crop_hint)

        sources = []
        for doc in relevant_docs:
            sources.append({
                "title": doc["title"],
                "source_name": doc["organization"],
                "category": doc["category"],
                "url": doc["source_url"]
            })

        if not relevant_docs:
            # Fallback when no authoritative documentation is matched
            if detected_lang == "mr":
                fallback_msg = (
                    "माझ्याकडे या विषयावर कृषी विद्यापीठाचे सत्यापित दस्तऐवज उपलब्ध नाहीत. "
                    "कृपया अचूक मार्गदर्शनासाठी आपल्या जवळच्या कृषी विज्ञान केंद्रातील (KVK) कृषी तज्ज्ञांशी संपर्क साधा."
                )
            elif detected_lang == "hi":
                fallback_msg = (
                    "मेरे ज्ञानकोष में इस विशिष्ट प्रश्न के लिए आधिकारिक कृषि विश्वविद्यालय का दस्तावेज नहीं मिला। "
                    "कृपया किसी भी रासायनिक प्रयोग से पहले अपने स्थानीय कृषि विज्ञान केंद्र (KVK) के वैज्ञानिक से सलाह लें।"
                )
            else:
                fallback_msg = (
                    "I could not locate verified agricultural university documentation matching this specific query. "
                    "Please consult your local Krishi Vigyan Kendra (KVK) agronomist for verified field guidance."
                )
            return {
                "message": fallback_msg,
                "detected_language": detected_lang,
                "sources": [],
                "confidence": 0.60,
                "audio_text": fallback_msg
            }

        top_doc = relevant_docs[0]
        farm_prefix = ""
        if farm_context:
            c = farm_context.get("primary_crop", "Crop")
            s = farm_context.get("crop_stage", "Growth")
            loc = farm_context.get("location", "Farm")
            if detected_lang == "mr":
                farm_prefix = f"आपल्या {loc} येथील {c} पिकाच्या ({s} अवस्था) संदर्भात:\n\n"
            elif detected_lang == "hi":
                farm_prefix = f"आपके {loc} स्थित {c} फसल ({s} अवस्था) के संदर्भ में:\n\n"
            else:
                farm_prefix = f"Regarding your {c} crop ({s} stage) at {loc}:\n\n"

        if detected_lang == "mr":
            body = top_doc.get("content_mr", top_doc["content_en"])
            action_items = [
                "बाधित पाने किंवा भाग त्वरित काढून नष्ट करा.",
                "हवामान ढगाळ किंवा पाऊस असल्यास फवारणी टाळा.",
                "शिफारस केलेल्या प्रमाणापेक्षा जास्त खते किंवा रसायने वापरू नका."
            ]
        elif detected_lang == "hi":
            body = top_doc.get("content_hi", top_doc["content_en"])
            action_items = [
                "रोगग्रस्त पत्तों या टहनियों को तुरंत काटकर खेत से दूर नष्ट करें।",
                "मौसम देखकर ही फवारणी या सिंचाई की योजना बनाएं।",
                "कीटनाशक का प्रयोग करते समय सुरक्षात्मक मास्क और दस्ताने पहनें।"
            ]
        else:
            body = top_doc["content_en"]
            action_items = [
                "Scout the field and remove severely infected lower foliage.",
                "Delay foliar application if high winds or precipitation are forecasted.",
                "Strictly adhere to university-prescribed dosage per acre."
            ]

        full_message = f"{farm_prefix}{body}"

        return {
            "message": full_message,
            "detected_language": detected_lang,
            "sources": sources,
            "confidence": 0.95,
            "audio_text": body[:220],
            "action_items": action_items
        }

rag_service = RAGAssistantService()
