/**
 * Client UUID Generation
 * (c) Auralogic Labs, 2025
 */

import { describe, it, expect } from 'vitest';
import { getFingerprint, EnhancedDeviceFingerprint } from '../src/index';

describe('EnhancedDeviceFingerprint', () => {
  it('should generate a fingerprint hash', async () => {
    const uuid = await getFingerprint();
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('should support SHA-256 algorithm', async () => {
    const uuid = await getFingerprint({ algo: 'sha256' });
    expect(uuid).toBeDefined();
    expect(uuid.length).toBe(64); // SHA-256 hex string length
  });

  it('should support MD5 algorithm (default)', async () => {
    const uuid = await getFingerprint({ algo: 'md5' });
    expect(uuid).toBeDefined();
    expect(uuid.length).toBe(32); // MD5 hex string length
  });

  it('should collect all components', async () => {
    const fingerprinter = new EnhancedDeviceFingerprint();
    await fingerprinter.generateFingerprint();

    const components = fingerprinter.components;
    expect(components).toBeDefined();
    expect(components.basic).toBeDefined();
    // Canvas/WebGL might fail in node environment without mocking, but fallback strings should exist
    expect(components.canvas).toBeDefined();
    expect(components.webgl).toBeDefined();
    expect(components.audio).toBeDefined();
    expect(components.storage).toBeDefined();
  });
});
