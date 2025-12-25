# @auralogiclabs/client-uuid-gen

A robust, browser-based device UUID generator that creates unique fingerprints using multiple browser attributes including Canvas, WebGL, AudioContext, and LocalStorage estimates.

## Features

- **Multi-factor Fingerprinting:** Combines User Agent, Screen properties, Timezone, Canvas rendering, WebGL capabilities, Audio processing, and Storage estimates.
- **Privacy-Aware:** Generates a hash of the components, not storing raw PII (Personally Identifiable Information) by default.
- **Promise-Based:** Fully async API to handle components like AudioContext rendering.
- **Zero External Dependencies:** Lightweight and easy to bundle.

## Installation

```bash
npm install @auralogiclabs/client-uuid-gen
```

## Usage

### Basic Usage

Import the `getFingerprint` function to get a unique hash string for the current browser/device.

By default, it uses **MD5**. You can specify `sha256` for a longer hash.

```javascript
import { getFingerprint } from "@auralogiclabs/client-uuid-gen";

// Async function needed
async function identifyDevice() {
  try {
    // Default: MD5 hash (32 chars)
    const deviceId = await getFingerprint();
    console.log("Device UUID (MD5):", deviceId);

    // Option: SHA-256 hash (64 chars)
    const deviceIdStrong = await getFingerprint({ algo: "sha256" });
    console.log("Device UUID (SHA-256):", deviceIdStrong);
  } catch (error) {
    console.error("Failed to generate fingerprint:", error);
  }
}

identifyDevice();
```

### Advanced Usage (Class Access)

If you need more control or want to access specific component data (e.g., just the basic fingerprints or fallback behavior), you can use the `EnhancedDeviceFingerprint` class directly.

```javascript
import { EnhancedDeviceFingerprint } from "@auralogiclabs/client-uuid-gen";

async function fullAnalysis() {
  const fingerprinter = new EnhancedDeviceFingerprint();

  // 1. Get entire fingerprint hash
  const uuid = await fingerprinter.get();
  console.log("UUID:", uuid);

  // 2. Access internal components after generation
  // Note: generateFingerprint() populates the .components object
  await fingerprinter.generateFingerprint();
  console.log("Detailed Components:", fingerprinter.components);
  // Output example:
  // {
  //   basic: { userAgent: "...", screenResolution: "1920x1080", ... },
  //   canvas: "data:image/png;base64, ...",
  //   webgl: "...",
  //   audio: "...",
  //   storage: "..."
  // }
}
```

## How It Works

This library generates a "fingerprint" by collecting stable characteristics of the user's browser environment:

1.  **Basic Info:** User Agent, OS, Browser, Device Type, Language, Screen Resolution, Timezone.
2.  **Canvas Fingerprinting:** Renders a hidden canvas with specific text and colors. Differences in graphics rendering hardware produce unique data URLs.
3.  **WebGL Fingerprinting:** Queries WebGL vendor and renderer information.
4.  **Audio Fingerprinting:** Uses an OfflineAudioContext to render a specific oscillator tone. Differences in audio hardware/drivers produce unique signal processing results.
5.  **Storage Fingerprinting:** Estimates available storage quota to bucket users (e.g., "fast device with lots of space" vs "budget device").

All these components are combined into a JSON string and hashed to produce a short, unique identifier.

## Notes

- **Browser Only:** This library relies on browser APIs (`window`, `navigator`, `document`, `screen`). It will not work in a Node.js server environment (and will safely return a fallback or error if executed there).
- **Privacy:** Fingerprinting can be used for tracking. Ensure you comply with GDPR, CCPA, and other privacy regulations when using this for user identification. obtain necessary consents if required.

## Running the Example

We have provided a sample HTML file to demonstrate the library in action.

1.  Navigate to the `examples` folder.
2.  Open `index.html` in your browser.

    - **Note:** Some browsers restrict certain APIs (like `crypto` or `AudioContext`) when opening files directly via `file://`. For the best experience, use a local development server.
    - Example with Python:
      ```bash
      # From the project root
      python3 -m http.server
      # Then visit http://localhost:8000/examples/
      ```
    - Example with Node `serve`:
      ```bash
      npx serve .
      # Then visit the URL provided
      ```

3.  Click "Generate Fingerprint" to see the UUID and detailed component breakdown.

## License

MIT
