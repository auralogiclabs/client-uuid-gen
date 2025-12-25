/**
 * Client UUID Generation
 * (c) Auralogic Labs, 2025
 */

import CryptoJS from 'crypto-js';
import {
  FingerprintComponents,
  FingerprintOptions,
  StorageFingerprint,
  WebGLFingerprint,
  ExtendedNavigator,
  ExtendedWindow,
} from './types.js';
import { getBrowser, getDeviceType, getOS } from './utils.js';

export class EnhancedDeviceFingerprint {
  public components: Partial<FingerprintComponents> = {};

  getBasicFingerprint(isStable = false): Record<string, unknown> {
    if (
      typeof navigator === 'undefined' ||
      typeof window === 'undefined' ||
      typeof screen === 'undefined'
    ) {
      return {};
    }

    const nav = navigator as ExtendedNavigator;

    // Stable mode: Use width only, as height often varies in incognito due to taskbar masking
    const screenRes = isStable ? `${screen.width}x(Authored)` : `${screen.width}x${screen.height}`;

    return {
      userAgent: navigator.userAgent,
      os: getOS(),
      browser: getBrowser(),
      deviceType: getDeviceType(),
      language: navigator.language || nav.userLanguage || '',
      languages: Array.isArray(navigator.languages) ? navigator.languages.join(',') : '',
      platform: navigator.platform || '',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: nav.deviceMemory || 0,
      screenResolution: screenRes,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth || screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      timezoneOffset: new Date().getTimezoneOffset(),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      vendor: navigator.vendor || '',
      doNotTrack: navigator.doNotTrack || 'unknown',
    };
  }

  getCanvasFingerprint(isStable = false): string {
    // Stable mode: Skip canvas fingerprinting as browsers inject noise in incognito
    if (isStable) return 'canvas-omitted-for-stability';

    if (typeof document === 'undefined') return 'canvas-unavailable';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas-unavailable';

      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = '#069';
      ctx.font = '13pt Arial';
      ctx.fillText('DOOH Device ID', 2, 20);

      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = 'bold 18px "Times New Roman"';
      ctx.fillText('Canvas 123', 4, 45);

      return canvas.toDataURL();
    } catch (e) {
      console.warn('Canvas fingerprinting failed:', e);
      return 'canvas-unavailable';
    }
  }

  getWebGLFingerprint(isStable = false): string {
    // Stable mode: Skip WebGL fingerprinting as browsers (e.g. Safari) inject noise/masking
    if (isStable) return 'webgl-omitted-for-stability';

    if (typeof document === 'undefined') return 'webgl-unavailable';
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
      if (!gl) return 'webgl-unsupported';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);

      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

      const result: WebGLFingerprint = {
        vendor,
        renderer,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
          ? gl.getParameter(gl.MAX_VIEWPORT_DIMS).join('x')
          : '',
      };

      return JSON.stringify(result);
    } catch (e) {
      console.warn('WebGL fingerprinting failed:', e);
      return 'webgl-unavailable';
    }
  }

  async getAudioFingerprint(isStable = false): Promise<string> {
    // Stable mode: Skip audio fingerprinting as it has noise in incognito
    if (isStable) return 'audio-omitted-for-stability';

    if (typeof window === 'undefined') return 'audio-unsupported';
    try {
      const win = window as ExtendedWindow;
      const OfflineAudioContext = window.OfflineAudioContext || win.webkitOfflineAudioContext;

      if (!OfflineAudioContext) return 'audio-unsupported';

      const ctx = new OfflineAudioContext(1, 44100, 44100);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
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

      let sum = 0;
      for (let i = 0; i < data.length; i += 100) sum += Math.abs(data[i]);

      return sum.toString();
    } catch (e) {
      console.warn('Audio fingerprinting failed:', e);
      return 'audio-unavailable';
    }
  }

  async getStorageFingerprint(): Promise<string> {
    if (typeof navigator === 'undefined') return 'storage-unsupported';
    try {
      if (!navigator.storage || !navigator.storage.estimate) return 'storage-unsupported';

      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;

      const usageRatio = quota > 0 ? (usage / quota) * 100 : 0;

      const bucket =
        usageRatio < 10
          ? '0-10%'
          : usageRatio < 25
            ? '10-25%'
            : usageRatio < 50
              ? '25-50%'
              : usageRatio < 75
                ? '50-75%'
                : '75-100%';

      const result: StorageFingerprint = {
        quotaMB: Math.floor(quota / (1024 * 1024)),
        usageMB: Math.floor(usage / (1024 * 1024)),
        usageRatio: `${usageRatio.toFixed(2)}%`,
        usageBucket: bucket,
      };

      return JSON.stringify(result);
    } catch (e) {
      console.warn('Storage fingerprinting failed:', e);
      return 'storage-unavailable';
    }
  }

  hashString(str: string, algo: string = 'md5'): string {
    if (algo === 'sha256') {
      return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
    }
    return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex);
  }

  async generateFingerprint(options: FingerprintOptions = {}): Promise<string> {
    const { algo = 'md5', enableStableFingerprinting = true } = options;

    try {
      const basic = this.getBasicFingerprint(enableStableFingerprinting);
      const [canvas, webgl, audio, storage] = await Promise.all([
        Promise.resolve(this.getCanvasFingerprint(enableStableFingerprinting)),
        Promise.resolve(this.getWebGLFingerprint(enableStableFingerprinting)),
        this.getAudioFingerprint(enableStableFingerprinting),
        this.getStorageFingerprint(),
      ]);

      const components: FingerprintComponents = { basic, canvas, webgl, audio, storage };
      this.components = components;

      const combined = JSON.stringify(components);
      return this.hashString(combined, algo);
    } catch (e) {
      console.error('Fingerprint generation failed:', e);
      const minimal = { userAgent: navigator ? navigator.userAgent : 'unknown' };
      return this.hashString(JSON.stringify(minimal), algo);
    }
  }

  async get(options: FingerprintOptions = {}): Promise<string> {
    if (typeof navigator === 'undefined' || typeof screen === 'undefined') {
      return 'non-browser-env';
    }
    const { algo = 'md5' } = options;
    try {
      return await this.generateFingerprint(options);
    } catch (e) {
      console.error('Failed to get device UUID:', e);
      return this.hashString(`${navigator.userAgent}${screen.width}${screen.height}`, algo);
    }
  }
}
