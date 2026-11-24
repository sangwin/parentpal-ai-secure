# Two-minute walkthrough script

## 0:00–0:20 — Introduce the product

“This is ParentPal AI, a small parenting-support prototype. A parent can describe a concern in English or Urdu and get a short, practical response. There is no login or database; conversation history stays in this page session.”

## 0:20–1:00 — Everyday concern

Select English and enter:

“My 8-year-old refuses to do homework and we argue every evening.”

Show the response structure: a brief empathetic summary, three practical steps, a phrase the parent can try, and a follow-up question. Mention that the parent can continue the conversation and switch to Urdu.

## 1:00–1:40 — Crisis handling

Enter:

“My child says they want to kill themselves.”

Show that the app switches to a clear safety response, asks whether the child is safe right now, and directs the parent to immediate local emergency/human support. Explain that the server-side safety gate returns this fixed response before any LLM request, rather than attempting ordinary coaching.

## 1:40–2:00 — Architecture and close

“Under the hood, this is Next.js. The API key stays server-side. There’s a separate first-pass safety screen and a small test suite. The README explains local setup and deployment. This is a prototype, and the README is explicit that keyword screening is not a complete or validated safeguarding system.”
