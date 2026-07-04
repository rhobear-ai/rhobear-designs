/**
 * Push-to-talk voice input (Pro). Uses the browser Web Speech API (Chromium /
 * Edge / Safari) → a transcript the AI panel feeds as a prompt. Structured so a
 * desktop build can swap in a local Whisper backend behind the same interface.
 * MIT — RHOBEAR Designs.
 */
export function voiceSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * @param {{ onText:(t:string)=>void, onState:(state:string, detail?:any)=>void }} cb
 * @returns {{start:()=>void, stop:()=>void, active:()=>boolean} | null}
 */
export function createVoice({ onText, onState } = {}) {
  const SR = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return null;
  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  let finalText = '';
  let running = false;

  rec.onstart = () => { running = true; onState && onState('listening'); };
  rec.onerror = (e) => { onState && onState('error', e && e.error); };
  rec.onend = () => {
    running = false;
    onState && onState('idle');
    const t = finalText.trim();
    finalText = '';
    if (t) onText && onText(t);
  };
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t; else interim += t;
    }
    onState && onState('partial', (finalText + interim).trim());
  };

  return {
    start() { finalText = ''; try { rec.start(); } catch (_e) { /* already started */ } },
    stop() { try { rec.stop(); } catch (_e) { /* ignore */ } },
    active() { return running; },
  };
}
