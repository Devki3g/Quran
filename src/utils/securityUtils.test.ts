import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePositiveIntId,
  sanitizeExternalUrl,
  sanitizeAppSettings,
  sanitizeBookmarks,
  sanitizeReadingProgress,
  sanitizeAudioTracks,
  sanitizeReciterList,
  sanitizeAzkarCounts,
  sanitizeCachedTafsirMap,
} from './securityUtils';
import { AppSettings } from '../types/quran';

const FALLBACK_SETTINGS: AppSettings = {
  theme: 'light',
  quranFontSize: 28,
  quranFontFamily: 'amiri-quran',
  readingMode: 'mushaf',
  showTajweedMarks: true,
  playbackSpeed: 1,
  defaultReciterId: 102,
  autoScrollOnPlay: true,
};

test('parsePositiveIntId rejects non-integer, negative, and trailing-char inputs', () => {
  assert.equal(parsePositiveIntId('18', 1, 114), 18);
  assert.equal(parsePositiveIntId('18abc', 1, 114), null);
  assert.equal(parsePositiveIntId('0', 1, 114), null);
  assert.equal(parsePositiveIntId('115', 1, 114), null);
  assert.equal(parsePositiveIntId('-5', 1, 114), null);
  assert.equal(parsePositiveIntId('1.5', 1, 114), null);
});

test('sanitizeExternalUrl enforces allowlisted HTTPS domains and rejects XSS/arbitrary URLs', () => {
  assert.equal(
    sanitizeExternalUrl('https://cdn.mp3quran.net/audio/maher-muaiqly/r1/001.mp3'),
    'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/001.mp3'
  );
  assert.equal(
    sanitizeExternalUrl('http://server7.mp3quran.net/basit/'),
    'https://server7.mp3quran.net/basit/'
  );
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeExternalUrl('https://evilmp3quran.net/001.mp3'), null);
  assert.equal(sanitizeExternalUrl('https://user:pass@cdn.mp3quran.net/001.mp3'), null);
});

test('sanitizeAppSettings clamps tampered values and reverts invalid enums', () => {
  const sanitized = sanitizeAppSettings(
    {
      theme: 'hacker',
      quranFontSize: 9999,
      quranFontFamily: 'ComicSans',
      readingMode: 'broken',
      playbackSpeed: 50,
      defaultReciterId: 54,
    },
    FALLBACK_SETTINGS
  );

  assert.equal(sanitized.theme, 'light');
  assert.equal(sanitized.quranFontSize, 44);
  assert.equal(sanitized.quranFontFamily, 'amiri-quran');
  assert.equal(sanitized.readingMode, 'mushaf');
  assert.equal(sanitized.playbackSpeed, 1);
  assert.equal(sanitized.defaultReciterId, 102);
});

test('sanitizeBookmarks rejects malformed non-array payloads and out-of-range surahs', () => {
  assert.deepEqual(sanitizeBookmarks({ not: 'an array' }), []);
  const res = sanitizeBookmarks([
    { surahNumber: 1, ayahNumber: 1, surahName: 'الفاتحة', text: 'بسم الله' },
    { surahNumber: 999, ayahNumber: 1, surahName: 'Fake', text: 'bad' },
    null,
  ]);
  assert.equal(res.length, 1);
  assert.equal(res[0].id, '1_1');
});

test('sanitizeReadingProgress validates bounds', () => {
  assert.equal(sanitizeReadingProgress({ surahNumber: 200, ayahNumber: 1, page: 1, surahName: 'X' }), null);
  const valid = sanitizeReadingProgress({ surahNumber: 2, ayahNumber: 255, page: 42, surahName: 'البقرة' });
  assert.equal(valid?.surahNumber, 2);
  assert.equal(valid?.page, 42);
});

test('sanitizeAudioTracks strips untrusted URLs and excluded reciters', () => {
  const tracks = sanitizeAudioTracks([
    {
      surahNumber: 1,
      surahName: 'الفاتحة',
      reciterId: 102,
      reciterName: 'ماهر المعيقلي',
      moshafName: 'حفص',
      serverUrl: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/',
      audioUrl: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/001.mp3',
    },
    {
      surahNumber: 1,
      surahName: 'الفاتحة',
      reciterId: 99,
      reciterName: 'Attacker',
      moshafName: 'X',
      serverUrl: 'javascript:alert(1)',
      audioUrl: 'javascript:alert(1)',
    },
  ]);
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].reciterId, 102);
});

test('sanitizeReciterList drops unsafe server URLs and excluded reciters', () => {
  const list = sanitizeReciterList([
    {
      id: 102,
      name: 'ماهر المعيقلي',
      letter: 'م',
      moshaf: [{ id: 1, name: 'حفص', server: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/', surah_total: 114, surah_list: '1,2' }],
    },
    {
      id: 200,
      name: 'Untrusted',
      letter: 'U',
      moshaf: [{ id: 2, name: 'X', server: 'https://evil.example.com/', surah_total: 114, surah_list: '1' }],
    },
  ]);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 102);
});

test('sanitizeAzkarCounts blocks prototype pollution keys and invalid numbers', () => {
  const payload = JSON.parse('{"morning_1": 3, "__proto__": 99, "bad": -5, "evil<script>": 1}');
  const cleaned = sanitizeAzkarCounts(payload);
  assert.deepEqual(cleaned, { morning_1: 3 });
});

test('sanitizeCachedTafsirMap strips HTML from poisoned cache entries', () => {
  const cleaned = sanitizeCachedTafsirMap({
    1: '<b>تفسير</b> الآية',
    badKey: 'ignored',
  });
  assert.deepEqual(cleaned, { 1: 'تفسير الآية' });
});
