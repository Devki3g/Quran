import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_RECITER, POPULAR_RECITERS } from '../constants/popularReciters';
import { sanitizeReciters } from './mp3quranApi';

test('DEFAULT_RECITER is Maher Al-Muaiqly (id 102)', () => {
  assert.equal(DEFAULT_RECITER.id, 102);
  assert.equal(DEFAULT_RECITER.name, 'ماهر المعيقلي');
  assert.equal(
    DEFAULT_RECITER.moshaf[0].server,
    'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/'
  );
});

test('POPULAR_RECITERS excludes Mishary Alafasy', () => {
  const hasMishary = POPULAR_RECITERS.some(
    (r) => r.id === 54 || r.id === 123 || r.name.includes('مشاري') || r.name.includes('العفاسي')
  );
  assert.equal(hasMishary, false);
});

test('sanitizeReciters strips Mishary Alafasy from API results while keeping Maher Al-Muaiqly', () => {
  const sample = [
    { id: 123, name: 'مشاري العفاسي', letter: 'م', moshaf: [] },
    { id: 54, name: 'مشاري راشد العفاسي', letter: 'م', moshaf: [] },
    { id: 102, name: 'ماهر المعيقلي', letter: 'م', moshaf: [] },
    { id: 2, name: 'عبد الباسط عبد الصمد', letter: 'ع', moshaf: [] }
  ];

  const cleaned = sanitizeReciters(sample);
  assert.equal(cleaned.length, 2);
  assert.deepEqual(
    cleaned.map((r) => r.id),
    [102, 2]
  );
});
