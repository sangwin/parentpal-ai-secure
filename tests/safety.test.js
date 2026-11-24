import test from 'node:test';
import assert from 'node:assert/strict';
import { screenConcern, classifyModeration, outputLooksUnsafe } from '../lib/safety.js';

test('detects English emergency language', () => assert.equal(screenConcern('My child says they want to kill themselves').level, 'emergency'));
test('detects Urdu emergency language', () => assert.equal(screenConcern('وہ خود کو نقصان پہنچانا چاہتا ہے').level, 'emergency'));
test('detects abuse disclosures', () => assert.equal(screenConcern('Someone is sexually abusing my child').level, 'abuse'));
test('detects sensitive concerns', () => assert.equal(screenConcern('My daughter is being bullied at school').level, 'sensitive'));
test('does not escalate an everyday concern', () => assert.equal(screenConcern('My son refuses to do his homework').level, 'everyday'));
test('moderation flags self-harm as emergency', () => assert.equal(classifyModeration({ categories: { 'self-harm/intent': true } }).level, 'emergency'));
test('moderation flags sexual content involving minors as abuse', () => assert.equal(classifyModeration({ categories: { 'sexual/minors': true } }).level, 'abuse'));
test('does not flag benign moderation result', () => assert.equal(classifyModeration({ categories: {} }).level, 'everyday'));
test('rejects generated diagnostic advice', () => assert.equal(outputLooksUnsafe({ summary: 'Your child has ADHD', plan: [] }), true));
test('rejects harmful discipline advice', () => assert.equal(outputLooksUnsafe({ summary: 'Try this', plan: ['Hit your child when they refuse'] }), true));
test('allows ordinary supportive output', () => assert.equal(outputLooksUnsafe({ summary: 'That sounds hard', plan: ['Listen calmly'] }), false));
