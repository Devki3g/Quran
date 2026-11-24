import { SurahTafsirMap } from '../types/quran';
import {
  parseAlQuranCloudTafsir,
  parseQuranEncTafsir,
  parseQuranComAyahTafsir,
} from '../utils/tafsirUtils';
import { sanitizeCachedTafsirMap } from '../utils/securityUtils';

const ALQURAN_TAFSIR_BASE = 'https://api.alquran.cloud/v1/surah';
const QURANENC_TAFSIR_BASE = 'https://quranenc.com/api/v1/translation/sura/arabic_moyassar';
const QURANCOM_AYAH_TAFSIR_BASE = 'https://api.quran.com/api/v4/tafsirs/16/by_ayah';
const TAFSIR_CACHE_PREFIX = 'quran_tafsir_muyassar_v1_surah_';

const memoryCache = new Map<number, SurahTafsirMap>();
const inFlightSurahRequests = new Map<number, Promise<SurahTafsirMap>>();

/**
 * Authentic pre-bundled Al-Tafsir Al-Muyassar fallback for offline resilience
 * (matching the fallback surahs in quranService.ts: 1, 112, 113, 114).
 */
const FALLBACK_TAFSIR_MAP: Record<number, SurahTafsirMap> = {
  1: {
    1: 'سورة الفاتحة سميت هذه السورة بالفاتحة؛ لأنه يفتتح بها القرآن العظيم، وتسمى المثاني؛ لأنها تقرأ في كل ركعة، ولها أسماء أخر. أبتدئ قراءة القرآن باسم الله مستعينا به، (اللهِ) علم على الرب -تبارك وتعالى- المعبود بحق دون سواه، وهو أخص أسماء الله تعالى، ولا يسمى به غيره سبحانه. (الرَّحْمَنِ) ذي الرحمة العامة الذي وسعت رحمته جميع الخلق، (الرَّحِيمِ) بالمؤمنين، وهما اسمان من أسمائه تعالى، يتضمنان إثبات صفة الرحمة لله تعالى كما يليق بجلاله.',
    2: '(الحَمْدُ للهِ رَبِّ العَالَمِينَ) الثناء على الله بصفاته التي كلُّها أوصاف كمال، وبنعمه الظاهرة والباطنة، الدينية والدنيوية، وفي ضمنه أَمْرٌ لعباده أن يحمدوه، فهو المستحق له وحده، وهو سبحانه المنشئ للخلق، القائم بأمورهم، المربي لجميع خلقه بنعمه، ولأوليائه بالإيمان والعمل الصالح.',
    3: '(الرَّحْمَنِ) الذي وسعت رحمته جميع الخلق، (الرَّحِيمِ)، بالمؤمنين، وهما اسمان من أسماء الله تعالى.',
    4: 'وهو سبحانه وحده مالك يوم القيامة، وهو يوم الجزاء على الأعمال. وفي قراءة المسلم لهذه الآية في كل ركعة من صلواته تذكير له باليوم الآخر، وحثٌّ له على الاستعداد بالعمل الصالح، والكف عن المعاصي والسيئات.',
    5: 'إنا نخصك وحدك بالعبادة، ونستعين بك وحدك في جميع أمورنا، فالأمر كله بيدك، لا يملك منه أحد مثقال ذرة. وفي هذه الآية دليل على أن العبد لا يجوز له أن يصرف شيئًا من أنواع العبادة كالدعاء والاستغاثة والذبح والطواف إلا لله وحده، وفيها شفاء القلوب من داء التعلق بغير الله، ومن أمراض الرياء والعجب، والكبرياء.',
    6: 'دُلَّنا، وأرشدنا، ووفقنا إلى الطريق المستقيم، وثبتنا عليه حتى نلقاك، وهو الإسلام، الذي هو الطريق الواضح الموصل إلى رضوان الله وإلى جنته، الذي دلّ عليه خاتم رسله وأنبيائه محمد صلى الله عليه وسلم، فلا سبيل إلى سعادة العبد إلا بالاستقامة عليه.',
    7: 'طريق الذين أنعمت عليهم من النبيين والصدِّيقين والشهداء والصالحين، فهم أهل الهداية والاستقامة، ولا تجعلنا ممن سلك طريق المغضوب عليهم، الذين عرفوا الحق ولم يعملوا به، وهم اليهود، ومن كان على شاكلتهم، والضالين، وهم الذين لم يهتدوا، فضلوا الطريق، وهم النصارى، ومن اتبع سنتهم. وفي هذا الدعاء شفاء لقلب المسلم من مرض الجحود والجهل والضلال، ودلالة على أن أعظم نعمة على الإطلاق هي نعمة الإسلام، فمن كان أعرف للحق وأتبع له، كان أولى بالصراط المستقيم، ولا ريب أن أصحاب رسول الله صلى الله عليه وسلم هم أولى الناس بذلك بعد الأنبياء عليهم السلام، فدلت الآية على فضلهم، وعظيم منزلتهم، رضي الله عنهم. ويستحب للقارئ أن يقول في الصلاة بعد قراءة الفاتحة: (آمين)، ومعناها: اللهم استجب، وليست آية من سورة الفاتحة باتفاق العلماء؛ ولهذا أجمعوا على عدم كتابتها في المصاحف.',
  },
  112: {
    1: 'قل -أيها الرسول-: هو الله المتفرد بالألوهية والربوبية والأسماء والصفات، لا يشاركه أحد فيها.',
    2: 'الله وحده المقصود في قضاء الحوائج والرغائب.',
    3: 'ليس له ولد ولا والد ولا صاحبة.',
    4: 'ولم يكن له مماثلا ولا مشابهًا أحد من خلقه، لا في أسمائه ولا في صفاته، ولا في أفعاله، تبارك وتعالى وتقدَّس.',
  },
  113: {
    1: 'قل -أيها الرسول-: أعوذ وأعتصم برب الفلق، وهو الصبح.',
    2: 'من شر جميع المخلوقات وأذاها.',
    3: 'ومن شر ليل شديد الظلمة إذا دخل وتغلغل، وما فيه من الشرور والمؤذيات.',
    4: 'ومن شر الساحرات اللاتي ينفخن فيما يعقدن من عُقَد بقصد السحر.',
    5: 'ومن شر حاسد مبغض للناس إذا حسدهم على ما وهبهم الله من نعم، وأراد زوالها عنهم، وإيقاع الأذى بهم.',
  },
  114: {
    1: 'قل -أيها الرسول-: أعوذ وأعتصم برب الناس، القادر وحده على ردِّ شر الوسواس.',
    2: 'ملك الناس المتصرف في كل شؤونهم، الغنيِّ عنهم.',
    3: 'إله الناس الذي لا معبود بحق سواه.',
    4: 'من أذى الشيطان الذي يوسوس عند الغفلة، ويختفي عند ذكر الله.',
    5: 'الذي يبثُّ الشر والشكوك في صدور الناس.',
    6: 'من شياطين الجن والإنس.',
  },
};

function readFromStorage(surahNumber: number): SurahTafsirMap | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${TAFSIR_CACHE_PREFIX}${surahNumber}`);
    if (!raw) return null;
    return sanitizeCachedTafsirMap(JSON.parse(raw));
  } catch {
    // ignore storage read errors
  }
  return null;
}

function writeToStorage(surahNumber: number, map: SurahTafsirMap): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(`${TAFSIR_CACHE_PREFIX}${surahNumber}`, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 10000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches Al-Tafsir Al-Muyassar for all ayahs of a Surah, with memory + localStorage caching
 * and multi-provider fallback resilience.
 */
export async function fetchSurahTafsir(surahNumber: number): Promise<SurahTafsirMap> {
  if (surahNumber < 1 || surahNumber > 114) {
    throw new Error('رقم السورة غير صالح');
  }

  const cached = memoryCache.get(surahNumber);
  if (cached) {
    return cached;
  }

  const stored = readFromStorage(surahNumber);
  if (stored) {
    memoryCache.set(surahNumber, stored);
    return stored;
  }

  const existingRequest = inFlightSurahRequests.get(surahNumber);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = (async () => {
    try {
      // 1. Primary API: AlQuran.cloud (ar.muyassar)
      try {
        const payload = await fetchJsonWithTimeout(`${ALQURAN_TAFSIR_BASE}/${surahNumber}/ar.muyassar`);
        const parsed = parseAlQuranCloudTafsir(payload);
        if (parsed) {
          memoryCache.set(surahNumber, parsed);
          writeToStorage(surahNumber, parsed);
          return parsed;
        }
      } catch {
        // Proceed to secondary fallback
      }

      // 2. Secondary API: QuranEnc (arabic_moyassar)
      try {
        const payload = await fetchJsonWithTimeout(`${QURANENC_TAFSIR_BASE}/${surahNumber}`);
        const parsed = parseQuranEncTafsir(payload);
        if (parsed) {
          memoryCache.set(surahNumber, parsed);
          writeToStorage(surahNumber, parsed);
          return parsed;
        }
      } catch {
        // Proceed to bundled fallback
      }

      // 3. Offline pre-bundled fallback (Surahs 1, 112, 113, 114)
      if (FALLBACK_TAFSIR_MAP[surahNumber]) {
        const fallback = FALLBACK_TAFSIR_MAP[surahNumber];
        memoryCache.set(surahNumber, fallback);
        return fallback;
      }

      throw new Error('تعذر تحميل التفسير الميسر لهذه السورة. يرجى التحقق من الاتصال بالإنترنت.');
    } finally {
      inFlightSurahRequests.delete(surahNumber);
    }
  })();

  inFlightSurahRequests.set(surahNumber, requestPromise);
  return requestPromise;
}

/**
 * Fetches Al-Tafsir Al-Muyassar for a specific Ayah, falling back to per-ayah Quran.com v4 API
 * and pre-bundled authentic data if Surah-level providers fail.
 */
export async function fetchAyahTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
  if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
    throw new Error('بيانات الآية غير صالحة');
  }

  const cachedMap = memoryCache.get(surahNumber);
  if (cachedMap?.[ayahNumber]) {
    return cachedMap[ayahNumber];
  }

  try {
    const surahMap = await fetchSurahTafsir(surahNumber);
    if (surahMap[ayahNumber]) {
      return surahMap[ayahNumber];
    }
  } catch {
    // Fall through to per-ayah tertiary API
  }

  // 3. Tertiary per-ayah API: Quran.com v4 (Tafsir Al-Muyassar resource_id = 16)
  try {
    const payload = await fetchJsonWithTimeout(
      `${QURANCOM_AYAH_TAFSIR_BASE}/${surahNumber}:${ayahNumber}`
    );
    const parsed = parseQuranComAyahTafsir(payload);
    if (parsed) {
      const updatedMap = { ...(memoryCache.get(surahNumber) || {}), [ayahNumber]: parsed };
      memoryCache.set(surahNumber, updatedMap);
      return parsed;
    }
  } catch {
    // Fall through to pre-bundled check
  }

  const bundled = FALLBACK_TAFSIR_MAP[surahNumber]?.[ayahNumber];
  if (bundled) {
    return bundled;
  }

  throw new Error('تعذر تحميل التفسير الميسر لهذه الآية. يرجى المحاولة مرة أخرى.');
}

/**
 * Silently warms the Surah Tafsir cache in the background without throwing.
 */
export function prefetchSurahTafsir(surahNumber: number): void {
  fetchSurahTafsir(surahNumber).catch(() => {
    // Silent background prefetch
  });
}
