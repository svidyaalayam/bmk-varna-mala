import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CharacterCard } from "./components/CharacterCard";
import { StrokeDemo } from "./components/StrokeDemo";
import { TracingBoard } from "./components/TracingBoard";
import { PrintableWorksheet } from "./components/PrintableWorksheet";
import { WorksheetCertificate } from "./components/WorksheetCertificate";
import { teluguCharacters } from "./data/teluguCharacters";
import { WordExamples } from "./components/WordExamples";
import {
  LanguageSelector,
  type LanguageId,
} from "./components/LanguageSelector";
import { aWordExamples } from "./data/teluguWordExamples";
import { hindiCharacters } from "./data/hindiCharacters";
import type { BmkUser } from "./types/bmk";
import type { TraceAttempt } from "./types/trace";
import { displayBmkName, fetchBmkUser, readBmkHandoff } from "./utils/bmkSso";

function readStoredBmkUser(): BmkUser | null {
  try {
    const stored = sessionStorage.getItem("varna_bmk_user");
    return stored ? (JSON.parse(stored) as BmkUser) : null;
  } catch {
    return null;
  }
}

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [language, setLanguage] = useState<LanguageId>("telugu");
  const [mode, setMode] = useState<"learn" | "trace">("learn");
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(5);
  const [traceAttempts, setTraceAttempts] = useState<TraceAttempt[]>([]);
  const [showPrintableWorksheet, setShowPrintableWorksheet] = useState(false);
  const [bmkUser, setBmkUser] = useState<BmkUser | null>(readStoredBmkUser);
  const [handoffName, setHandoffName] = useState(
    () => sessionStorage.getItem("varna_handoff_name") || "",
  );
  const [manualName, setManualName] = useState(
    () => sessionStorage.getItem("varna_manual_name") || "",
  );
  const [parentReturnUrl, setParentReturnUrl] = useState(
    () => sessionStorage.getItem("varna_parent_return") || "",
  );
  const characters = language === "hindi" ? hindiCharacters : teluguCharacters;
  const activeLesson = characters[selectedIndex] ?? characters[0];
  const userName = bmkUser
    ? displayBmkName(bmkUser)
    : handoffName || manualName.trim();
  const vowelIds = new Set(["a", "aa", "i", "ii"]);
  const vowels = characters.filter((item) => vowelIds.has(item.id));
  const consonants = characters.filter((item) => !vowelIds.has(item.id));
  const categoryLabels = {
    telugu: { vowels: "అచ్చులు", consonants: "హల్లులు" },
    hindi: { vowels: "स्वर", consonants: "व्यंजन" },
    kannada: { vowels: "ಸ್ವರಗಳು", consonants: "ವ್ಯಂಜನಗಳು" },
    tamil: { vowels: "உயிரெழுத்துக்கள்", consonants: "மெய்யெழுத்துக்கள்" },
  }[language];

  useEffect(() => {
    const handoff = readBmkHandoff();
    if (!handoff) return;
    setHandoffName(handoff.displayName || "");
    setParentReturnUrl(handoff.returnTo || "");
    if (handoff.displayName)
      sessionStorage.setItem("varna_handoff_name", handoff.displayName);
    if (handoff.returnTo)
      sessionStorage.setItem("varna_parent_return", handoff.returnTo);

    fetchBmkUser(handoff.token, handoff.apiOrigin)
      .then((profile) => {
        setBmkUser(profile);
        sessionStorage.setItem("varna_bmk_user", JSON.stringify(profile));
      })
      .catch(() => setBmkUser(null));
  }, []);

  const selectLanguage = (nextLanguage: LanguageId) => {
    setLanguage(nextLanguage);
    setSelectedIndex(0);
    setMode("learn");
    setPlaying(false);
    setTraceAttempts([]);
  };

  const recordTrace = useCallback(
    (attempt: TraceAttempt) => {
      setTraceAttempts((items) => {
        const nextItems = [...items, attempt];
        if (nextItems.length >= targetCount) {
          const completionId = `${language}:${activeLesson.id}`;
          setCompleted((completedItems) =>
            completedItems.includes(completionId)
              ? completedItems
              : [...completedItems, completionId],
          );
        }
        return nextItems;
      });
    },
    [activeLesson.id, language, targetCount],
  );

  const chooseCharacter = (index: number) => {
    setSelectedIndex(index);
    setMode("learn");
    setPlaying(false);
    setTraceAttempts([]);
  };

  const nextCharacter = () => {
    setSelectedIndex((index) => Math.min(index + 1, characters.length - 1));
    setMode("learn");
    setPlaying(false);
    setTraceAttempts([]);
  };

  const previousCharacter = () => {
    setSelectedIndex((index) => Math.max(index - 1, 0));
    setMode("learn");
    setPlaying(false);
    setTraceAttempts([]);
  };

  if (showPrintableWorksheet) {
    return (
      <PrintableWorksheet
        lesson={activeLesson}
        userName={userName}
        onClose={() => setShowPrintableWorksheet(false)}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img
            className="brand-logo"
            src="BMK_New_Logo.png"
            alt="బాలముకుందము logo"
          />
          <div>
            <strong>బాలముకుందము</strong>
            <span>వర్ణమాల</span>
          </div>
        </div>
        <div className="topbar-actions">
          <LanguageSelector value={language} onChange={selectLanguage} />
          {parentReturnUrl && (
            <button
              className="parent-back-button"
              type="button"
              onClick={() => window.location.assign(parentReturnUrl)}
            >
              ← Parent dashboard
            </button>
          )}
          <div className="progress-pill">
            <span>★</span> {completed.length} learned
          </div>
        </div>
      </header>

      <section className="welcome">
        <div className="welcome-copy">
          <h1>
            {userName ? (
              <>
                <span className="welcome-greeting">Welcome back,</span>
                <span className="welcome-name">{userName} !</span>
              </>
            ) : (
              "Let’s learn to write!"
            )}
          </h1>
          <p className="intro">Trace and learn each letter.</p>
          {!bmkUser && !handoffName && (
            <label className="manual-name-field">
              <span>
                Your name <em>(optional)</em>
              </span>
              <input
                value={manualName}
                onChange={(event) => {
                  const name = event.target.value;
                  setManualName(name);
                  sessionStorage.setItem("varna_manual_name", name);
                }}
                placeholder="Type your name"
                maxLength={80}
              />
            </label>
          )}
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-art-letter">అ</span>
          <span className="welcome-art-spark spark-one">✦</span>
          <span className="welcome-art-spark spark-two">✦</span>
        </div>
      </section>

      <section className="lesson-picker" aria-labelledby="choose-letter">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Choose a letter</p>
            <h2 id="choose-letter">Pick one to practise</h2>
          </div>
          <span className="set-label">
            {language === "hindi" ? "Hindi · हिन्दी" : "Telugu · తెలుగు"}
          </span>
        </div>
        <div className="letter-sessions">
          <details className="letter-session" open>
            <summary>
              <span>
                <strong>{categoryLabels.vowels}</strong>
                <small>Vowels</small>
              </span>
              <span className="session-chevron">⌄</span>
            </summary>
            <div className="character-grid">
              {vowels.map((item) => {
                const index = teluguCharacters.findIndex(
                  (character) => character.id === item.id,
                );
                return (
                  <CharacterCard
                    key={item.id}
                    lesson={item}
                    selected={index === selectedIndex}
                    onSelect={() => chooseCharacter(index)}
                  />
                );
              })}
            </div>
          </details>
          <details className="letter-session">
            <summary>
              <span>
                <strong>{categoryLabels.consonants}</strong>
                <small>Consonants</small>
              </span>
              <span className="session-chevron">⌄</span>
            </summary>
            <div className="character-grid">
              {consonants.map((item) => {
                const index = teluguCharacters.findIndex(
                  (character) => character.id === item.id,
                );
                return (
                  <CharacterCard
                    key={item.id}
                    lesson={item}
                    selected={index === selectedIndex}
                    onSelect={() => chooseCharacter(index)}
                  />
                );
              })}
            </div>
          </details>
        </div>
      </section>

      <section className="lesson-area">
        <button
          className="worksheet-link"
          type="button"
          onClick={() => setShowPrintableWorksheet(true)}
        >
          Print a writing worksheet for {activeLesson.glyph} <span>↗</span>
        </button>
        <div className="letter-navigation" aria-label="Letter navigation">
          <button
            className="secondary-button"
            type="button"
            onClick={previousCharacter}
            disabled={selectedIndex === 0}
          >
            ← Previous letter
          </button>
          <span>
            {selectedIndex + 1} of {characters.length}
          </span>
          <button
            className="secondary-button"
            type="button"
            onClick={nextCharacter}
            disabled={selectedIndex === characters.length - 1}
          >
            Next letter →
          </button>
        </div>

        {mode === "learn" ? (
          <div className="learn-grid">
            <div className="fact-card">
              <p className="eyebrow">A word to remember</p>
              <p className="example-word">{activeLesson.exampleWord}</p>
              <p className="tip">💡 {activeLesson.tip}</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => setMode("trace")}
              >
                Practice <span>→</span>
              </button>
            </div>
            <StrokeDemo
              strokes={activeLesson.strokes}
              playing={playing}
              onPlayingChange={setPlaying}
            />
          </div>
        ) : traceAttempts.length >= targetCount ? (
          <WorksheetCertificate
            lesson={activeLesson}
            attempts={traceAttempts}
            targetCount={targetCount}
            userName={userName}
            onBack={() => setTraceAttempts([])}
          />
        ) : (
          <div className="trace-layout">
            <TracingBoard
              key={`${language}-${activeLesson.id}-${traceAttempts.length}`}
              lesson={activeLesson}
              onComplete={recordTrace}
            />
            <aside className="trace-side">
              <p className="eyebrow">Today's homework</p>
              <h3>Trace it {targetCount} times</h3>
              <label className="homework-input">
                <span>How many times?</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={targetCount}
                  onChange={(event) => {
                    const count = Number.parseInt(event.target.value, 10);
                    if (Number.isFinite(count) && count > 0) {
                      setTargetCount(count);
                      setTraceAttempts([]);
                    }
                  }}
                  aria-label="Number of times to trace"
                />
              </label>
              <div className="homework-count">
                <strong>{traceAttempts.length}</strong> / {targetCount}{" "}
                completed
              </div>
              <p>
                Start at the glowing dot and follow every part of the grey path.
              </p>
              <button
                className="secondary-button full-width"
                type="button"
                onClick={() => setMode("learn")}
              >
                ← Look and Learn
              </button>
            </aside>
          </div>
        )}
      </section>

      {language === "telugu" && activeLesson.id === "a" && (
        <WordExamples words={aWordExamples} />
      )}

      <footer>
        Made for curious little writers <span>•</span> తెలుగు నేర్చుకుందాం
      </footer>
    </main>
  );
}

export default App;
