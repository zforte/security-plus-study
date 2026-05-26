import { useState } from "react";
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

function QuizCard({ q, onNext, onPrev, total, index }) {
  const numCorrect = q.correct.length;
  const [selected, setSelected] = useState(new Set());
  const [revealed, setRevealed] = useState(false);

  const domain = categorizeTopic(q.text, q.options);
  const domainColor = DOMAIN_COLORS[domain] || "#6b7280";

  const toggleSelect = (letter) => {
    if (revealed) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (numCorrect === 1) {
        next.clear();
        next.add(letter);
      } else {
        if (next.has(letter)) {
          next.delete(letter);
        } else if (next.size < numCorrect) {
          next.add(letter);
        }
      }
      return next;
    });
  };

  const reset = () => { setSelected(new Set()); setRevealed(false); };

  const selectedArr = Array.from(selected).sort().join("");
  const correctArr = q.correct.split("").sort().join("");
  const gotItRight = revealed && selectedArr === correctArr;
  const gotItWrong = revealed && selected.size > 0 && selectedArr !== correctArr;
  const didNotAnswer = revealed && selected.size === 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1f2937" }}>Security+ SY0-701</span>
          <span style={{ marginLeft: 10, fontSize: 13, color: "#6b7280" }}>Study Guide</span>
        </div>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Q {index + 1} / {total}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ background: domainColor + "18", color: domainColor, border: "1px solid " + domainColor + "40", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{domain}</span>
        <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>Q#{q.num}</span>
        {numCorrect > 1 && (
          <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
            Choose {numCorrect} ({selected.size}/{numCorrect} selected)
          </span>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", marginBottom: 16, lineHeight: 1.6, fontSize: 16, color: "#1f2937", whiteSpace: "pre-wrap" }}>
        {q.text}
      </div>

      {gotItRight && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>Correct! Great job.</span>
        </div>
      )}
      {gotItWrong && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#c2410c", fontSize: 14, marginBottom: 4 }}>⚠️ Incorrect</div>
          <div style={{ fontSize: 13, color: "#9a3412" }}>
            You selected: <strong>{Array.from(selected).sort().join(", ")}</strong>. The correct answer{numCorrect > 1 ? "s are" : " is"}: <strong>{q.correct.split("").join(", ")}</strong> — {q.options.filter(o => q.correct.includes(o[0])).map(o => o[0] + ". " + o[1]).join("; ")}.
          </div>
        </div>
      )}
      {didNotAnswer && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            No answer selected. The correct answer{numCorrect > 1 ? "s are" : " is"}: <strong>{q.correct.split("").join(", ")}</strong> — {q.options.filter(o => q.correct.includes(o[0])).map(o => o[0] + ". " + o[1]).join("; ")}.
          </div>
        </div>
      )}

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

      {!revealed && (
        <button onClick={() => setRevealed(true)}
          style={{ width: "100%", padding: "14px", background: "#1f2937", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
          Check Answer
        </button>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => { reset(); onPrev(); }} disabled={index === 0}
          style={{ flex: 1, padding: "12px", background: index === 0 ? "#f3f4f6" : "#fff", color: index === 0 ? "#9ca3af" : "#374151", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: index === 0 ? "not-allowed" : "pointer" }}>
          ← Previous
        </button>
        <button onClick={() => { reset(); onNext(); }} disabled={index === total - 1}
          style={{ flex: 1, padding: "12px", background: index === total - 1 ? "#f3f4f6" : "#1f2937", color: index === total - 1 ? "#9ca3af" : "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: index === total - 1 ? "not-allowed" : "pointer" }}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [filterDomain, setFilterDomain] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const domains = ["All", ...Object.keys(DOMAIN_COLORS)];

  const filtered = QUESTIONS.filter(q => {
    const domain = categorizeTopic(q.text, q.options);
    const matchesDomain = filterDomain === "All" || domain === filterDomain;
    const matchesSearch = !searchQ || q.text.toLowerCase().includes(searchQ.toLowerCase()) || q.options.some(o => o[1].toLowerCase().includes(searchQ.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const current = filtered[safeIndex];

  if (!current) return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No questions match your filter.</div>;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", paddingTop: 20 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 16px" }}>
        <input type="text" placeholder="Search questions..." value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setIndex(0); }}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {domains.map(d => (
            <button key={d} onClick={() => { setFilterDomain(d); setIndex(0); }}
              style={{ padding: "5px 12px", borderRadius: 20, border: filterDomain === d ? "none" : "1px solid #d1d5db", background: filterDomain === d ? "#1f2937" : "#fff", color: filterDomain === d ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {d === "All" ? "All (" + QUESTIONS.length + ")" : d.split(" ")[0]}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
          {filtered.length} question{filtered.length !== 1 ? "s" : ""}{filterDomain !== "All" ? " in " + filterDomain : ""}{searchQ ? ' matching "' + searchQ + '"' : ""}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="number" placeholder="Jump to #" value={jumpInput}
            onChange={e => setJumpInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const i = parseInt(jumpInput) - 1;
                if (!isNaN(i) && i >= 0 && i < filtered.length) { setIndex(i); setJumpInput(""); }
              }
            }}
            style={{ width: 90, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Press Enter to jump</span>
        </div>
      </div>

      <QuizCard
        key={current.num + "-" + safeIndex}
        q={current}
        index={safeIndex}
        total={filtered.length}
        onNext={() => setIndex(i => Math.min(i + 1, filtered.length - 1))}
        onPrev={() => setIndex(i => Math.max(i - 1, 0))}
      />
    </div>
  );
}
