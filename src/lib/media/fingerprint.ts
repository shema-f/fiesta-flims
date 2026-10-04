/**
 * Media fingerprinting (spec §11 / §37).
 *
 * A deterministic SHA-256 of the source file lets us detect the exact same
 * upload and skip transcoding it twice.
 */

import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import type { Readable } from 'stream';

export function fingerprintBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function fingerprintStream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export function fingerprintFile(filePath: string): Promise<string> {
  return fingerprintStream(createReadStream(filePath));
}
