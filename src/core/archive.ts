import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import archiver from 'archiver';

export interface ArchiveEntry {
  name: string;
  content: string | Buffer;
}

export async function createWorkflowArchive(
  outputPath: string,
  entries: ArchiveEntry[]
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Sort entries for determinism
    const sortedEntries = [...entries].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Use fixed timestamp for deterministic builds (Unix epoch)
    const fixedDate = new Date(0);

    for (const entry of sortedEntries) {
      archive.append(entry.content, {
        name: entry.name,
        date: fixedDate,
      });
    }

    archive.finalize();
  });
}
