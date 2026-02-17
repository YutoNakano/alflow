import { ConfigValidationError } from './yaml-parser.js';

/**
 * Reject script paths that escape the scripts/ directory.
 * Script files must be flat filenames like "search.py".
 */
export function assertSafeScriptPath(scriptPath: string): void {
  if (
    !scriptPath ||
    scriptPath.startsWith('/') ||
    scriptPath.includes('..') ||
    scriptPath.includes('/') ||
    scriptPath.includes('\\')
  ) {
    throw new ConfigValidationError(
      `Unsafe script path: "${scriptPath}". Script paths must be plain filenames (e.g. "search.py").`,
    );
  }
}

/**
 * Reject directory names that could escape the current directory.
 * Project dirs must be single names like "my-workflow".
 */
export function assertSafeDirectoryName(name: string): void {
  if (
    !name ||
    name.startsWith('/') ||
    name.includes('..') ||
    name.includes('/') ||
    name.includes('\\')
  ) {
    throw new ConfigValidationError(
      `Unsafe directory name: "${name}". Directory names must be plain names (e.g. "my-workflow").`,
    );
  }
}
