import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeTafsirText,
  parseAlQuranCloudTafsir,
  parseQuranEncTafsir,
  parseQuranComAyahTafsir,
} from './tafsirUtils';

test('sanitizeTafsirText strips HTML tags and decodes entities cleanly', () => {
  const raw =
    'أبتدئ قراءة القرآن باسم الله&nbsp;<span class="green">(اللهِ)</span> علم على الرب &amp; <p>الرحمن</p>';
  const cleaned = sanitizeTafsirText(raw);
  assert.equal(cleaned, 'أبتدئ قراءة القرآن باسم الله (اللهِ) علم على الرب & الرحمن');
});

test('parseAlQuranCloudTafsir maps numberInSurah accurately', () => {
  const payload = {
    code: 200,
    data: {
      ayahs: [
        { numberInSurah: 1, text: 'تفسير الآية الأولى' },
        { numberInSurah: 2, text: 'تفسير الآية الثانية' },
      ],
    },
  };
  const map = parseAlQuranCloudTafsir(payload);
  assert.deepEqual(map, {
    1: 'تفسير الآية الأولى',
    2: 'تفسير الآية الثانية',
  });
});

test('parseAlQuranCloudTafsir returns null for invalid payloads', () => {
  assert.equal(parseAlQuranCloudTafsir({ code: 404, data: null }), null);
  assert.equal(parseAlQuranCloudTafsir(null), null);
});

test('parseQuranEncTafsir parses string aya numbers and cleans text', () => {
  const payload = {
    result: [
      { id: '1', sura: '112', aya: '1', translation: 'قل هو الله أحد' },
      { id: '2', sura: '112', aya: '2', translation: 'الله <b>الصمد</b>' },
    ],
  };
  const map = parseQuranEncTafsir(payload);
  assert.deepEqual(map, {
    1: 'قل هو الله أحد',
    2: 'الله الصمد',
  });
});

test('parseQuranComAyahTafsir extracts and sanitizes single ayah tafsir', () => {
  const payload = {
    tafsir: {
      resource_id: 16,
      text: '<span class="green">(الحمد لله)</span> الثناء على الله.',
    },
  };
  assert.equal(parseQuranComAyahTafsir(payload), '(الحمد لله) الثناء على الله.');
  assert.equal(parseQuranComAyahTafsir({ tafsir: { text: '   ' } }), null);
});
