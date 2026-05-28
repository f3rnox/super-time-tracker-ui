"use client";

import { useEffect, useRef, useState } from "react";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { get_select_class_name } from "@/lib/get_select_class_name";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { format_display_tag } from "@/lib/format_display_tag";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

interface ZenModeOverlayProps {
  active_entry: SerializedEntry | null;
  sheets: SerializedSheet[];
  known_tags: string[];
  is_pending: boolean;
  on_check_in: (values: { description: string; sheetName: string }) => void;
  on_check_out: () => void;
  on_add_note: (text: string) => Promise<void> | void;
  on_close: () => void;
}

const mindfulness_quotes = [
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
  },
  {
    text: "Adopt the pace of nature: her secret is patience.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
  },
  {
    text: "Deep work is not some nostalgic affectation... It is an indispensable skill in our economy.",
    author: "Cal Newport",
  },
  {
    text: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee",
  },
  {
    text: "Be present in all things and thankful for all things.",
    author: "Maya Angelou",
  },
  {
    text: "Focus is a muscle, and you build it through practice.",
    author: "Mindfulness Practice",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    text: "Quiet the mind and the soul will speak.",
    author: "Ma Jaya Sati Bhagavati",
  },
  {
    text: "Flow is the state of being completely involved in an activity for its own sake.",
    author: "Mihaly Csikszentmihalyi",
  },
];

type SoundType = "none" | "brown" | "waves" | "rain" | "drone";
type BreathingMode = "off" | "calm" | "box";

export function ZenModeOverlay({
  active_entry,
  sheets,
  known_tags,
  is_pending,
  on_check_in,
  on_check_out,
  on_add_note,
  on_close,
}: Readonly<ZenModeOverlayProps>) {
  // Global View Settings
  const [showSeconds, setShowSeconds] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Time Ticking State
  const [durationMs, setDurationMs] = useState(0);

  // Distraction Note State
  const [newNoteText, setNewNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // Check-In State (Zen Mode without running tracker)
  const [checkInDesc, setCheckInDesc] = useState("");
  const [checkInSheet, setCheckInSheet] = useState("");

  // Soundscape States
  const [soundType, setSoundType] = useState<SoundType>("none");
  const [volume, setVolume] = useState(0.3);

  // Breathing States
  const [breathingMode, setBreathingMode] = useState<BreathingMode>("off");
  const [breathingStep, setBreathingStep] = useState(0); // in seconds

  // Web Audio Synth Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const runningNodesRef = useRef<AudioNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);

  // Set default sheet if check-in sheet not set
  useEffect(() => {
    if (sheets.length > 0 && !checkInSheet) {
      const active = sheets.find((s) => s.isActive);
      const firstValid = sheets.find((s) => !s.archived);
      setCheckInSheet(active?.name ?? firstValid?.name ?? "main");
    }
  }, [sheets, checkInSheet]);

  // Handle ticking timer for active tracking
  useEffect(() => {
    if (!active_entry) return;

    setDurationMs(active_entry.durationMs);

    const interval = setInterval(() => {
      setDurationMs(Date.now() - new Date(active_entry.start).getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [active_entry]);

  // Handle rotating quotes every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % mindfulness_quotes.length);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Breathing Guide Loop
  useEffect(() => {
    if (breathingMode === "off") {
      setBreathingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setBreathingStep((prev) => {
        const cycle = breathingMode === "box" ? 16 : 19;
        return (prev + 1) % cycle;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingMode]);

  // Web Audio procedural synthesis engine
  const cleanupAudio = () => {
    runningNodesRef.current.forEach((node) => {
      try {
        if ("stop" in node && typeof node.stop === "function") {
          node.stop();
        }
      } catch {
        // Safe to ignore
      }
      try {
        node.disconnect();
      } catch {
        // Safe to ignore
      }
    });
    runningNodesRef.current = [];

    if (masterGainRef.current) {
      try {
        masterGainRef.current.disconnect();
      } catch {
        // Safe to ignore
      }
      masterGainRef.current = null;
    }
  };

  // Safe AudioContext getter
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioCtxClass =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        audioContextRef.current = new AudioCtxClass();
      }
    }
    return audioContextRef.current;
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        volume,
        audioContextRef.current.currentTime,
      );
    }
  }, [volume]);

  // Synthesize sound on selection change
  useEffect(() => {
    cleanupAudio();

    if (soundType === "none") return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Autoplay safety: resume context
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    try {
      if (soundType === "brown") {
        // Deep warm brown noise (soothing rumble)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(300, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);

        source.start(0);
        runningNodesRef.current.push(source, filter);
      } else if (soundType === "waves") {
        // Ocean Waves (Brown noise swept by LFO lowpass and amplitude filters)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.setValueAtTime(1.0, ctx.currentTime);
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.55, ctx.currentTime);

        source.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(masterGain);

        // LFO for wave sweeps (~12 second period)
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

        const lfoGainFilter = ctx.createGain();
        lfoGainFilter.gain.setValueAtTime(220, ctx.currentTime);

        const lfoGainAmp = ctx.createGain();
        lfoGainAmp.gain.setValueAtTime(0.35, ctx.currentTime);

        lfo.connect(lfoGainFilter);
        lfoGainFilter.connect(filter.frequency);

        lfo.connect(lfoGainAmp);
        lfoGainAmp.connect(waveGain.gain);

        source.start(0);
        lfo.start(0);

        runningNodesRef.current.push(
          source,
          filter,
          waveGain,
          lfo,
          lfoGainFilter,
          lfoGainAmp,
        );
      } else if (soundType === "rain") {
        // Rain Soundscape (High-passed and band-passed noise blend)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Rumble/wash filter
        const filterWash = ctx.createBiquadFilter();
        filterWash.type = "bandpass";
        filterWash.frequency.setValueAtTime(1000, ctx.currentTime);
        filterWash.Q.setValueAtTime(0.8, ctx.currentTime);

        // Splashy patter filter
        const filterSplash = ctx.createBiquadFilter();
        filterSplash.type = "highpass";
        filterSplash.frequency.setValueAtTime(2000, ctx.currentTime);

        const washGain = ctx.createGain();
        washGain.gain.setValueAtTime(0.4, ctx.currentTime);

        const splashGain = ctx.createGain();
        splashGain.gain.setValueAtTime(0.18, ctx.currentTime);

        source.connect(filterWash);
        filterWash.connect(washGain);
        washGain.connect(masterGain);

        source.connect(filterSplash);
        filterSplash.connect(splashGain);
        splashGain.connect(masterGain);

        source.start(0);
        runningNodesRef.current.push(
          source,
          filterWash,
          filterSplash,
          washGain,
          splashGain,
        );
      } else if (soundType === "drone") {
        // Zen Meditation Synth Chord (Root, fifth, octave, major 9th warm triangles)
        const baseFreq = 87.31; // F2
        const freqs = [
          baseFreq,
          baseFreq * 1.5,
          baseFreq * 2.0,
          baseFreq * 2.5,
          baseFreq * 3.0,
        ];

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, ctx.currentTime);
        filter.Q.setValueAtTime(3.5, ctx.currentTime);

        filter.connect(masterGain);
        runningNodesRef.current.push(filter);

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx % 2 === 0 ? "triangle" : "sine";
          // Slight detune for luxurious chorus feel
          osc.frequency.setValueAtTime(
            freq + (Math.random() - 0.5) * 0.4,
            ctx.currentTime,
          );

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.15 / (idx + 1), ctx.currentTime);

          osc.connect(oscGain);
          oscGain.connect(filter);

          osc.start(0);
          runningNodesRef.current.push(osc, oscGain);
        });

        // Filter sweep LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.045, ctx.currentTime); // very slow sweep

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(130, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        lfo.start(0);
        runningNodesRef.current.push(lfo, lfoGain);
      }
    } catch (err) {
      console.error("Failed to play synthesized audio:", err);
    }

    return () => cleanupAudio();
  }, [soundType, volume]);

  // Clean up all audio nodes on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  // Handle Fullscreen triggers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen permission denied:", err);
      });
    } else {
      void document.exitFullscreen();
    }
  };

  // Helper format for large digital timer display
  const formatZenTime = (ms: number, showSec: boolean) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, "0");

    if (h > 0) {
      return showSec ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
    }
    return showSec ? `${pad(m)}:${pad(s)}` : `${pad(m)}`;
  };

  // Quick Distraction Note submission handler
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNoteText.trim();
    if (!trimmed) return;

    setNoteStatus("saving");
    try {
      await on_add_note(trimmed);
      setNoteStatus("saved");
      setNewNoteText("");
      setTimeout(() => setNoteStatus("idle"), 1500);
    } catch {
      setNoteStatus("idle");
    }
  };

  // Breathing configuration metrics
  const getBreathingData = (): {
    text: string;
    scale: number;
    phase: string;
  } => {
    if (breathingMode === "off") {
      return { text: "", scale: 1.0, phase: "" };
    }

    if (breathingMode === "box") {
      // Box breathing cycle: 4s inhale, 4s hold, 4s exhale, 4s hold (16s total)
      if (breathingStep < 4) {
        const pct = breathingStep / 4;
        return {
          text: "Breathe In",
          scale: 1 + pct * 0.45,
          phase: "inhale",
        };
      } else if (breathingStep < 8) {
        return { text: "Hold", scale: 1.45, phase: "hold" };
      } else if (breathingStep < 12) {
        const pct = (breathingStep - 8) / 4;
        return {
          text: "Breathe Out",
          scale: 1.45 - pct * 0.45,
          phase: "exhale",
        };
      } else {
        return { text: "Hold", scale: 1.0, phase: "hold" };
      }
    } else {
      // Calming breathing: 4s inhale, 7s hold, 8s exhale (19s total)
      if (breathingStep < 4) {
        const pct = breathingStep / 4;
        return {
          text: "Breathe In",
          scale: 1 + pct * 0.45,
          phase: "inhale",
        };
      } else if (breathingStep < 11) {
        return { text: "Hold", scale: 1.45, phase: "hold" };
      } else {
        const pct = (breathingStep - 11) / 8;
        return {
          text: "Breathe Out",
          scale: 1.45 - pct * 0.45,
          phase: "exhale",
        };
      }
    }
  };

  const breathing = getBreathingData();

  // Autoplay support trigger: resume AudioContext if user clicks anywhere in overlay
  const handleUserInteract = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  };

  return (
    <div
      onClick={handleUserInteract}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          on_close();
        }
      }}
      tabIndex={0}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto zen-ambient-bg px-6 py-8 text-foreground select-none focus:outline-none sm:px-12 sm:py-10"
    >
      {/* Dynamic Keyframe Animations & Classes Injection */}
      <style jsx global>{`
        @keyframes zen-gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .zen-ambient-bg {
          background: linear-gradient(
            -45deg,
            #07090d,
            #0d1620,
            #0a181b,
            #090e15
          );
          background-size: 400% 400%;
          animation: zen-gradient-shift 30s ease infinite;
          background-attachment: fixed;
        }
        .zen-glass {
          background: rgba(18, 22, 31, 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .zen-glass-hover:hover {
          background: rgba(18, 22, 31, 0.7);
          border-color: rgba(94, 234, 212, 0.15);
        }
        .breathing-ring-pulse {
          box-shadow: 0 0 35px 5px rgba(94, 234, 212, 0.2);
        }
      `}</style>

      {/* TOP HEADER CONTROLS */}
      <header className="flex w-full items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-accent">
            🧘 Flow State Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          {active_entry && (
            <div className="flex items-center gap-2 rounded-full zen-glass px-3 py-1.5 text-xs text-muted">
              <span>Show seconds</span>
              <button
                type="button"
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showSeconds ? "bg-accent" : "bg-tag-bg"
                }`}
                onClick={() => setShowSeconds(!showSeconds)}
                aria-label="Toggle seconds"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-foreground shadow-sm ring-0 transition duration-200 ease-in-out ${
                    showSeconds ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full zen-glass text-muted hover:text-foreground hover:scale-105 transition-all duration-150"
            title="Toggle fullscreen"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14h6v-6M20 10h-6v6M14 4v6h6M10 20v-6H4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="flex h-9 px-4 items-center justify-center rounded-full zen-glass text-muted hover:text-foreground hover:bg-danger-soft hover:border-danger-border hover:scale-105 transition-all duration-150 text-xs font-medium"
            title="Exit Zen Mode (Esc)"
            onClick={on_close}
          >
            Close Flow
          </button>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 w-full max-w-4xl mx-auto z-10">
        {active_entry ? (
          /* ========================================================================= */
          /* ACTIVE TRACKER VIEW */
          /* ========================================================================= */
          <div className="w-full flex flex-col items-center justify-center gap-10">
            {/* BREATHING RING OR GIANT TIMER */}
            <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 select-none">
              {/* Outer Pulsing Breathing Guide Ring */}
              {breathingMode !== "off" && (
                <div
                  className="absolute rounded-full border border-accent/20 bg-accent/5 breathing-ring-pulse transition-all duration-1000 ease-in-out"
                  style={{
                    width: `${breathing.scale * 100}%`,
                    height: `${breathing.scale * 100}%`,
                  }}
                />
              )}

              {/* Breathing Stage Text Label Overlay */}
              {breathingMode !== "off" && (
                <div className="absolute -top-6 text-center">
                  <span className="text-xs uppercase tracking-[0.2em] text-accent/70 font-semibold transition-all duration-300">
                    {breathing.text}
                  </span>
                </div>
              )}

              {/* Inner Glossy Timer Container */}
              <div className="absolute w-60 h-60 rounded-full zen-glass flex flex-col items-center justify-center shadow-lg border border-white/5">
                <span className="text-xs text-muted font-mono uppercase tracking-[0.15em] mb-1">
                  focus session
                </span>
                <h1 className="text-4xl sm:text-5xl font-[500] font-mono tracking-tighter text-foreground mb-2 drop-shadow-md select-text">
                  {formatZenTime(durationMs, showSeconds)}
                </h1>
                <span className="text-xs text-accent font-semibold px-2 py-0.5 rounded-full bg-accent-soft/40 border border-accent-border/30">
                  {active_entry.sheetName}
                </span>
              </div>
            </div>

            {/* DESCRIPTION AND TAGS */}
            <div className="text-center max-w-2xl px-4 flex flex-col gap-2.5">
              <h2 className="text-xl sm:text-2xl font-[600] text-foreground tracking-tight drop-shadow select-text leading-tight">
                {active_entry.description || "Untitled Flow State"}
              </h2>

              {active_entry.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {active_entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs rounded-full zen-glass text-tag-text border border-white/5"
                    >
                      {format_display_tag(tag)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* MINDFUL QUOTE BOX */}
            <div className="max-w-xl mx-auto text-center px-6 transition-all duration-700 ease-in-out">
              <p className="text-sm sm:text-[0.95rem] italic text-muted leading-relaxed font-light select-text">
                &ldquo;{mindfulness_quotes[quoteIndex].text}&rdquo;
              </p>
              <p className="text-xs text-accent/60 font-mono mt-2 tracking-wide uppercase">
                — {mindfulness_quotes[quoteIndex].author}
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ZEN CHECK-IN VIEW (Idle Mode) */
          /* ========================================================================= */
          <div className="w-full max-w-md zen-glass rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold tracking-tight mb-1">
                Enter Flow State
              </h2>
              <p className="text-xs text-muted">
                Ditch distractions and start deep work in Zen Mode.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const desc = checkInDesc.trim();
                if (!desc || !checkInSheet) return;
                on_check_in({ description: desc, sheetName: checkInSheet });
                setCheckInDesc("");
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs text-muted"
                  htmlFor="zen-sheet-select"
                >
                  Target Sheet
                </label>
                <select
                  id="zen-sheet-select"
                  className={`${get_select_class_name()} !bg-panel border-white/5 text-sm`}
                  value={checkInSheet}
                  disabled={is_pending || sheets.length === 0}
                  onChange={(e) => setCheckInSheet(e.target.value)}
                >
                  {sheets
                    .filter((s) => !s.archived)
                    .map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs text-muted"
                  htmlFor="zen-checkin-desc"
                >
                  What is your absolute focus right now?
                </label>
                <TagAutocompleteInput
                  id="zen-checkin-desc"
                  value={checkInDesc}
                  known_tags={known_tags}
                  placeholder="e.g. design system improvements @design"
                  disabled={is_pending}
                  autoFocus
                  on_change={setCheckInDesc}
                />
              </div>

              <button
                type="submit"
                className={`${get_button_class_name("primary")} w-full mt-2 cursor-pointer font-bold text-sm tracking-wide py-3 bg-accent border-accent-border text-accent-text-on shadow-lg hover:scale-[1.01] transition-transform duration-100`}
                disabled={is_pending || checkInDesc.trim().length === 0}
              >
                Start Flow Tracker
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-[0.75rem] italic text-muted leading-relaxed font-light max-w-sm mx-auto">
                &ldquo;{mindfulness_quotes[quoteIndex].text}&rdquo;
              </p>
              <p className="text-[0.65rem] text-accent/50 font-mono mt-1">
                — {mindfulness_quotes[quoteIndex].author}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER CONTROLS & UTILITIES */}
      <footer className="w-full flex flex-col gap-5 pt-4 border-t border-white/5 z-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          {/* SOUNDSCAPE CONTROLS */}
          <div className="flex flex-col gap-2 max-w-xs w-full">
            <span className="text-[0.68rem] font-bold text-muted uppercase tracking-[0.1em]">
              Ambient Focus Audio
            </span>
            <div className="flex flex-wrap gap-1">
              {(["none", "brown", "waves", "rain", "drone"] as SoundType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-2.5 py-1 rounded-[0.45rem] text-xs font-semibold border transition-all duration-150 ${
                      soundType === type
                        ? "bg-accent border-accent-border text-accent-text-on scale-105"
                        : "zen-glass border-white/5 text-muted hover:text-foreground"
                    }`}
                    onClick={() => setSoundType(type)}
                  >
                    {type === "none" && "Off"}
                    {type === "brown" && "Brown Noise"}
                    {type === "waves" && "Waves"}
                    {type === "rain" && "Rain"}
                    {type === "drone" && "Zen Drone"}
                  </button>
                ),
              )}
            </div>

            {soundType !== "none" && (
              <div className="flex items-center gap-3 mt-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted"
                >
                  <polygon points="11 5 6 9 2 9 2 13 6 13 11 17 11 5" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  aria-label="Volume slider"
                />
                <span className="font-mono text-[0.65rem] text-muted w-6 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* BREATHING GUIDE CONTROLS */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.68rem] font-bold text-muted uppercase tracking-[0.1em]">
              Breathing Flow Guide
            </span>
            <div className="flex gap-1.5">
              {(["off", "calm", "box"] as BreathingMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`px-3 py-1 rounded-[0.45rem] text-xs font-semibold border transition-all duration-150 ${
                    breathingMode === mode
                      ? "bg-accent border-accent-border text-accent-text-on scale-105"
                      : "zen-glass border-white/5 text-muted hover:text-foreground"
                  }`}
                  onClick={() => setBreathingMode(mode)}
                >
                  {mode === "off" && "Disabled"}
                  {mode === "calm" && "Calming (4-7-8)"}
                  {mode === "box" && "Box Breathing (4-4-4-4)"}
                </button>
              ))}
            </div>
          </div>

          {/* DISTRACTION NOTE PAD */}
          {active_entry && (
            <form
              onSubmit={handleNoteSubmit}
              className="flex flex-col gap-2 max-w-sm w-full"
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  className="text-[0.68rem] font-bold text-muted uppercase tracking-[0.1em]"
                  htmlFor="zen-distraction-input"
                >
                  Distraction Note Pad
                </label>
                {noteStatus === "saving" && (
                  <span className="text-[0.65rem] text-accent/80 font-mono animate-pulse">
                    Filing note…
                  </span>
                )}
                {noteStatus === "saved" && (
                  <span className="text-[0.65rem] text-accent font-mono">
                    ✓ Distraction cleared
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <TagAutocompleteInput
                  id="zen-distraction-input"
                  value={newNoteText}
                  known_tags={known_tags}
                  placeholder="Capture distracting thoughts here…"
                  disabled={is_pending || noteStatus === "saving"}
                  on_change={setNewNoteText}
                />
                <button
                  type="submit"
                  className={`${get_button_class_name("ghost")} px-3 text-xs border border-white/5 hover:border-accent-border/40 hover:text-accent font-bold`}
                  disabled={
                    is_pending ||
                    noteStatus === "saving" ||
                    newNoteText.trim().length === 0
                  }
                >
                  Capture
                </button>
              </div>
            </form>
          )}
        </div>

        {/* GIANT ACTION BUTTON */}
        {active_entry && (
          <div className="flex w-full justify-center pt-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full border border-danger-border/40 bg-danger-soft px-8 py-3.5 text-sm font-semibold tracking-wide text-danger shadow-md hover:bg-danger-solid hover:text-danger-text-on hover:scale-[1.01] hover:shadow-lg focus:outline-none transition-all duration-150 cursor-pointer w-full max-w-md"
              disabled={is_pending}
              onClick={() => {
                on_check_out();
                on_close();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Complete Focus Session (Check Out)
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
