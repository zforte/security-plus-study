import { useState, useCallback } from "react";
import QUESTIONS from "./questions";

const DOMAIN_COLORS = {
  "Threats, Attacks & Vulnerabilities": "#ef4444",
  "Technologies & Tools": "#3b82f6",
  "Architecture & Design": "#8b5cf6",
  "Identity & Access Management": "#10b981",
  "Risk Management": "#f59e0b",
  "Cryptography & PKI": "#06b6d4",
};

function categorizeTopic(text, opts) {
  const t = (text + opts.map(o => o[1]).join(" ")).toLowerCase();
  if (/risk register|risk transfer|risk accept|risk avoi|risk mitig|risk toler|risk appetit|bia|bcp|drp|rto|rpo|mttr|mtbf|sle|ale|aro|insurance|continuity|disaster|compliance|audit|governance|policy|sla|mou|moa|nda|bpa|sow|due diligence/.test(t)) return "Risk Management";
  if (/encrypt|hash|salt|aes|rsa|ecc|tls|ssl|pki|certificate|asymmetr|symmetr|public key|private key|digital sign|cipher|crypto|pgp|gpg|key escrow|hsm|tpm/.test(t)) return "Cryptography & PKI";
  if (/identity|access|mfa|sso|saml|oauth|ldap|radius|tacacs|rbac|least priv|authenticat|authori|provisioning|pam|iam|federation/.test(t)) return "Identity & Access Management";
  if (/firewall|ids|ips|siem|soc|vpn|vlan|dmz|nat|proxy|load balance|router|switch|wireless|wifi|802\.1|sase|sd-wan|nac|honeypot|segmentation|network|port|protocol|dns|dhcp/.test(t)) return "Technologies & Tools";
  if (/architect|cloud|container|virtual|microservice|serverless|infrastructure|hardening|baseline|patch|config|decommission|lifecycle|sdlc|devops/.test(t)) return "Architecture & Design";
  return "Threats, Attacks & Vulnerabilities";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ScoreBar({ correct, incorrect, total, answered }) {
  const pct = answered === 0 ? 0 : Math.round((correct / answered) * 100);
  const correctPct = total === 0 ? 0 : (correct / total) * 100;
  const incorrectPct = total === 0 ? 0 : (incorrect / total) * 100;
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>Session Score</span>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{answered} / {total} answered</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          <span style={{ fontSize: 13, color: "#065f46", fontWeight: 600 }}>{correct} correct</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
          <span style={{ fontSize: 13, color: "#7f1d1d", fontWeight: 600 }}>{incorrect} incorrect</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{pct}% accuracy</span>
        </div>
      </div>
      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", display: "flex" }}>
        <div style={{ width: correctPct + "%", background: "#10b981", transition: "width 0.4s ease" }}></div>
        <div style={{ width: incorrectPct + "%", background: "#ef4444", transition: "width 0.4s ease" }}></div>
      </div>
    </div>
  );
}

function QuizCard({ q, index, total, onNext, onPrev, onAnswered, alreadyAnswered }) {
  const numCorrect = q.correct.length;
  const [selected, setSelected] = useState(new Set());
  const [revealed, setRevealed] = useState(alreadyAnswered !== undefined);

  const domain = categorizeTopic(q.text, q.options);
  const domainColor = DOMAIN_COLORS[domain] || "#6b7280";
  const hasExplanation = q.explanation && q.explanation !== "N/A";

  const toggleSelect = (letter) => {
    if (revealed) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (numCorrect === 1) { next.clear(); next.add(letter); }
      else { if (next.has(letter)) next.delete(letter); else if (next.size < numCorrect) next.add(letter); }
      return next;
    });
  };

  const handleReveal = () => {
    const selectedArr = Array.from(selected).sort().join("");
    const correctArr = q.correct.split("").sort().join("");
    const isCorrect = selectedArr === correctArr && selected.size > 0;
    const isWrong = selected.size > 0 && selectedArr !== correctArr;
    setRevealed(true);
    if (alreadyAnswered === undefined) onAnswered(q.num, isCorrect, isWrong);
  };

  const selectedArr = Array.from(selected).sort().join("");
  const correctArr = q.correct.split("").sort().join("");

  let resultState = null;
  if (revealed) {
    if (alreadyAnswered !== undefined) resultState = alreadyAnswered;
    else if (selected.size === 0) resultState = "skipped";
    else if (selectedArr === correctArr) resultState = "correct";
    else resultState = "wrong";
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: "0 16px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1f2937" }}>Security+ SY0-701</span>
          <span style={{ marginLeft: 10, fontSize: 13, color: "#6b7280" }}>Study Guide</span>
        </div>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Q {index + 1} / {total}</span>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ background: domainColor + "18", color: domainColor, border: "1px solid " + domainColor + "40", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{domain}</span>
        <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>Q#{q.num}</span>
        {numCorrect > 1 && (
          <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
            Choose {numCorrect} ({selected.size}/{numCorrect} selected)
          </span>
        )}
        {alreadyAnswered === "wrong" && (
          <span style={{ background: "#fee2e2", color: "#7f1d1d", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>⚠️ Previously missed</span>
        )}
      </div>

      {/* Question text */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", marginBottom: 16, lineHeight: 1.6, fontSize: 16, color: "#1f2937", whiteSpace: "pre-wrap" }}>
        {q.text}
      </div>

      {/* Result banners */}
      {resultState === "correct" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>Correct! Great job.</span>
        </div>
      )}
      {resultState === "wrong" && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#c2410c", fontSize: 14, marginBottom: 4 }}>⚠️ Incorrect</div>
          <div style={{ fontSize: 13, color: "#9a3412" }}>
            {selected.size > 0 && <>You selected: <strong>{Array.from(selected).sort().join(", ")}</strong>. </>}
            The correct answer{numCorrect > 1 ? "s are" : " is"}: <strong>{q.correct.split("").join(", ")}</strong> — {q.options.filter(o => q.correct.includes(o[0])).map(o => o[0] + ". " + o[1]).join("; ")}.
          </div>
        </div>
      )}
      {resultState === "skipped" && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            No answer selected. The correct answer{numCorrect > 1 ? "s are" : " is"}: <strong>{q.correct.split("").join(", ")}</strong> — {q.options.filter(o => q.correct.includes(o[0])).map(o => o[0] + ". " + o[1]).join("; ")}.
          </div>
        </div>
      )}

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map(function(opt) {
          const letter = opt[0], text = opt[1];
          const isCorrect = q.correct.includes(letter);
          const isSelected = selected.has(letter);
          let bg = "#fff", border = "1px solid #d1d5db", textColor = "#374151";
          if (revealed) {
            if (isCorrect) { bg = "#d1fae5"; border = "2px solid #10b981"; textColor = "#065f46"; }
            else if (isSelected) { bg = "#fee2e2"; border = "2px solid #ef4444"; textColor = "#7f1d1d"; }
          } else if (isSelected) {
            bg = "#eff6ff"; border = "2px solid #3b82f6"; textColor = "#1e40af";
          }
          const circBg = revealed ? (isCorrect ? "#10b981" : isSelected ? "#ef4444" : "#e5e7eb") : (isSelected ? "#3b82f6" : "#e5e7eb");
          const circColor = (revealed && (isCorrect || isSelected)) ? "#fff" : isSelected ? "#fff" : "#6b7280";
          return (
            <button key={letter} onClick={() => toggleSelect(letter)}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, background: bg, border, borderRadius: 10, padding: "14px 16px", cursor: revealed ? "default" : "pointer", textAlign: "left", transition: "all 0.15s", width: "100%" }}>
              <span style={{ minWidth: 28, height: 28, borderRadius: numCorrect > 1 ? "4px" : "50%", background: circBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: circColor, flexShrink: 0 }}>
                {letter}
              </span>
              <span style={{ fontSize: 15, color: textColor, lineHeight: 1.5, paddingTop: 2, flex: 1 }}>{text}</span>
              {revealed && isCorrect && <span style={{ marginLeft: "auto", color: "#10b981", fontSize: 18, flexShrink: 0 }}>✓</span>}
              {revealed && isSelected && !isCorrect && <span style={{ marginLeft: "auto", color: "#ef4444", fontSize: 18, flexShrink: 0 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Check Answer button */}
      {!revealed && (
        <button onClick={handleReveal}
          style={{ width: "100%", padding: "14px", background: "#1f2937", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
          Check Answer
        </button>
      )}

      {/* Explanation box — shown after reveal */}
      {revealed && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: hasExplanation ? 10 : 0 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#475569" }}>Explanation</span>
            {!hasExplanation && <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>— not provided for this question</span>}
          </div>
          {hasExplanation && (
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}>
              {q.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onPrev} disabled={index === 0}
          style={{ flex: 1, padding: "12px", background: index === 0 ? "#f3f4f6" : "#fff", color: index === 0 ? "#9ca3af" : "#374151", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: index === 0 ? "not-allowed" : "pointer" }}>
          ← Previous
        </button>
        <button onClick={onNext} disabled={index === total - 1}
          style={{ flex: 1, padding: "12px", background: index === total - 1 ? "#f3f4f6" : "#1f2937", color: index === total - 1 ? "#9ca3af" : "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: index === total - 1 ? "not-allowed" : "pointer" }}>
          Next →
        </button>
      </div>
    </div>
  );
}

function WrongAnswersModal({ wrongNums, onClose, onRetry }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 440, width: "100%", maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1f2937", marginBottom: 6 }}>Questions You Missed</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>{wrongNums.length} question{wrongNums.length !== 1 ? "s" : ""} answered incorrectly</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {wrongNums.map(n => (
            <span key={n} style={{ background: "#fee2e2", color: "#7f1d1d", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 600 }}>Q#{n}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Close
          </button>
          <button onClick={onRetry}
            style={{ flex: 1, padding: "11px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Retry Missed ({wrongNums.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [queue, setQueue] = useState(QUESTIONS);
  const [index, setIndex] = useState(0);
  const [filterDomain, setFilterDomain] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [isShuffled, setIsShuffled] = useState(false);
  const [mode, setMode] = useState("all");
  const [scores, setScores] = useState({});
  const [showWrongModal, setShowWrongModal] = useState(false);

  const domains = ["All", ...Object.keys(DOMAIN_COLORS)];

  const basePool = mode === "wrong"
    ? QUESTIONS.filter(q => scores[q.num] === "wrong")
    : QUESTIONS;

  const filtered = basePool.filter(q => {
    const domain = categorizeTopic(q.text, q.options);
    const matchesDomain = filterDomain === "All" || domain === filterDomain;
    const matchesSearch = !searchQ || q.text.toLowerCase().includes(searchQ.toLowerCase()) || q.options.some(o => o[1].toLowerCase().includes(searchQ.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const displayQueue = isShuffled ? queue.filter(q => filtered.find(f => f.num === q.num)) : filtered;
  const safeIndex = Math.min(index, Math.max(0, displayQueue.length - 1));
  const current = displayQueue[safeIndex];

  const handleAnswered = useCallback((num, isCorrect, isWrong) => {
    setScores(prev => ({ ...prev, [num]: isCorrect ? "correct" : isWrong ? "wrong" : "skipped" }));
  }, []);

  const handleShuffle = () => { setQueue(shuffle(filtered)); setIsShuffled(true); setIndex(0); };
  const handleUnshuffle = () => { setIsShuffled(false); setIndex(0); };

  const handleRetryWrong = () => {
    const wrongOnes = QUESTIONS.filter(q => scores[q.num] === "wrong");
    setQueue(wrongOnes);
    setIsShuffled(true);
    setMode("wrong");
    setFilterDomain("All");
    setSearchQ("");
    setIndex(0);
    setShowWrongModal(false);
  };

  const handleResetSession = () => {
    setScores({});
    setMode("all");
    setIsShuffled(false);
    setIndex(0);
    setQueue(QUESTIONS);
  };

  const wrongNums = QUESTIONS.filter(q => scores[q.num] === "wrong").map(q => q.num);
  const correctCount = Object.values(scores).filter(v => v === "correct").length;
  const wrongCount = Object.values(scores).filter(v => v === "wrong").length;
  const answeredCount = Object.values(scores).filter(v => v !== undefined).length;

  if (!current) return (
    <div style={{ padding: 40, textAlign: "center", color: "#6b7280", fontFamily: "system-ui" }}>
      {mode === "wrong" ? (
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#1f2937", marginBottom: 8 }}>All missed questions reviewed!</div>
          <button onClick={() => { setMode("all"); setIsShuffled(false); setIndex(0); }}
            style={{ marginTop: 16, padding: "12px 24px", background: "#1f2937", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Back to All Questions
          </button>
        </div>
      ) : "No questions match your filter."}
    </div>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", paddingTop: 20 }}>
      {showWrongModal && (
        <WrongAnswersModal wrongNums={wrongNums} onClose={() => setShowWrongModal(false)} onRetry={handleRetryWrong} />
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 16px" }}>
        <ScoreBar correct={correctCount} incorrect={wrongCount} answered={answeredCount} total={displayQueue.length} />

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {!isShuffled ? (
            <button onClick={handleShuffle}
              style={{ padding: "7px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              🔀 Shuffle
            </button>
          ) : (
            <button onClick={handleUnshuffle}
              style={{ padding: "7px 14px", background: "#1f2937", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>
              🔀 Shuffled — Reset Order
            </button>
          )}
          {wrongCount > 0 && (
            <button onClick={() => setShowWrongModal(true)}
              style={{ padding: "7px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#7f1d1d" }}>
              ⚠️ Missed ({wrongCount})
            </button>
          )}
          {answeredCount > 0 && (
            <button onClick={handleResetSession}
              style={{ padding: "7px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6b7280" }}>
              ↺ Reset Session
            </button>
          )}
          {mode === "wrong" && (
            <button onClick={() => { setMode("all"); setIsShuffled(false); setIndex(0); }}
              style={{ padding: "7px 14px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#92400e" }}>
              ← All Questions
            </button>
          )}
        </div>

        <input type="text" placeholder="Search questions..." value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setIndex(0); }}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {domains.map(d => (
            <button key={d} onClick={() => { setFilterDomain(d); setIndex(0); }}
              style={{ padding: "5px 12px", borderRadius: 20, border: filterDomain === d ? "none" : "1px solid #d1d5db", background: filterDomain === d ? "#1f2937" : "#fff", color: filterDomain === d ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {d === "All" ? "All (" + displayQueue.length + ")" : d.split(" ")[0]}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
          {displayQueue.length} question{displayQueue.length !== 1 ? "s" : ""}
          {mode === "wrong" ? " (missed only)" : filterDomain !== "All" ? " in " + filterDomain : ""}
          {searchQ ? ' matching "' + searchQ + '"' : ""}
          {isShuffled ? " — shuffled" : ""}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="number" placeholder="Jump to #" value={jumpInput}
            onChange={e => setJumpInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const i = parseInt(jumpInput) - 1;
                if (!isNaN(i) && i >= 0 && i < displayQueue.length) { setIndex(i); setJumpInput(""); }
              }
            }}
            style={{ width: 90, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Press Enter to jump</span>
        </div>
      </div>

      <QuizCard
        key={current.num + "-" + safeIndex + "-" + mode}
        q={current}
        index={safeIndex}
        total={displayQueue.length}
        alreadyAnswered={scores[current.num]}
        onAnswered={handleAnswered}
        onNext={() => setIndex(i => Math.min(i + 1, displayQueue.length - 1))}
        onPrev={() => setIndex(i => Math.max(i - 1, 0))}
      />
    </div>
  );
}
