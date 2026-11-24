import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toArabicDigits,
  formatAyahMarker,
  formatAudioTime,
  getAudioUrl,
  normalizeArabicText,
  searchSurahs
} from './quranUtils';
import { SurahMeta } from '../types/quran';

test('toArabicDigits correctly converts numbers to Eastern Arabic numerals', () => {
  assert.equal(toArabicDigits(1), '١');
  assert.equal(toArabicDigits(114), '١١٤');
  assert.equal(toArabicDigits(286), '٢٨٦');
  assert.equal(toArabicDigits('2026'), '٢٠٢٦');
});

test('formatAyahMarker formats with ornamental brackets', () => {
  assert.equal(formatAyahMarker(7), '﴿٧﴾');
  assert.equal(formatAyahMarker(255), '﴿٢٥٥﴾');
});

test('formatAudioTime formats seconds into proper mm:ss and hh:mm:ss', () => {
  assert.equal(formatAudioTime(0), '00:00');
  assert.equal(formatAudioTime(65), '01:05');
  assert.equal(formatAudioTime(3665), '01:01:05');
});

test('getAudioUrl builds correct MP3Quran audio URL with 3-digit padded number', () => {
  const server = 'https://server8.mp3quran.net/afs';
  assert.equal(getAudioUrl(server, 1), 'https://server8.mp3quran.net/afs/001.mp3');
  assert.equal(getAudioUrl(server + '/', 18), 'https://server8.mp3quran.net/afs/018.mp3');
  assert.equal(getAudioUrl(server, 114), 'https://server8.mp3quran.net/afs/114.mp3');
});

test('normalizeArabicText strips diacritics and normalizes letter forms', () => {
  const withTashkeel = 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
  const normalized = normalizeArabicText(withTashkeel);
  assert.equal(normalized.includes('الحمد'), true);

  // Alef normalization
  assert.equal(normalizeArabicText('إبراهيم'), normalizeArabicText('ابراهيم'));
  assert.equal(normalizeArabicText('الأنفال'), normalizeArabicText('الانفال'));
  // Taa marbuta normalization
  assert.equal(normalizeArabicText('الفاتحة'), normalizeArabicText('الفاتحه'));
});

test('searchSurahs finds surahs by Arabic name, English name, and number', () => {
  const sampleSurahs: SurahMeta[] = [
    { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan", startPage: 1, juz: 1 },
    { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan", startPage: 2, juz: 1 },
    { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan", startPage: 293, juz: 15 }
  ];

  // Search by exact number
  assert.equal(searchSurahs('18', sampleSurahs)[0].name, 'الكهف');
  // Search by Arabic name without tashkeel
  assert.equal(searchSurahs('الفاتحه', sampleSurahs)[0].number, 1);
  // Search by English name
  assert.equal(searchSurahs('cow', sampleSurahs)[0].number, 2);
});
