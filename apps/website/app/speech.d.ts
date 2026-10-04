/**
 * Minimal Web Speech API surface.
 *
 * SpeechRecognition is still prefixed in Chromium and absent from TypeScript's
 * bundled DOM lib, so the parts Omnivra actually uses are declared here rather
 * than reaching for `any`.
 */
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error:
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported";
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  /** On-device recognition (Chrome 139+). */
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionOptions {
  langs: string[];
  processLocally?: boolean;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  /** Whether a language model is ready on this device (Chrome 139+). */
  available?(
    options: SpeechRecognitionOptions,
  ): Promise<"available" | "downloadable" | "downloading" | "unavailable">;
  /** Downloads an on-device language model (Chrome 139+). */
  install?(options: SpeechRecognitionOptions): Promise<boolean>;
}

declare const SpeechRecognition: SpeechRecognitionConstructor | undefined;

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
