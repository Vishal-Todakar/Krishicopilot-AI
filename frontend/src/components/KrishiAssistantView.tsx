import React, { useState, useEffect, useRef } from 'react';
import { Language, ChatMessage } from '../types';
import { TRANSLATIONS } from '../translations';
import { api } from '../api';

interface KrishiAssistantViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  farmContext?: any;
}

export const KrishiAssistantView: React.FC<KrishiAssistantViewProps> = ({
  language,
  onLanguageChange,
  farmContext
}) => {
  const t = TRANSLATIONS[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: language === 'mr'
        ? "नमस्ते रामपालजी! मी तुमचा कृषी कोपायलट एआय सहाय्यक आहे. आपल्या पिकांचे रोग, हवामान अंदाज, सिंचन किंवा सरकारी योजनांविषयी काहीही विचारा."
        : language === 'hi'
        ? "नमस्ते रामपाल जी! मैं आपका कृषि कोपायलट एआई सहायक हूँ। अपनी फसल, खाद, पानी, रोग या सरकारी योजनाओं के बारे में कोई भी सवाल पूछें।"
        : "Namaste! I am your KrishiCopilot AI farming assistant. Ask me anything about crop diseases, weather risks, irrigation, or government subsidies.",
      language: language,
      time: "10:40 AM"
    }
  ]);

  const quickQuestions: Record<Language, string[]> = {
    mr: [
      "माझ्या टोमॅटोच्या पानांवर काळे डाग आहेत, काय करावे?",
      "गव्हाला पहिले पाणी कधी द्यावे व युरिया किती टाकावा?",
      "पुढच्या दोन दिवसांत पाऊस पडणार आहे का?",
      "पीएम-कुसुम सोलर पंप योजनेचा लाभ कसा घ्यावा?"
    ],
    hi: [
      "टमाटर की पत्तियों पर काले धब्बे दिख रहे हैं, क्या करें?",
      "गेहूं में पहला पानी कब लगाना चाहिए और यूरिया कितना डालें?",
      "क्या अगले दो दिनों में भारी बारिश का अनुमान है?",
      "पीएम कुसुम 75% सोलर पंप सब्सिडी के लिए कैसे आवेदन करें?"
    ],
    en: [
      "Dark spots on tomato leaves, what should I do?",
      "When is the first irrigation stage for wheat?",
      "Is heavy rain forecasted in next 48 hours?",
      "How to apply for PM-KUSUM 75% solar pump subsidy?"
    ]
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      language: language,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");

    try {
      const response = await api.chatWithAssistant(textToSend, language, farmContext?.id);
      const asstMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: response.message,
        language: response.detected_language || language,
        sources: response.sources || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, asstMsg]);

      // Automatically speak short snippet
      if (response.audio_text && 'speechSynthesis' in window) {
        speakResponse(asstMsg.id, response.audio_text, asstMsg.language);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakResponse = (id: string, text: string, lang: Language) => {
    if (isSpeaking === id) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(null);
      return;
    }

    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col pb-36 pt-20 px-4 max-w-4xl mx-auto w-full min-h-[90vh]">
      {/* Language Quick Pills Sticky Header */}
      <div className="sticky top-16 z-20 py-2 bg-[#f1fcf3]/95 backdrop-blur-md flex items-center justify-between border-b border-outline-variant/30 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-3 py-1 rounded-full text-xs font-headline font-bold transition-all ${
              language === 'hi'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('mr')}
            className={`px-3 py-1 rounded-full text-xs font-headline font-bold transition-all ${
              language === 'mr'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            मराठी (Marathi)
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-full text-xs font-headline font-bold transition-all ${
              language === 'en'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            English
          </button>
        </div>

        <span className="text-[11px] font-headline text-primary font-bold hidden sm:inline">
          {farmContext?.farm_name || "Todakar Farm"}
        </span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
        {quickQuestions[language].map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs font-headline font-medium hover:border-primary active:scale-95 transition-all truncate max-w-[280px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex flex-col gap-4 flex-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[92%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 px-1">
              {msg.sender === 'assistant' ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[13px] text-on-primary">
                      psychology
                    </span>
                  </div>
                  <span className="text-xs font-headline font-bold text-primary">
                    KrishiCopilot AI
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px] font-headline font-bold">
                    RAG Grounded
                  </span>
                </>
              ) : (
                <span className="text-xs text-on-surface-variant font-medium">You</span>
              )}
            </div>

            <div
              className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-surface-container-high text-on-surface rounded-br-sm'
                  : 'bg-surface-container-lowest text-on-surface rounded-bl-sm border border-outline-variant/30 shadow-tactile'
              }`}
            >
              {/* Audio Play Trigger for Assistant */}
              {msg.sender === 'assistant' && (
                <div className="mb-2.5 p-2 rounded-xl bg-primary-container text-on-primary flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakResponse(msg.id, msg.text, msg.language)}
                      className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSpeaking === msg.id ? 'pause' : 'volume_up'}
                      </span>
                    </button>
                    <span className="text-xs font-headline font-bold text-on-primary">
                      {language === 'mr' ? 'ऑडिओ ऐका (मराठी)' : language === 'hi' ? 'ऑडियो सलाह सुनें' : 'Listen HD Voice Advice'}
                    </span>
                  </div>
                  <span className="text-[10px] font-headline uppercase px-1.5 py-0.2 rounded bg-primary text-secondary-fixed font-bold">
                    HD Voice
                  </span>
                </div>
              )}

              {/* Message text with whitespace preserving */}
              <p className="text-xs sm:text-sm whitespace-pre-line font-medium leading-relaxed">
                {msg.text}
              </p>

              {/* Verified Sources Citations Card */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex flex-col gap-1.5">
                  <span className="text-[11px] font-headline font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      verified
                    </span>
                    {t.sourcesCited}
                  </span>
                  <div className="flex flex-col gap-1">
                    {msg.sources.map((src, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold text-on-surface truncate">{src.title}</span>
                          <span className="text-on-surface-variant truncate">{src.source_name} • {src.category}</span>
                        </div>
                        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">
                          open_in_new
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[10px] text-on-surface-variant px-1 font-medium">
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Voice & Text Input Box */}
      <div className="fixed bottom-16 inset-x-0 p-3 bg-[#f1fcf3]/95 backdrop-blur-xl border-t border-[#dae5dc] z-40 max-w-4xl mx-auto">
        {isListening && (
          <div className="mb-2 p-2 rounded-xl bg-primary text-on-primary flex items-center justify-between text-xs font-headline animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
              <span>{t.speechInputPrompt}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              className="text-[11px] underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-surface-container-lowest rounded-2xl p-1.5 pl-3 border border-outline-variant/40 shadow-tactile-lg">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.typePlaceholder}
            className="flex-1 bg-transparent text-xs sm:text-sm font-medium outline-none text-on-surface placeholder:text-on-surface-variant/70"
          />

          {/* Voice Input Mic Trigger Button */}
          <button
            type="button"
            onClick={startVoiceInput}
            className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              isListening
                ? 'bg-error text-white animate-pulse ring-2 ring-error'
                : 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary'
            }`}
            title="Speech-to-text voice input"
          >
            <span className="material-symbols-outlined text-[22px]">
              mic
            </span>
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all"
            title="Send query"
          >
            <span className="material-symbols-outlined text-[20px]">
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
