import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const SUGGESTED = [
  'How do I register to vote in India?',
  'When is the next Lok Sabha election?',
  'Where is my nearest polling booth?',
  'What is the Model Code of Conduct?',
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    intro: "Hello! I'm your Civic Clarity India Assistant.",
    sub: 'I can help you with non-partisan information regarding:',
    list: [
      'Voter registration deadlines and requirements (EPIC card)',
      'Finding your designated polling booth via Voter Helpline 1950',
      'Understanding EVM and VVPAT procedures',
      'Important election cycle dates set by the ECI',
      "India's electoral system — Lok Sabha, Rajya Sabha, State Assemblies",
    ],
    content: null,
    time: '09:41 AM',
  },
];

const getResponse = (q) => {
  const lower = q.toLowerCase();
  if (lower.includes('register') || lower.includes('epic') || lower.includes('voter id'))
    return 'To register as a voter in India, apply online at voters.eci.gov.in or visit your local Electoral Registration Officer (ERO). Fill Form 6 and provide proof of age, identity, and address. The minimum age is 18 years. Your EPIC (Voter ID) card will be issued after verification.';
  if (lower.includes('evm') || lower.includes('electronic voting') || lower.includes('ballot'))
    return 'India uses Electronic Voting Machines (EVMs) since 2004. The EVM has two units — the Ballot Unit (voter-facing) and the Control Unit (operated by the Presiding Officer). EVMs have no internet or wireless connectivity. Since 2013, VVPAT (Voter Verifiable Paper Audit Trail) provides a paper slip showing your vote for 7 seconds for verification.';
  if (lower.includes('polling booth') || lower.includes('booth') || lower.includes('polling location'))
    return 'Find your nearest polling booth by calling Voter Helpline 1950 (toll-free), visiting voters.eci.gov.in, or using the Voter Helpline App. Your booth is assigned based on your registered address. On polling day, carry your EPIC card or any of the 12 alternative photo ID documents accepted by the ECI.';
  if (lower.includes('model code') || lower.includes('mcc'))
    return 'The Model Code of Conduct (MCC) is a set of guidelines issued by the ECI for political parties and candidates. It comes into effect from the date of election schedule announcement and remains in force until results are declared. It prohibits use of government resources for campaigning and announcement of new schemes during the election period.';
  if (lower.includes('election commission') || lower.includes('eci'))
    return 'The Election Commission of India (ECI) is an autonomous constitutional authority established under Article 324 of the Indian Constitution on January 25, 1950. It consists of the Chief Election Commissioner and two Election Commissioners. The ECI oversees all elections to Parliament and State Legislatures, enforces the Model Code of Conduct, and manages the electoral roll.';
  if (lower.includes('postal') || lower.includes('absentee'))
    return 'Service voters (Armed Forces, government employees posted outside their constituency) can vote by postal ballot. They submit Form 12 to the Returning Officer, receive a ballot paper by post, mark their vote, and return it before counting day. Service voters can also appoint a proxy to vote in person using Form 13F.';
  if (lower.includes('candidate') || lower.includes('nomination'))
    return 'To contest a Lok Sabha election, a candidate must be an Indian citizen, at least 25 years old, and a registered voter in any parliamentary constituency. They file nomination papers with the Returning Officer and pay a security deposit of ₹25,000 (₹12,500 for SC/ST candidates). Candidates can withdraw within 2 days of scrutiny.';
  if (lower.includes('campaign finance') || lower.includes('expenditure') || lower.includes('election spending'))
    return 'The ECI sets expenditure limits for candidates — ₹95 lakh for Lok Sabha in large states. Candidates must maintain daily accounts and submit expenditure statements within 30 days of results. The Model Code of Conduct prohibits use of government resources for campaigning and announcement of new schemes during elections.';
  if (lower.includes('result') || lower.includes('counting') || lower.includes('government formation'))
    return 'Vote counting begins at 8:00 AM on counting day. Postal ballots are counted first, followed by EVM votes round by round. The Returning Officer announces the winner for each constituency. For Lok Sabha, a party or alliance needs 272+ seats to form the government. The President invites the majority leader to be sworn in as Prime Minister.';
  if (lower.includes('civic') || lower.includes('rights') || lower.includes('nota') || lower.includes('duties'))
    return 'Every Indian citizen aged 18+ has the right to vote under Article 326. Your vote is completely secret — no one can ask how you voted. Since 2013, you can choose NOTA (None of the Above) on the EVM. You can report election violations via the cVIGIL app. Accepting bribes in exchange for votes is illegal and a corrupt practice.';
  if (lower.includes('explain') || lower.includes('tell me about') || lower.includes('what is')) {
    // Extract topic from the question
    const topicMatch = q.match(/"([^"]+)"/);
    if (topicMatch) {
      return `Great question about "${topicMatch[1]}"! This is an important topic in India's election process. I can help you understand the key concepts, procedures, and your rights related to this topic. What specific aspect would you like to know more about? For example, you could ask about the process, eligibility, deadlines, or how it affects you as a voter.`;
    }
  }
  return `Thank you for your question about "${q}". As your Civic Clarity India assistant, I can provide information about voter registration, election timelines, ECI guidelines, EVMs, the Model Code of Conduct, and the democratic process in India. Could you be more specific about what you'd like to know?`;
};

export default function Chat() {
  const location = useLocation();
  const topicContext = location.state; // { topicTitle, topicId } passed from TopicDetail

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const hasAutoSent = useRef(false);

  const sendMessage = useCallback((text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: getResponse(msg),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  }, [input]);

  // Scroll to top on first load so welcome message is visible
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // Auto-send a question when arriving from a topic page
  useEffect(() => {
    if (topicContext?.topicTitle && !hasAutoSent.current) {
      hasAutoSent.current = true;
      const autoQuestion = `Can you explain "${topicContext.topicTitle}" in simple terms?`;
      // Small delay so the welcome message renders first
      setTimeout(() => sendMessage(autoQuestion), 600);
    }
  }, [topicContext, sendMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 1 || typing) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  return (
    <DashboardLayout>
      {/* Full-height chat container that fills the remaining space */}
      <div className="flex flex-col bg-white border border-[#DEE2E6] rounded-lg overflow-hidden"
        style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>

        {/* ── Chat header bar ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DEE2E6] bg-surface-container-low flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div>
            <p className="font-semibold text-[14px] text-on-surface">Civic Clarity AI</p>
            <p className="text-[11px] text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
              Online · Non-Partisan
            </p>
          </div>
        </div>

        {/* Topic context banner — shown when arriving from a topic page */}
        {topicContext?.topicTitle && (
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-primary-fixed/40 border-b border-primary-fixed">
            <span className="material-symbols-outlined text-primary-container text-[18px]">library_books</span>
            <p className="text-[13px] text-on-surface flex-grow">
              Discussing: <span className="font-semibold text-primary-container">{topicContext.topicTitle}</span>
            </p>
            <Link
              to={`/topics/${topicContext.topicId}`}
              className="text-[12px] font-semibold text-primary-container hover:underline flex items-center gap-1"
            >
              Back to topic
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* ── Chat history (scrollable) ── */}
        <div
          className="flex-grow overflow-y-auto px-4 py-6 space-y-5"
          role="log"
          aria-live="polite"
          aria-label="Conversation history"
        >
          <div ref={topRef} />

          {/* Date chip */}
          <div className="flex justify-center">
            <span className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) =>
            msg.role === 'assistant' ? (
              <div key={msg.id} className="flex gap-3 max-w-[88%]">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white mt-1">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none border border-[#DEE2E6]">
                    {msg.intro && (
                      <p className="font-semibold text-[15px] text-on-surface mb-1">{msg.intro}</p>
                    )}
                    {msg.sub && (
                      <p className="text-[14px] text-on-surface-variant mb-3">{msg.sub}</p>
                    )}
                    {msg.list && (
                      <ul className="space-y-1.5">
                        {msg.list.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[14px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 flex-shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}>
                              check_circle
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {msg.content && (
                      <p className="text-[14px] text-on-surface leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-outline font-['Public_Sans'] uppercase ml-1">
                    {msg.time} · Assistant
                  </span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-row-reverse gap-3 max-w-[88%] ml-auto">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mt-1">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="bg-primary-container text-white p-4 rounded-2xl rounded-tr-none">
                    <p className="text-[14px] leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-outline font-['Public_Sans'] uppercase mr-1">
                    {msg.time} · You
                  </span>
                </div>
              </div>
            )
          )}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3 max-w-[88%]">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white opacity-50">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div
                className="flex items-center gap-1.5 bg-surface-container-low px-4 py-3 rounded-full border border-[#DEE2E6] h-10"
                aria-label="Assistant is typing"
              >
                {[0, 0.15, 0.3].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-outline rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input area (fixed at bottom) ── */}
        <div className="flex-shrink-0 border-t border-[#DEE2E6] bg-white px-4 pt-3 pb-4">
          {/* Suggested chips */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 rounded-full border border-[#DEE2E6] text-on-surface-variant text-[12px] font-medium hover:bg-surface-container hover:border-primary/30 transition-colors duration-200"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex items-end gap-2 bg-surface-container-low border border-[#DEE2E6] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#004492] focus-within:border-transparent transition-all">
            <textarea
              id="chat-input"
              name="message"
              className="flex-grow bg-transparent border-none focus:ring-0 resize-none py-2 text-[14px] text-on-surface placeholder-outline max-h-28 leading-relaxed"
              placeholder="Ask about voting in India..."
              rows={1}
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              aria-label="Type your question"
            />
            <div className="flex flex-col items-end gap-1 pb-1 flex-shrink-0">
              <span className="text-[10px] text-outline font-['Public_Sans'] uppercase">
                {input.length}/500
              </span>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="w-9 h-9 bg-primary-container text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-outline italic">
            Official Non-Partisan AI Assistant. For specific legal advice, consult your local Electoral Registration Officer.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
