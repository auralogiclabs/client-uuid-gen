/**
 * Client UUID Generation
 * (c) Auralogic Labs, 2025
 */

export interface FingerprintComponents {
  basic: Record<string, unknown>;
  canvas: string;
  webgl: string;
  audio: string;
  storage: string;
}

export type HashingAlgorithm = 'md5' | 'sha256';

export interface FingerprintOptions {
  algo?: HashingAlgorithm;
}

export interface WebGLFingerprint {
  vendor: string | null;
  renderer: string | null;
  version: string | null;
  shadingLanguageVersion: string | null;
  maxTextureSize: number | null;
  maxViewportDims: string | null;
}

export interface StorageFingerprint {
  quotaMB: number;
  usageMB: number;
  usageRatio: string;
  usageBucket: string;
}
