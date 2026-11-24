import { Reciter } from '../types/quran';

export const POPULAR_RECITERS: Reciter[] = [
  {
    id: 102,
    name: "ماهر المعيقلي",
    letter: "م",
    moshaf: [
      {
        id: 102,
        name: "حفص عن عاصم - مرتل",
        server: "https://cdn.mp3quran.net/audio/maher-muaiqly/r1/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      },
      {
        id: 133,
        name: "المصحف المجود",
        server: "https://cdn.mp3quran.net/audio/maher-muaiqly/r3/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 2,
    name: "عبد الباسط عبد الصمد",
    letter: "ع",
    moshaf: [
      {
        id: 2,
        name: "حفص عن عاصم - مرتل",
        server: "https://server7.mp3quran.net/basit/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      },
      {
        id: 3,
        name: "حفص عن عاصم - مجود",
        server: "https://server7.mp3quran.net/basit/Mujawwad/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 92,
    name: "محمود خليل الحصري",
    letter: "م",
    moshaf: [
      {
        id: 5,
        name: "حفص عن عاصم - مرتل",
        server: "https://server13.mp3quran.net/husr/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      },
      {
        id: 6,
        name: "حفص عن عاصم - مجود",
        server: "https://server13.mp3quran.net/husr/Mujawwad/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 36,
    name: "سعد الغامدي",
    letter: "س",
    moshaf: [
      {
        id: 7,
        name: "حفص عن عاصم - مرتل",
        server: "https://server7.mp3quran.net/s_gmd/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 51,
    name: "عبد الرحمن السديس",
    letter: "ع",
    moshaf: [
      {
        id: 8,
        name: "حفص عن عاصم - مرتل",
        server: "https://server11.mp3quran.net/sds/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 48,
    name: "سعود الشريم",
    letter: "س",
    moshaf: [
      {
        id: 9,
        name: "حفص عن عاصم - مرتل",
        server: "https://server7.mp3quran.net/shur/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 81,
    name: "محمد صديق المنشاوي",
    letter: "م",
    moshaf: [
      {
        id: 10,
        name: "حفص عن عاصم - مرتل",
        server: "https://server10.mp3quran.net/minsh/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      },
      {
        id: 11,
        name: "حفص عن عاصم - مجود",
        server: "https://server10.mp3quran.net/minsh/Mujawwad/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 120,
    name: "ياسر الدوسري",
    letter: "ي",
    moshaf: [
      {
        id: 12,
        name: "حفص عن عاصم - مرتل",
        server: "https://server11.mp3quran.net/yasser/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  },
  {
    id: 1,
    name: "إبراهيم الأخضر",
    letter: "إ",
    moshaf: [
      {
        id: 13,
        name: "حفص عن عاصم - مرتل",
        server: "https://cdn.mp3quran.net/audio/ibrahim-akhdar/r1/",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => String(i + 1)).join(',')
      }
    ]
  }
];

export const DEFAULT_RECITER = POPULAR_RECITERS[0]; // Maher Al-Muaiqly
