import { useEffect, useRef, useState } from 'react';
import { Brain, ChevronDown, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { useTenant } from '../context/TenantContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/fleet': 'Live Fleet',
  '/drivers': 'Drivers',
  '/incidents': 'Incidents',
  '/safety': 'Safety',
  '/fuel': 'Fuel',
  '/dispatch': 'Dispatch',
  '/trips': 'Trips',
  '/operations': 'Operations',
  '/maintenance': 'Maintenance',
  '/reports': 'Reports',
  '/aria': 'AI Insights',
  '/settings': 'Settings',
};

const SUGGESTED_PROMPTS = [
  'Which driver needs attention most urgently right now?',
  'What are the top safety risks this week?',
  'Summarise current fleet status.',
  'What actions should I take today?',
];

function demoReply(
  question: string,
  metadata: { totalVehicles: number; moving: number; parked: number; idle: number; offline: number; inactive: number; panic: number },
  safetyScore: number,
  drivers: { name: string; score: number }[],
): string {
  const q = question.toLowerCase();
  if (q.includes('driver') || q.includes('attention')) {
    const worst = [...drivers].sort((a, b) => a.score - b.score)[0];
    return `**${worst.name}** needs the most attention with a safety score of **${worst.score}/100**.\n\nRecommended actions:\n- Schedule a coaching session this week\n- Review recent harsh braking events\n- Compare against fleet average of ${safetyScore}`;
  }
  if (q.includes('risk') || q.includes('safety')) {
    return `Top safety risks this week:\n\n- **Harsh braking** events trending up on quarry routes\n- **${metadata.panic}** active panic alert(s) requiring response\n- **${metadata.moving}** vehicles moving — monitor overspeed in wet conditions\n\nFleet safety score: **${safetyScore}/100**`;
  }
  if (q.includes('summar') || q.includes('status') || q.includes('fleet')) {
    return `**Fleet snapshot**\n\n- Total vehicles: **${metadata.totalVehicles}**\n- Moving: **${metadata.moving}** | Parked: **${metadata.parked}** | Idle: **${metadata.idle}**\n- Offline/Inactive: **${metadata.offline + metadata.inactive}**\n- Safety score: **${safetyScore}/100**`;
  }
  return `Based on current fleet data, I recommend prioritising **panic response**, **maintenance due within 7 days**, and **driver coaching** for scores below 60.\n\nConnect **ANTHROPIC_API_KEY** on the server for live AI analysis when you wire the API layer.`;
}

export default function ARIAChat() {
  const { isEnabled } = useTenant();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { metadata, safetyScore, drivers, alerts } = useFleet();

  const currentPage = PAGE_LABELS[location.pathname] || 'Dashboard';
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isEnabled('aria')) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const reply = demoReply(text, metadata, safetyScore, drivers);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        className="bpl-aria-fab"
        onClick={() => setOpen(o => !o)}
        title="Open ARIA"
      >
        {open ? <ChevronDown size={22} /> : <Brain size={22} />}
      </button>

      <div className={`bpl-aria-drawer${open ? ' open' : ''}`}>
        <div className="bpl-aria-drawer-header">
          <div className="bpl-aria-drawer-title">
            <div className="bpl-aria-icon-wrap">
              <Brain size={16} color="#60b4ff" />
            </div>
            <div>
              <div className="bpl-aria-name">ARIA</div>
              <div className="bpl-aria-tagline">Asset & Risk Intelligence Advisor</div>
            </div>
          </div>
          <button type="button" className="bpl-aria-close" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="bpl-aria-context-strip">
          <span>Score: <strong className={safetyScore >= 80 ? 'good' : safetyScore >= 60 ? 'warn' : 'bad'}>{safetyScore}/100</strong></span>
          <span>Active: <strong>{metadata.moving}</strong></span>
          {criticalAlerts > 0 && <span className="critical">Alerts: <strong>{criticalAlerts}</strong></span>}
          <span className="page">{currentPage}</span>
        </div>

        <div className="bpl-aria-messages">
          {messages.length === 0 && !loading && (
            <div className="bpl-aria-empty">
              <div className="bpl-aria-empty-icon">
                <Brain size={22} color="var(--bpl-blue)" />
              </div>
              <div className="bpl-aria-empty-title">ARIA is ready</div>
              <div className="bpl-aria-empty-sub">Ask about drivers, incidents, safety, or fleet status.</div>
              <div className="bpl-aria-prompts">
                {SUGGESTED_PROMPTS.map(p => (
                  <button key={p} type="button" onClick={() => sendMessage(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`bpl-aria-msg bpl-aria-msg-${msg.role}`}>
              {msg.role === 'assistant' && <div className="bpl-aria-msg-label">ARIA</div>}
              <div className={`bpl-aria-bubble bpl-aria-bubble-${msg.role}`}>
                {msg.content.split('\n').map((line, li) => (
                  <div key={li}>{line.replace(/\*\*(.+?)\*\*/g, '$1')}</div>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bpl-aria-msg bpl-aria-msg-aria">
              <div className="bpl-aria-msg-label">ARIA</div>
              <div className="bpl-aria-bubble bpl-aria-bubble-aria bpl-aria-bubble-typing">
                <div className="bpl-aria-typing-dot" />
                <div className="bpl-aria-typing-dot" />
                <div className="bpl-aria-typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bpl-aria-input-area">
          <textarea
            className="bpl-aria-input"
            placeholder="Ask ARIA anything about the fleet..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            rows={1}
          />
          <button
            type="button"
            className="bpl-aria-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
