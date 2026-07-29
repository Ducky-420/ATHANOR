import { afterEach, describe, expect, it, vi } from "vitest";
import { requestWakeLock, vibrate, playBeep } from "./timerAlerts.js";

describe("requestWakeLock", () => {
  afterEach(() => {
    delete navigator.wakeLock;
  });

  it("resolves to null when the Wake Lock API isn't supported", async () => {
    expect("wakeLock" in navigator).toBe(false);
    await expect(requestWakeLock()).resolves.toBeNull();
  });

  it("returns the sentinel when supported and granted", async () => {
    const sentinel = { release: vi.fn() };
    navigator.wakeLock = { request: vi.fn().mockResolvedValue(sentinel) };

    await expect(requestWakeLock()).resolves.toBe(sentinel);
    expect(navigator.wakeLock.request).toHaveBeenCalledWith("screen");
  });

  it("resolves to null (not rejects) when the request is denied", async () => {
    navigator.wakeLock = { request: vi.fn().mockRejectedValue(new Error("denied")) };
    await expect(requestWakeLock()).resolves.toBeNull();
  });
});

describe("vibrate", () => {
  afterEach(() => {
    delete navigator.vibrate;
  });

  it("does not throw when navigator.vibrate isn't supported", () => {
    expect(typeof navigator.vibrate).toBe("undefined");
    expect(() => vibrate(200)).not.toThrow();
  });

  it("calls navigator.vibrate with the given pattern when supported", () => {
    navigator.vibrate = vi.fn();
    vibrate(200);
    expect(navigator.vibrate).toHaveBeenCalledWith(200);
  });
});

describe("playBeep", () => {
  afterEach(() => {
    delete window.AudioContext;
  });

  it("does not throw when the Web Audio API isn't supported", () => {
    expect(() => playBeep()).not.toThrow();
  });

  it("starts two oscillators when Web Audio is supported", () => {
    const osc = { frequency: {}, connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn() };
    const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn().mockReturnThis() };
    const ctx = {
      currentTime: 0,
      createOscillator: vi.fn(() => ({ ...osc, connect: vi.fn().mockReturnValue(gain) })),
      createGain: vi.fn(() => gain),
      destination: {},
    };
    window.AudioContext = vi.fn(function () {
      return ctx;
    });

    playBeep();
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });
});
