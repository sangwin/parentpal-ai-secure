'use client';

import { useMemo, useRef, useState } from 'react';

const STARTERS = [
  { icon: '📚', en: 'My child refuses to do homework', ur: 'میرا بچہ ہوم ورک کرنے سے انکار کرتا ہے' },
  { icon: '📱', en: 'Screen time is becoming a daily argument', ur: 'اسکرین ٹائم پر روزانہ بحث ہوتی ہے' },
  { icon: '🌧️', en: 'My child gets upset over small things', ur: 'میرا بچہ چھوٹی باتوں پر پریشان ہو جاتا ہے' }
];

function Message({ item, language }) {
  const isUser = item.role === 'user';
  const data = item.response;
  return (
    <div className={`message-row ${isUser ? 'user-row' : 'coach-row'}`}>
      {!isUser && <div className="avatar coach-avatar">✦</div>}
      <div className={`bubble ${isUser ? 'user-bubble' : 'coach-bubble'}`}>
        {isUser ? <p>{item.content}</p> : (
          <>
            {data?.summary && <p className="response-summary">{data.summary}</p>}
            {data?.plan?.length > 0 && <div className="plan-block"><div className="eyebrow">{language === 'ur' ? 'آپ کیا کر سکتے ہیں' : 'A PLAN TO TRY'}</div><ol>{data.plan.map((step, index) => <li key={index}>{step}</li>)}</ol></div>}
            {data?.try_saying && <div className="say-block"><div className="eyebrow">{language === 'ur' ? 'یہ کہہ کر دیکھیں' : 'TRY SAYING'}</div><p>“{data.try_saying}”</p></div>}
            {data?.follow_up && <div className="follow-block"><span>↳</span><div><div className="eyebrow">{language === 'ur' ? 'اگلا قدم' : 'CHECK-IN'}</div><p>{data.follow_up}</p></div></div>}
            {data?.disclaimer && <p className="disclaimer">{data.disclaimer}</p>}
            {item.mode === 'crisis' && <div className="crisis-label">{language === 'ur' ? 'فوری انسانی مدد ضروری ہو سکتی ہے' : 'IMMEDIATE HUMAN SUPPORT MAY BE NEEDED'}</div>}
          </>
        )}
      </div>
      {isUser && <div className="avatar user-avatar">You</div>}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState('en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const isUrdu = language === 'ur';
  const copy = useMemo(() => isUrdu ? {
    tag: 'والدین کے لیے ایک پُرسکون ساتھی', title: 'والدین بننا آسان نہیں۔', title2: 'اگلا قدم ہم مل کر سوچتے ہیں۔', intro: 'اپنی پریشانی بتائیں۔ ہم ایک وقت میں ایک چھوٹا، قابلِ عمل قدم تلاش کریں گے۔', prompt: 'آج آپ کے ذہن میں کیا ہے؟', placeholder: 'مثلاً: میرا بچہ سونے کے وقت بہت ضد کرتا ہے…', button: 'رہنمائی حاصل کریں', thinking: 'سوچ رہا ہوں…', privacy: 'آپ کی گفتگو صرف اس صفحے پر رہتی ہے؛ اسے کسی اکاؤنٹ میں محفوظ نہیں کیا جاتا۔', starters: 'یہاں سے شروع کریں', clear: 'نئی گفتگو', language: 'زبان', safety: 'اگر کسی کو فوری خطرہ ہو تو مقامی ایمرجنسی سروسز سے رابطہ کریں۔ ParentPal ہنگامی سروس نہیں ہے۔', welcome: 'السلام علیکم! میں ParentPal ہوں۔ آپ کے بچے کی پرورش سے متعلق کس بات میں مدد چاہیے؟'
  } : {
    tag: 'A calmer parenting companion', title: 'Parenting is hard.', title2: 'Let’s find your next small step.', intro: 'Tell us what’s on your mind. We’ll work toward one practical step at a time.', prompt: 'What’s on your mind today?', placeholder: 'For example: My child has a hard time settling at bedtime…', button: 'Get a little guidance', thinking: 'Thinking…', privacy: 'Your conversation stays on this page. No account or database is used.', starters: 'A few places to start', clear: 'New conversation', language: 'Language', safety: 'If anyone is in immediate danger, contact local emergency services. ParentPal is not an emergency service.', welcome: 'Hi, I’m ParentPal. What’s one parenting challenge on your mind today?'
  }, [isUrdu]);

  async function sendMessage(text = input) {
    const concern = text.trim();
    if (!concern || loading) return;
    setError('');
    const userMessage = { role: 'user', content: concern };
    const previous = messages;
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const history = previous.slice(-8).map((m) => ({ role: m.role, content: m.role === 'user' ? m.content : JSON.stringify(m.response) }));
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ concern, language, history }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Please try again.');
      setMessages((current) => [...current, { role: 'assistant', response: data.response, mode: data.mode }]);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 60);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setMessages((current) => current.filter((m, i) => !(i === current.length - 1 && m === userMessage)));
    } finally { setLoading(false); }
  }

  function reset() { setMessages([]); setInput(''); setError(''); }

  return (
    <main className={isUrdu ? 'app-shell urdu' : 'app-shell'} dir={isUrdu ? 'rtl' : 'ltr'}>
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); reset(); }}><span className="brand-mark">✳</span><span>parentpal<span className="brand-ai">.ai</span></span></a>
        <div className="top-actions">
          <label className="language-label"><span>{copy.language}</span><select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Choose language"><option value="en">English</option><option value="ur">اردو</option></select></label>
          {messages.length > 0 && <button className="new-chat" onClick={reset}>＋ {copy.clear}</button>}
        </div>
      </header>

      {messages.length === 0 ? (
        <section className="hero">
          <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          <div className="hero-content">
            <div className="tag"><span className="tag-dot"/> {copy.tag}</div>
            <h1>{copy.title}<br/><em>{copy.title2}</em></h1>
            <p className="hero-intro">{copy.intro}</p>
            <div className="composer-card">
              <label htmlFor="concern-input">{copy.prompt}</label>
              <textarea id="concern-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={copy.placeholder} maxLength={3000} rows={3}/>
              <div className="composer-bottom"><span>{input.length}/3000</span><button className="send-button" onClick={() => sendMessage()} disabled={!input.trim() || loading}>{copy.button} <span>↗</span></button></div>
            </div>
            <div className="starter-area"><div className="starter-title">{copy.starters}</div><div className="starter-grid">{STARTERS.map((s) => <button key={s.en} className="starter" onClick={() => sendMessage(isUrdu ? s.ur : s.en)}><span>{s.icon}</span>{isUrdu ? s.ur : s.en}<b>↗</b></button>)}</div></div>
          </div>
          <div className="hero-footnote"><span>♡</span> {copy.privacy}</div>
        </section>
      ) : (
        <section className="chat-layout">
          <div className="chat-heading"><div><div className="tag"><span className="tag-dot"/> {copy.tag}</div><h2>{isUrdu ? 'ہم ایک وقت میں ایک قدم لیں گے۔' : 'One step at a time.'}</h2></div><div className="chat-mark">✳</div></div>
          <div className="conversation" ref={listRef}>
            {messages.map((item, index) => <Message key={index} item={item} language={language}/ >)}
            {loading && <div className="message-row coach-row"><div className="avatar coach-avatar">✦</div><div className="bubble coach-bubble loading-bubble"><span className="typing-dots"><i/><i/><i/></span> {copy.thinking}</div></div>}
          </div>
          {error && <div className="error-message" role="alert">{error}</div>}
          <div className="chat-composer"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={copy.placeholder} rows={2} maxLength={3000}/><button className="send-button" onClick={() => sendMessage()} disabled={!input.trim() || loading}>{copy.button} <span>↗</span></button></div>
          <p className="safety-footnote">♡ {copy.safety}</p>
        </section>
      )}
      {messages.length === 0 && <p className="safety-footnote landing-safety">♡ {copy.safety}</p>}
    </main>
  );
}
