/**
 * Enhanced Device Fingerprinting Library
 * Generates a unique device ID based on browser attributes, canvas, WebGL, audio, and storage.
 */

class EnhancedDeviceFingerprint {
  constructor() {
    this.components = {};
  }

  // ---------- Helpers ----------
  getOS() {
    if (typeof navigator === "undefined") return "Unknown OS";
    const ua = navigator.userAgent;

    const iosMatch = /OS (\d+)_/.exec(ua);
    if (/iPhone|iPad|iPod/.test(ua))
      return iosMatch ? `iOS ${iosMatch[1]}` : "iOS";

    const androidMatch = /Android (\d+(\.\d+)?)/.exec(ua);
    if (/Android/.test(ua))
      return androidMatch ? `Android ${androidMatch[1]}` : "Android";

    const winMatch = /Windows NT (\d+\.\d+)/.exec(ua);
    if (/Windows NT/.test(ua))
      return winMatch ? `Windows ${winMatch[1]}` : "Windows";

    const macMatch = /Mac OS X (\d+[_\d]*)/.exec(ua);
    if (/Mac OS X/.test(ua))
      return macMatch ? `macOS ${macMatch[1].replace(/_/g, ".")}` : "macOS";

    if (/Linux/.test(ua)) return "Linux";
    return "Unknown OS";
  }

  getBrowser() {
    if (typeof navigator === "undefined") return "Unknown Browser";
    const ua = navigator.userAgent;

    const edgeMatch = /Edg\/(\d+)/.exec(ua);
    if (/Edg\//.test(ua)) return edgeMatch ? `Edge ${edgeMatch[1]}` : "Edge";

    const chromeMatch = /Chrome\/(\d+)/.exec(ua);
    if (/Chrome\//.test(ua) && !/Edg/.test(ua))
      return chromeMatch ? `Chrome ${chromeMatch[1]}` : "Chrome";

    const safariMatch = /Version\/(\d+)/.exec(ua);
    if (/Safari\//.test(ua) && !/Chrome/.test(ua))
      return safariMatch ? `Safari ${safariMatch[1]}` : "Safari";

    const ffMatch = /Firefox\/(\d+)/.exec(ua);
    if (/Firefox\//.test(ua))
      return ffMatch ? `Firefox ${ffMatch[1]}` : "Firefox";

    return "Unknown Browser";
  }

  getDeviceType() {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua))
      return "mobile";
    if (/iPad|Tablet|PlayBook/i.test(ua)) return "tablet";
    if (/Smart-?TV|GoogleTV|AppleTV|HbbTV|NetCast\.TV/i.test(ua))
      return "smarttv";
    return "desktop";
  }

  // ---------- Fingerprint components ----------
  getBasicFingerprint() {
    if (
      typeof navigator === "undefined" ||
      typeof window === "undefined" ||
      typeof screen === "undefined"
    ) {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      os: this.getOS(),
      browser: this.getBrowser(),
      deviceType: this.getDeviceType(),
      language: navigator.language || navigator.userLanguage || "",
      languages: Array.isArray(navigator.languages)
        ? navigator.languages.join(",")
        : "",
      platform: navigator.platform || "",
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      screenResolution: `${screen.width}x${screen.height}`,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth || screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      timezoneOffset: new Date().getTimezoneOffset(),
      touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      vendor: navigator.vendor || "",
      doNotTrack: navigator.doNotTrack || "unknown",
    };
  }

  getCanvasFingerprint() {
    if (typeof document === "undefined") return "canvas-unavailable";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "canvas-unavailable";

      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = "#069";
      ctx.font = "13pt Arial";
      ctx.fillText("DOOH Device ID", 2, 20);

      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.font = 'bold 18px "Times New Roman"';
      ctx.fillText("Canvas 123", 4, 45);

      return canvas.toDataURL();
    } catch (e) {
      console.warn("Canvas fingerprinting failed:", e);
      return "canvas-unavailable";
    }
  }

  getWebGLFingerprint() {
    if (typeof document === "undefined") return "webgl-unavailable";
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "webgl-unsupported";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);

      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

      const result = {
        vendor,
        renderer,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS).join("x"),
      };

      return JSON.stringify(result);
    } catch (e) {
      console.warn("WebGL fingerprinting failed:", e);
      return "webgl-unavailable";
    }
  }

  // Uses OfflineAudioContext so it works even without user gesture
  async getAudioFingerprint() {
    if (typeof window === "undefined") return "audio-unsupported";
    try {
      const OfflineAudioContext =
        window.OfflineAudioContext || window.webkitOfflineAudioContext;

      if (!OfflineAudioContext) return "audio-unsupported";

      const ctx = new OfflineAudioContext(1, 44100, 44100);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 10000;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      osc.connect(compressor);
      compressor.connect(ctx.destination);

      osc.start(0);
      osc.stop(1);

      const buffer = await ctx.startRendering();
      const data = buffer.getChannelData(0);

      // Stable-ish summary (don’t use the entire buffer)
      let sum = 0;
      for (let i = 0; i < data.length; i += 100) sum += Math.abs(data[i]);

      return sum.toString();
    } catch (e) {
      console.warn("Audio fingerprinting failed:", e);
      return "audio-unavailable";
    }
  }

  async getStorageFingerprint() {
    if (typeof navigator === "undefined") return "storage-unsupported";
    try {
      if (!navigator.storage || !navigator.storage.estimate)
        return "storage-unsupported";

      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;

      const usageRatio = quota > 0 ? (usage / quota) * 100 : 0;

      const bucket =
        usageRatio < 10
          ? "0-10%"
          : usageRatio < 25
          ? "10-25%"
          : usageRatio < 50
          ? "25-50%"
          : usageRatio < 75
          ? "50-75%"
          : "75-100%";

      return JSON.stringify({
        quotaMB: Math.floor(quota / (1024 * 1024)),
        usageMB: Math.floor(usage / (1024 * 1024)),
        usageRatio: `${usageRatio.toFixed(2)}%`,
        usageBucket: bucket,
      });
    } catch (e) {
      console.warn("Storage fingerprinting failed:", e);
      return "storage-unavailable";
    }
  }

  // ---------- Hash ----------
  hashString(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;

    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 =
      (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
        Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>>
      0;

    h2 =
      (Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
        Math.imul(h1 ^ (h1 >>> 13), 3266489909)) >>>
      0;

    return (4294967296 * (2097151 & h2) + h1).toString(36);
  }

  async generateFingerprint() {
    try {
      // console.log("Generating enhanced device fingerprint...");

      const basic = this.getBasicFingerprint();
      const [canvas, webgl, audio, storage] = await Promise.all([
        Promise.resolve(this.getCanvasFingerprint()),
        Promise.resolve(this.getWebGLFingerprint()),
        this.getAudioFingerprint(),
        this.getStorageFingerprint(),
      ]);

      this.components = { basic, canvas, webgl, audio, storage };

      const combined = JSON.stringify(this.components);
      const hash = this.hashString(combined);

      // console.log("Fingerprint generated:", hash);
      return hash;
    } catch (e) {
      console.error("Fingerprint generation failed:", e);
      const basic = this.getBasicFingerprint();
      return this.hashString(JSON.stringify(basic));
    }
  }

  async get() {
    if (typeof navigator === "undefined" || typeof screen === "undefined") {
      // Fallback for non-browser environments if called inadvertently
      return "non-browser-env";
    }
    try {
      return await this.generateFingerprint();
    } catch (e) {
      console.error("Failed to get device UUID:", e);
      return this.hashString(
        `${navigator.userAgent}${screen.width}${screen.height}`
      );
    }
  }
}

// Export the class and a simple instance wrapper
const fingerprinter = new EnhancedDeviceFingerprint();

module.exports = {
  EnhancedDeviceFingerprint,
  getFingerprint: () => fingerprinter.get(),
};
