import { Ayah, SurahDetail, SurahMeta } from '../types/quran';
import { SURAHS_LIST } from '../constants/surahsData';
import { parsePositiveIntId } from '../utils/securityUtils';

const memoryCache = new Map<number, SurahDetail>();

// Pre-bundled authentic Uthmani text for immediate offline availability
const FALLBACK_SURAHS: Record<number, { text: string; numberInSurah: number }[]> = {
  1: [
    { numberInSurah: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
    { numberInSurah: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ" },
    { numberInSurah: 3, text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
    { numberInSurah: 4, text: "مَٰلِكِ يَوْمِ ٱلدِّينِ" },
    { numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
    { numberInSurah: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ" },
    { numberInSurah: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ" }
  ],
  112: [
    { numberInSurah: 1, text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ" },
    { numberInSurah: 2, text: "ٱللَّهُ ٱلصَّمَدُ" },
    { numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" },
    { numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ" }
  ],
  113: [
    { numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ" },
    { numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ" },
    { numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" },
    { numberInSurah: 4, text: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ" },
    { numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ" }
  ],
  114: [
    { numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ" },
    { numberInSurah: 2, text: "مَلِكِ ٱلنَّاسِ" },
    { numberInSurah: 3, text: "إِلَٰهِ ٱلنَّاسِ" },
    { numberInSurah: 4, text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ" },
    { numberInSurah: 5, text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ" },
    { numberInSurah: 6, text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ" }
  ]
};

export async function fetchSurahWithAyahs(surahNumber: number): Promise<SurahDetail> {
  const validSurah = parsePositiveIntId(surahNumber, 1, 114);
  if (!validSurah) {
    throw new Error('رقم السورة غير صالح');
  }
  const meta = SURAHS_LIST.find((s) => s.number === validSurah) || SURAHS_LIST[0];

  // 1. Check in-memory cache
  if (memoryCache.has(validSurah)) {
    return memoryCache.get(validSurah)!;
  }

  // 2. Check localStorage cache with shape validation
  const cacheKey = `quran_uthmani_surah_${validSurah}`;
  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed: SurahDetail = JSON.parse(local);
      const isValidCached =
        parsed &&
        typeof parsed === 'object' &&
        parsed.number === validSurah &&
        Array.isArray(parsed.ayahs) &&
        parsed.ayahs.length === meta.numberOfAyahs &&
        parsed.ayahs.every(
          (a) =>
            a &&
            typeof a.text === 'string' &&
            a.text.length > 0 &&
            typeof a.numberInSurah === 'number'
        );
      if (isValidCached) {
        memoryCache.set(validSurah, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Fetch from primary API: api.alquran.cloud
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const rawData = Array.isArray(json.data) ? json.data[0] : json.data;

      if (rawData && Array.isArray(rawData.ayahs)) {
        // Strip out initial bismillah prefix if it is inside ayah 1 (except for Al-Fatihah)
        const ayahs: Ayah[] = rawData.ayahs.map((a: any, idx: number) => {
          let text = a.text;
          // For surahs other than Al-Fatihah (1) and At-Tawbah (9), the API sometimes prefixes ayah 1 with Bismillah
          if (surahNumber !== 1 && surahNumber !== 9 && idx === 0) {
            const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            if (text.startsWith(bismillahPrefix)) {
              text = text.replace(bismillahPrefix, "").trim();
            }
          }
          return {
            number: a.number,
            text: text,
            numberInSurah: a.numberInSurah || idx + 1,
            juz: a.juz || meta.juz,
            page: a.page || meta.startPage,
            hizbQuarter: a.hizbQuarter || 1,
            sajda: a.sajda || false
          };
        });

        const detail: SurahDetail = {
          ...meta,
          ayahs
        };

        memoryCache.set(surahNumber, detail);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(detail));
        } catch (e) {
          // ignore quota
        }
        return detail;
      }
    }
  } catch (err) {
    console.warn(`Primary Quran API failed for Surah ${surahNumber}, trying secondary...`, err);
  }

  // 4. Secondary fallback: api.quran.com (with timeout)
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 9000);
    const res2 = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${validSurah}`,
      { signal: controller2.signal }
    );
    clearTimeout(timeoutId2);
    if (res2.ok) {
      const json2 = await res2.json();
      if (Array.isArray(json2.verses)) {
        const ayahs: Ayah[] = json2.verses.map((v: any, idx: number) => ({
          number: v.id || idx + 1,
          text: v.text_uthmani,
          numberInSurah: idx + 1,
          juz: meta.juz,
          page: meta.startPage,
          hizbQuarter: 1,
          sajda: false
        }));

        const detail: SurahDetail = {
          ...meta,
          ayahs
        };
        memoryCache.set(surahNumber, detail);
        return detail;
      }
    }
  } catch (err2) {
    console.warn(`Secondary Quran API failed for Surah ${surahNumber}`, err2);
  }

  // 5. Ultimate fallback if offline
  if (FALLBACK_SURAHS[surahNumber]) {
    const ayahs: Ayah[] = FALLBACK_SURAHS[surahNumber].map((a, idx) => ({
      number: idx + 1,
      text: a.text,
      numberInSurah: a.numberInSurah,
      juz: meta.juz,
      page: meta.startPage,
      hizbQuarter: 1,
      sajda: false
    }));
    return { ...meta, ayahs };
  }

  throw new Error(`تعذر تحميل آيات سورة ${meta.name}، يرجى التحقق من اتصال الإنترنت.`);
}

export interface DailyVerse {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  reflection: string;
}

const INSPIRATIONAL_VERSES: DailyVerse[] = [
  {
    surahNumber: 2,
    surahName: "البقرة",
    ayahNumber: 286,
    text: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ",
    reflection: "رحمة الله بعباده أنه لا يحمّل نفساً فوق طاقتها، فاستعن به وتوكل عليه في كل أمورك."
  },
  {
    surahNumber: 13,
    surahName: "الرعد",
    ayahNumber: 28,
    text: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    reflection: "السكينة الحقيقية وراحة البال لا تُنال إلا بالقرب من كلام الله وذكره الدائم."
  },
  {
    surahNumber: 94,
    surahName: "الشرح",
    ayahNumber: 5,
    text: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    reflection: "بشارة ربانية عظيمة بأن كل ضيق يعقبه فرجان، وأن الفرج مع الكرب لا ينفك عنه."
  },
  {
    surahNumber: 65,
    surahName: "الطلاق",
    ayahNumber: 3,
    text: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ",
    reflection: "من فوّض أمره إلى الله كفاه ما أهمه في دنياه وآخرته."
  },
  {
    surahNumber: 39,
    surahName: "الزمر",
    ayahNumber: 53,
    text: "۞ قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا",
    reflection: "أرجى آية في كتاب الله تفتح أبواب الأمل والتوبة لكل من أثقلته ذنوبه."
  },
  {
    surahNumber: 2,
    surahName: "البقرة",
    ayahNumber: 186,
    text: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ",
    reflection: "الله قريب يسمع نجواك ويستجيب دعاءك، فلا تبخل على نفسك بمناجاته."
  }
];

export function getDailyVerse(): DailyVerse {
  // Deterministic verse per day of year
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % INSPIRATIONAL_VERSES.length;
  return INSPIRATIONAL_VERSES[index];
}
