import { useState, useRef, useEffect } from 'react'
import { aiApi, type ChatMessage } from '@/api/ai'

const DEFAULT_SUGGESTIONS_EN = [
  'What are the eligibility criteria for Ph.D.?',
  'List of mandatory documents for E-Scrutiny',
  'Participating universities & jurisdictions',
  'How is merit calculated?',
  'Official helpline & contact information',
]

const DEFAULT_SUGGESTIONS_MR = [
  'पात्रता निकष काय आहेत?',
  'आवश्यक कागदपत्रांची यादी द्या',
  '४ कृषी विद्यापीठांची माहिती',
  'गुणदान पद्धत (Merit Scoring) काय आहे?',
  'हेल्पलाईन नंबर काय आहे?',
]

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<'mr' | 'en'>('mr')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '**नमस्कार!** मी MCAER Ph.D. प्रवेश सहाय्यक आहे. मी तुम्हाला पात्रता, आवश्यक कागदपत्रे, गुणदान पद्धत आणि प्रवेश प्रक्रियेबद्दल **मराठी** किंवा **English** मध्ये मदत करू शकतो.\n\n*Hello! How can I help you with Maharashtra Agriculture Ph.D. Admissions 2026-27?*',
    },
  ])
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS_MR)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [isOpen, messages, loading])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setLoading(true)

    try {
      const historyPayload = newHistory.slice(-6)
      const res = await aiApi.chat(text, historyPayload, lang)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            lang === 'mr'
              ? 'क्षमस्व, सर्व्हरशी संपर्क करताना अडचण आली. कृपया पुन्हा प्रयत्न करा किंवा अधिकृत हेल्पलाईन 8806612998 वर संपर्क साधा.'
              : 'Sorry, could not connect to admission assistant server. Please try again or call the official helpline at 8806612998.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const switchLanguage = (newLang: 'mr' | 'en') => {
    setLang(newLang)
    setSuggestions(newLang === 'mr' ? DEFAULT_SUGGESTIONS_MR : DEFAULT_SUGGESTIONS_EN)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-academic-navy to-emerald-800 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          aria-label="Open AI Admission Copilot"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-lg">🤖</span>
          <div className="text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider block leading-tight">
              AI Admission Copilot
            </span>
            <span className="text-3xs text-emerald-200 block">
              मराठी / English Assistant
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Admission Copilot Chat"
          className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#0B1D33] text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-2xs border border-white/10">
                🤖
              </span>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                  Ph.D. Admission Copilot
                </h3>
                <span className="text-3xs text-emerald-300 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  MCAER Admissions 2026-27
                </span>
              </div>
            </div>

            {/* Language Switch & Close */}
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-lg p-0.5 flex text-3xs font-bold border border-white/10">
                <button
                  type="button"
                  onClick={() => switchLanguage('mr')}
                  className={[
                    'px-2 py-1 rounded transition-colors cursor-pointer',
                    lang === 'mr' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-white',
                  ].join(' ')}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={[
                    'px-2 py-1 rounded transition-colors cursor-pointer',
                    lang === 'en' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-white',
                  ].join(' ')}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={[
                  'flex gap-2.5 max-w-[90%]',
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm shadow-2xs',
                    m.role === 'user' ? 'bg-emerald-700 text-white' : 'bg-[#0B1D33] text-white',
                  ].join(' ')}
                >
                  {m.role === 'user' ? '👤' : '🌾'}
                </div>

                <div
                  className={[
                    'p-3.5 rounded-2xl shadow-2xs leading-relaxed whitespace-pre-line',
                    m.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none font-medium',
                  ].join(' ')}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white p-3 rounded-xl border border-slate-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Copilot is searching official admission rules…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
              💡 Suggestions:
            </span>
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sug)}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200/80 rounded-full text-3xs font-semibold transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'mr' ? 'प्रवेशाविषयी काहीही विचारा...' : 'Ask anything about Ph.D. admissions...'}
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
            >
              Send ➔
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
