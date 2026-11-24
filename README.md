# ParentPal AI

A small bilingual (English/Urdu) parenting-coach prototype built with Next.js. A parent can describe an everyday concern and receive a brief, structured plan with a follow-up check-in. A deterministic first-pass safety screen routes detected emergency and abuse disclosures to a safety response rather than the language model.

## Features

- English and Urdu interface and responses (Urdu uses RTL layout).
- Concise coach response: empathy, practical steps, a sample phrase, and a follow-up.
- Conversation history held in browser memory only. Refreshing the page clears it.
- No login and no database.
- Server-side OpenAI API call; the API key is never sent to the browser.
- Crisis and abuse keyword screening before an LLM request.
- Local safety-screen tests.

## Requirements

- Node.js 20.9 or newer
- npm
- An OpenAI API key for live AI responses (optional for the demo fallback)

## Run locally

```bash
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Choose a model enabled for your OpenAI account. Then run:

```bash
npm run dev
```

Open http://localhost:3000.

If `OPENAI_API_KEY` is not configured, everyday concerns use a fixed demo response. Crisis and abuse detections still use the local safety response and do not require an API key.

## Test the safety screen

```bash
npm test
```

Try these examples in the app:

1. Everyday: “My 8-year-old refuses to do homework and we argue every evening.”
2. Urdu everyday: “میرا بچہ ہوم ورک کرنے سے انکار کرتا ہے”
3. Crisis: “My child says they want to kill themselves.”
4. Abuse: “Someone is sexually abusing my child.”

The crisis/abuse path should respond immediately with human-support guidance and should not call the OpenAI API.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` and (optionally) `OPENAI_MODEL` under Project Settings → Environment Variables.
4. Deploy.

Do not commit `.env.local` or expose the API key in client-side code.

## Safety design and limitations

This is a prototype, not a clinical, legal, child-protection, or emergency service. It does not diagnose or provide medical/legal instructions. The server performs a small deterministic keyword screen for selected English and Urdu crisis/abuse phrases before any model call. When a phrase matches, the app returns a fixed safety response and does not send that concern to the LLM. Other concerns are passed to the model with strict safety instructions; sensitive topics receive a reminder to seek qualified support.

**Important limitations:** keyword screening can miss indirect, misspelled, contextual, or unfamiliar-language disclosures and can also flag benign wording. It is not a validated risk classifier. Before any real-world launch, expand and independently evaluate multilingual safety coverage, add expert review and localized crisis resources, conduct adversarial testing, define privacy/retention policies, and obtain appropriate child-safety/legal review. Do not present this prototype as safeguarding coverage or rely on it as the only safety control.

## Architecture

- `app/page.js` — responsive chat UI, language switch, client-side conversation history.
- `app/api/coach/route.js` — server API route, input validation, safety gate, OpenAI request and response validation.
- `lib/safety.js` — deterministic English/Urdu safety patterns and fixed crisis replies.
- `tests/safety.test.js` — small regression test suite.

## Coding-agent disclosure

Suggested submission note (edit this to match what you actually used):

> I used ChatGPT as a coding assistant to help scaffold the Next.js app, draft the bilingual UI and API route, and review the safety flow. I reviewed and integrated the generated code, then ran the local safety tests and manually checked the everyday and crisis demo scenarios. The safety rules are implemented in a separate server-side screening layer rather than relying only on the model prompt.

Only claim tools or tests you actually used. The app has not been independently audited or clinically validated.

## AI safety and security (defense in depth)

This prototype uses multiple independent checks. None is a validated child-safeguarding system, and it must not be represented as one.

1. **Deterministic pre-screen:** English and Urdu patterns identify selected emergency and abuse disclosures before the coaching model is called. Crisis responses are generated locally and bypass the LLM.
2. **OpenAI Moderation API:** When an API key is configured, the concern is screened with `omni-moderation-latest` before generation. If moderation is unavailable, the endpoint fails closed and does not call the coach model.
3. **Prompt-injection resistance:** Parent input is explicitly treated as untrusted data. Client-supplied conversation history is not passed to the model, so a forged assistant message cannot override system instructions.
4. **Constrained generation:** Low temperature, a token cap, JSON output mode, strict field/length validation, and a narrow response schema reduce unexpected output.
5. **Output checks:** Generated advice is checked for selected unsafe patterns and sent through moderation again before it is returned. Invalid or suspicious output is replaced with a fixed generic fallback.
6. **API protections:** Request size and content type are checked, a basic process-local rate limit is applied, upstream requests time out, and responses are marked `no-store`.

### Important production limitations

- The keyword patterns are incomplete and can miss euphemisms, misspellings, context, dialects, and Urdu variants. They can also produce false positives. Moderation models also make mistakes, especially across languages and nuanced safeguarding scenarios.
- A process-local rate limiter is only a demo safeguard. Replace it with a shared Redis/KV limiter or enforce rate limits at a trusted API gateway before public deployment. Ensure your hosting proxy controls forwarded-IP headers; do not trust arbitrary client-supplied IP headers.
- Use a dedicated, least-privilege API key, set provider spending limits/alerts, rotate leaked keys immediately, and never put secrets in `NEXT_PUBLIC_*` variables or browser code.
- Do not log raw parent concerns or model outputs. Keep analytics and error logs free of children's names, contact details, school names, and other identifying information.
- Add a privacy notice, retention policy, abuse-reporting path, human safeguarding escalation process, and jurisdiction-specific review before real families use this service.
- This app is not for emergencies. If a person is in immediate danger, they should contact local emergency services or go to an emergency department. Do not deploy this as a substitute for professional care or child-protection services.

### AI safety tests

Run `npm test` to execute deterministic unit tests for English/Urdu risk phrases, moderation mapping, and unsafe generated-output checks. These tests do not prove the classifier is safe. Before launch, conduct a human-reviewed red-team evaluation with native Urdu speakers and child-safeguarding professionals, including indirect disclosures, negation, quoted text, misspellings, code-switching, prompt injection, and benign mentions of violence or self-harm.
