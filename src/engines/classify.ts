// Failure reason from a worker / engine error (name + message); 'failed' when nothing matches (the stage then shows the generic text).
// Lazy chunk: only loaded when a job fails.
import type { ErrCode } from './index';
export function classify(name = '', msg = ''): ErrCode {
  const s = `${name} ${msg}`;
  if (/PasswordException|password/i.test(s)) return 'password';
  if (/QuotaExceededError/.test(s)) return 'quota';
  if (/CacheResourcesExhausted|resource limit/i.test(s)) return 'pixels';
  if (/undecodable_source_codec|unknown_source_codec|no_encodable_target_codec/.test(s)) return 'codec';
  if (/getDirectory|UnknownError|SecurityError/.test(s)) return 'storage';
  if (/RangeError|out of memory|allocation failed|could not allocate|memory access out of bounds/i.test(s)) return 'memory';
  if (/manifest [a-z]+: HTTP|: HTTP \d{3}|Failed to fetch|Load failed|NetworkError/.test(s)) return 'engine';
  if (/InvalidPDFException|Invalid PDF|FormatError|Improper ?Image ?Header|Insufficient ?Image ?Data|Corrupt ?Image|Unexpected ?End|no output:|ffmpeg exit|invalid:|bad zip|end of central/i.test(s)) return 'unreadable';
  return 'failed';
}
