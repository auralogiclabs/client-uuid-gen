/**
 * Client UUID Generation
 * (c) Auralogic Labs, 2025
 */

import { EnhancedDeviceFingerprint } from './fingerprint.js';
import { FingerprintOptions } from './types.js';

const fingerprinter = new EnhancedDeviceFingerprint();

export const getFingerprint = (options?: FingerprintOptions): Promise<string> => {
  return fingerprinter.get(options);
};

export { EnhancedDeviceFingerprint } from './fingerprint.js';
export * from './types.js';
