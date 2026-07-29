// Wraps the Wake Lock, Vibration, and Web Audio APIs with capability checks
// so RestTimer can call these unconditionally — each silently no-ops on a
// browser that doesn't support it (notably Safari's inconsistent Wake Lock
// support) instead of throwing.

export async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return null;
  try {
    return await navigator.wakeLock.request("screen");
  } catch {
    // Denied, or the tab isn't visible yet — not fatal, the timer just
    // won't hold the screen awake this time.
    return null;
  }
}

export function vibrate(pattern = 200) {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}

// A short two-tone beep synthesized with the Web Audio API — no audio file
// to ship or preload. Reuses one AudioContext across calls since browsers
// cap how many can be created.
let audioCtx = null;

export function playBeep() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    [0, 0.15].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.13);
    });
  } catch {
    // No Web Audio support — the vibration + visual state are still there.
  }
}
