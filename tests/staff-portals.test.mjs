import test from 'node:test';
import assert from 'node:assert/strict';
import { STAFF_AREAS, STAFF_ARTICLES, getStaffArticle, getStaffArticles, isStaffArea } from '../lib/staff-knowledge.ts';
import { studioEconomics, linkEconomics, pbxEconomics } from '../lib/staff-calculators.ts';

test('all three staff areas contain learning content', () => {
  assert.deepEqual(Object.keys(STAFF_AREAS).sort(), ['link','pbx','studio']);
  for (const area of ['studio','link','pbx']) assert.ok(getStaffArticles(area).length >= 2);
  assert.equal(isStaffArea('invalid'), false);
  assert.equal(isStaffArea('studio'), true);
});

test('article slugs and section anchors are safe and unique', () => {
  const paths = STAFF_ARTICLES.map(a => `${a.area}/${a.slug}`);
  assert.equal(new Set(paths).size, paths.length);
  for (const a of STAFF_ARTICLES) {
    assert.match(a.slug, /^[a-z0-9-]+$/);
    assert.ok(a.sections.length >= 2);
    assert.equal(new Set(a.sections.map(s=>s.id)).size,a.sections.length);
    assert.ok(a.checklist.length >= 4);
    assert.ok(a.quiz.correct >= 0 && a.quiz.correct < a.quiz.answers.length);
    assert.equal(getStaffArticle(a.area,a.slug),a);
    assert.ok(a.intro.length > 20);
  }
  assert.equal(getStaffArticle('studio','phone-number-economics'),undefined);
});

test('Studio profit calculator produces agreed baseline', () => {
  assert.deepEqual(studioEconomics({projects:2,subscribers:8,hours:14,setup:12900,retainer:790}),
    { revenue:32120,providerAndTime:15400,net:14720 });
});

test('Link calculator includes carrier usage and support cost', () => {
  const r=linkEconomics({users:40,price:149,numberCost:25,minutes:20,sms:10});
  assert.equal(r.revenue,5960);
  assert.ok(Math.abs(r.net-2696)<0.00001);
});

test('PBX economics accounts for subscribers and seats', () => {
  const r=pbxEconomics({companies:6,seats:8,base:599,seatPrice:159,minutes:60});
  assert.equal(r.revenue,11226);
  assert.ok(Math.abs(r.net-4857.6)<0.00001);
});

test('no customers yield negative fixed costs, not fictional profit', () => {
  assert.equal(studioEconomics({projects:0,subscribers:0,hours:14,setup:12900,retainer:790}).net,-2000);
  assert.equal(linkEconomics({users:0,price:149,numberCost:25,minutes:20,sms:10}).net,-500);
  assert.equal(pbxEconomics({companies:0,seats:8,base:599,seatPrice:159,minutes:60}).net,-1500);
});
