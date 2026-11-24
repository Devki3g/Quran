import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AudioTrack, Moshaf, Reciter } from '../types/quran';
import { SURAHS_LIST } from '../constants/surahsData';
import { DEFAULT_RECITER } from '../constants/popularReciters';
import { getAudioUrl } from '../utils/quranUtils';
import { sanitizeAudioTracks, sanitizeExternalUrl, parsePositiveIntId } from '../utils/securityUtils';

const EMBEDDED_ARTWORK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#145C46"/><path d="M24 38c14-10 28-10 40 2 12-12 26-12 40-2v50c-14-10-28-10-40 2-12-12-26-12-40-2z" fill="none" stroke="#C5A45D" stroke-width="5" stroke-linejoin="round"/><line x1="64" y1="40" x2="64" y2="90" stroke="#C5A45D" stroke-width="5"/></svg>'
  );

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isRepeating: boolean;
  error: string | null;
  activeReciter: Reciter;
  activeMoshaf: Moshaf;
  recentTracks: AudioTrack[];
  playSurah: (surahNumber: number, reciter?: Reciter, moshaf?: Moshaf) => void;
  togglePlayPause: () => void;
  seek: (timeInSeconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleRepeat: () => void;
  playNextSurah: () => void;
  playPrevSurah: () => void;
  setActiveReciter: (reciter: Reciter) => void;
  setActiveMoshaf: (moshaf: Moshaf) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const RECENT_AUDIO_KEY = 'holy_quran_recent_audio_v1';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [activeReciter, setActiveReciter] = useState<Reciter>(DEFAULT_RECITER);
  const [activeMoshaf, setActiveMoshaf] = useState<Moshaf>(DEFAULT_RECITER.moshaf[0]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isRepeating, setIsRepeating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentTracks, setRecentTracks] = useState<AudioTrack[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_AUDIO_KEY);
      if (saved) {
        return sanitizeAudioTracks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (isRepeatingRef.current) {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        playNextSurahRef.current();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذر تحميل الملف الصوتي، يرجى المحاولة مرة أخرى أو اختيار قارئ آخر.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, []);

  // Keep repeat state & next handler in sync with ended handler without tearing down Audio element
  const isRepeatingRef = useRef(isRepeating);
  useEffect(() => {
    isRepeatingRef.current = isRepeating;
  }, [isRepeating]);

  const playNextSurahRef = useRef<() => void>(() => {});

  // MediaSession API integration for OS/browser lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentTrack.surahName}`,
        artist: currentTrack.reciterName,
        album: `القرآن الكريم (${currentTrack.moshafName})`,
        artwork: [
          { src: EMBEDDED_ARTWORK_SVG, sizes: '128x128', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play().catch(console.warn);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevSurah();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNextSurah();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }
  }, [currentTrack]);

  const playSurah = (surahNumber: number, reciter?: Reciter, moshaf?: Moshaf) => {
    const validSurah = parsePositiveIntId(surahNumber, 1, 114) || 1;
    const targetReciter = reciter || activeReciter;
    const targetMoshaf = moshaf || (reciter ? reciter.moshaf[0] : activeMoshaf);

    if (!targetMoshaf) return;

    if (reciter) setActiveReciter(reciter);
    if (targetMoshaf) setActiveMoshaf(targetMoshaf);

    const surah = SURAHS_LIST.find((s) => s.number === validSurah);
    const surahName = surah ? surah.name : `سورة ${validSurah}`;
    const safeServer = sanitizeExternalUrl(targetMoshaf.server);
    const audioUrl = safeServer ? getAudioUrl(safeServer, validSurah) : '';

    if (!safeServer || !audioUrl) {
      setError('رابط التلاوة غير صالح أو غير موثوق.');
      return;
    }

    const track: AudioTrack = {
      surahNumber: validSurah,
      surahName,
      reciterId: targetReciter.id,
      reciterName: targetReciter.name,
      moshafName: targetMoshaf.name,
      serverUrl: safeServer,
      audioUrl
    };

    setCurrentTrack(track);
    setError(null);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Playback request error:', err);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }

    // Save to recent tracks
    setRecentTracks((prev) => {
      const filtered = prev.filter((t) => !(t.surahNumber === surahNumber && t.reciterId === targetReciter.id));
      const next = [track, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_AUDIO_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (!currentTrack) {
      // If nothing loaded yet, start playing Al-Fatihah
      playSurah(1);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback error', err);
        setError('تعذر استئناف التشغيل');
      });
    }
  };

  const seek = (timeInSeconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.volume = nextMuted ? 0 : volume;
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleRepeat = () => {
    setIsRepeating((prev) => !prev);
  };

  const playNextSurah = () => {
    const nextSurahNum = currentTrack ? (currentTrack.surahNumber % 114) + 1 : 1;
    playSurah(nextSurahNum, activeReciter, activeMoshaf);
  };

  playNextSurahRef.current = playNextSurah;

  const playPrevSurah = () => {
    const prevSurahNum = currentTrack ? (currentTrack.surahNumber === 1 ? 114 : currentTrack.surahNumber - 1) : 1;
    playSurah(prevSurahNum, activeReciter, activeMoshaf);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isRepeating,
        error,
        activeReciter,
        activeMoshaf,
        recentTracks,
        playSurah,
        togglePlayPause,
        seek,
        setVolume,
        toggleMute,
        setPlaybackRate,
        toggleRepeat,
        playNextSurah,
        playPrevSurah,
        setActiveReciter,
        setActiveMoshaf
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useQuranAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within an AudioProvider');
  }
  return context;
};
