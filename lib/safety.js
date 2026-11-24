/**
 * Deterministic first-pass safety screening. This is defense-in-depth, not a
 * validated child-safeguarding classifier. When uncertain, route to human help.
 */
const PATTERNS = {
  emergency: [
    /\b(kill myself|kill themselves|suicid(?:e|al)|self[- ]?harm|hurt myself|wants? to hurt (?:himself|herself|themself)|wants? to die|cutting (?:myself|himself|herself)|end my life|overdose|can't breathe|cannot breathe|not breathing|unconscious|not waking up|severe bleeding|being attacked|in immediate danger|child is missing|i might hurt (?:my child|someone)|i want to hurt (?:my child|someone)|i am going to hurt|planning to hurt|has a weapon|threatened to kill)\b/i,
    /(خودکشی|اپنی جان|جان لے لوں|خود کو نقصان|سانس نہیں آ رہی|سانس نہیں لے پا|بے ہوش|شدید خون|فوری خطرہ|جان سے مار|خود کو مار|مر جانا چاہتا)/i
  ],
  abuse: [
    /\b(child abuse|sexually abused|sexually abusing|sexual abuse|molest(?:ed|ation)?|raped|being beaten|being hit|is being hit|being abused|hit(?:s|ting)? my child|beat(?:s|ing)? my child|abuse at home|someone is hurting my child|my child is being hurt|touching my child sexually|exploiting my child)\b/i,
    /(بچے کے ساتھ زیادتی|جنسی زیادتی|بچوں سے زیادتی|بچے کو مارتا|بچے کو مارتی|تشدد|استحصال|بچے کو جنسی)/i
  ],
  sensitive: [
    /\b(bullied|bullying|anxious|anxiety|depressed|depression|panic|grief|divorce|separation|eating disorder|not eating|school refusal|trauma|abuse|neglect|self[- ]?harm thoughts)\b/i,
    /(ہراسانی|بدمعاشی|اداسی|پریشانی|گھبراہٹ|طلاق|صدمہ|کھانا نہیں کھاتا|کھانا نہیں کھاتی|نظر انداز)/i
  ]
};

function matchesAny(text, patterns) { return patterns.some((pattern) => pattern.test(text)); }

export function screenConcern(input) {
  const text = String(input || '').normalize('NFKC').trim();
  if (matchesAny(text, PATTERNS.emergency)) return { level: 'emergency', source: 'local' };
  if (matchesAny(text, PATTERNS.abuse)) return { level: 'abuse', source: 'local' };
  if (matchesAny(text, PATTERNS.sensitive)) return { level: 'sensitive', source: 'local' };
  return { level: 'everyday', source: 'local' };
}

/** Map OpenAI moderation results to a conservative app-level risk category. */
export function classifyModeration(result = {}) {
  const c = result.categories || {};
  if (c['self-harm'] || c['self-harm/intent'] || c['self-harm/instructions'] || c['violence'] || c['violence/graphic']) {
    return { level: 'emergency', source: 'moderation' };
  }
  if (c['sexual/minors']) return { level: 'abuse', source: 'moderation' };
  if (c['harassment/threatening'] || c['hate/threatening']) return { level: 'sensitive', source: 'moderation' };
  return { level: 'everyday', source: 'moderation' };
}

export function crisisReply(language = 'en', level = 'emergency') {
  const urdu = language === 'ur';
  if (level === 'abuse') {
    return urdu
      ? 'مجھے افسوس ہے کہ یہ صورتحال پیش آ رہی ہے۔ بچے کی فوری حفاظت سب سے اہم ہے۔ اگر بچہ ابھی خطرے میں ہے تو، اگر محفوظ ہو، اسے محفوظ جگہ پر لے جائیں اور مقامی ایمرجنسی سروسز سے فوراً رابطہ کریں۔ ممکنہ طور پر ذمہ دار شخص کا سامنا نہ کریں اگر اس سے خطرہ بڑھ سکتا ہو۔ کسی قابلِ اعتماد بالغ اور مقامی بچوں کے تحفظ کی سروس سے رابطہ کریں۔ میں تفتیش یا قانونی ہدایات نہیں دے سکتا۔ کیا بچہ اس وقت محفوظ ہے؟'
      : 'I’m sorry this is happening. Your child’s immediate safety comes first. If the child is in immediate danger, move them to a safer place if you can do so safely and contact local emergency services now. Avoid confronting the person if that could increase danger. Reach out to a trusted adult and your local child-protection service. I can’t investigate abuse or provide legal instructions. Is the child safe right now?';
  }
  return urdu
    ? 'آپ کی بات اہم ہے۔ اگر کسی کو ابھی خطرہ ہے یا خود کو نقصان پہنچانے کا خدشہ ہے تو فوراً مقامی ایمرجنسی سروسز یا قریبی ہسپتال سے رابطہ کریں۔ اگر ممکن ہو تو کسی قابلِ اعتماد بالغ کو اپنے ساتھ رکھیں اور خطرناک اشیاء سے محفوظ فاصلہ بنائیں۔ میں ہنگامی خدمات کا متبادل نہیں ہوں۔ کیا آپ اور بچہ اس وقت فوری خطرے سے محفوظ ہیں؟'
    : 'Your concern matters. If anyone is in immediate danger or at risk of self-harm, contact local emergency services or go to the nearest emergency department now. If possible, stay with a trusted adult and create distance from anything that could be used to cause harm. I’m not an emergency service. Are you and your child safe from immediate danger right now?';
}

export function sensitiveNote(language = 'en') {
  return language === 'ur'
    ? 'یہ ایک مشکل صورتحال لگتی ہے۔ میں عمومی مدد دے سکتا ہوں، لیکن تشخیص یا پیشہ ورانہ علاج کا متبادل نہیں ہوں۔ اگر حفاظت متاثر ہو رہی ہے تو کسی مستند مقامی ماہر یا قابلِ اعتماد سروس سے بات کریں۔'
    : 'This sounds difficult. I can offer general support, but I can’t diagnose or replace professional care. If anyone’s safety is affected, speak with a qualified local professional or trusted support service.';
}

// Reject generated text that attempts diagnosis, medical/legal directives, or harmful discipline.
const UNSAFE_OUTPUT = [
  /\b(diagnos(?:e|is|ed)|you have (?:adhd|autism|depression|anxiety)|your child has (?:adhd|autism|depression))\b/i,
  /\b(give (?:your child )?(?:\d+\s?mg|medication|antibiotics)|change the dosage|stop taking (?:your|the) medication)\b/i,
  /\b(hit (?:your child|them)|beat (?:your child|them)|lock (?:your child|them) (?:in|away)|withhold food|deprive (?:them|your child) of sleep)\b/i,
  /\b(ignore (?:the|any) abuse|do not tell anyone about the abuse|confront the abuser)\b/i,
  /(بچے کو ماریں|دوائی کی خوراک|تشخیص کریں|کھانا بند کر دیں)/i
];
export function outputLooksUnsafe(response) {
  const text = [response?.summary, ...(Array.isArray(response?.plan) ? response.plan : []), response?.try_saying, response?.follow_up, response?.disclaimer].filter(Boolean).join(' ');
  return UNSAFE_OUTPUT.some((pattern) => pattern.test(text));
}

export function safeFallback(language = 'en') {
  return language === 'ur'
    ? { summary: 'آئیے ایک چھوٹے اور قابلِ عمل قدم سے آغاز کرتے ہیں۔', plan: ['پرسکون وقت میں بچے کی بات پوری توجہ سے سنیں۔', 'ایک وقت میں صرف ایک واضح اور آسان توقع طے کریں۔', 'اچھی کوشش کو فوراً سراہیں، چاہے نتیجہ مکمل نہ ہو۔'], try_saying: 'میں تمہاری بات سمجھنا چاہتا ہوں۔ ہم اسے مل کر حل کریں گے۔', follow_up: 'آپ کے بچے کی عمر کیا ہے، اور یہ مسئلہ کب زیادہ ہوتا ہے؟', disclaimer: 'یہ عمومی رہنمائی ہے، پیشہ ورانہ مشورے کا متبادل نہیں۔' }
    : { summary: 'Let’s start with one small, manageable step.', plan: ['Choose a calm moment and listen without interrupting.', 'Agree on one clear, realistic expectation together.', 'Notice and praise effort, even when the result is not perfect.'], try_saying: 'I want to understand what is making this hard. Let’s work on one step together.', follow_up: 'How old is your child, and when does this tend to happen most?', disclaimer: 'This is general guidance, not a substitute for professional support.' };
}
