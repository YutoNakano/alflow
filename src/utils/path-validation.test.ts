import { describe, it, expect } from 'vitest';
import { assertSafeScriptPath, assertSafeDirectoryName } from './path-validation.js';
import { ConfigValidationError } from './yaml-parser.js';

describe('assertSafeScriptPath', () => {
  it('accepts plain filenames', () => {
    expect(() => assertSafeScriptPath('search.py')).not.toThrow();
    expect(() => assertSafeScriptPath('action.sh')).not.toThrow();
    expect(() => assertSafeScriptPath('my-script.js')).not.toThrow();
  });

  it('rejects path traversal', () => {
    expect(() => assertSafeScriptPath('../../etc/passwd')).toThrow(ConfigValidationError);
    expect(() => assertSafeScriptPath('../secret.py')).toThrow(ConfigValidationError);
  });

  it('rejects absolute paths', () => {
    expect(() => assertSafeScriptPath('/etc/passwd')).toThrow(ConfigValidationError);
    expect(() => assertSafeScriptPath('/tmp/script.py')).toThrow(ConfigValidationError);
  });

  it('rejects nested paths', () => {
    expect(() => assertSafeScriptPath('sub/dir/file.py')).toThrow(ConfigValidationError);
    expect(() => assertSafeScriptPath('scripts/search.py')).toThrow(ConfigValidationError);
  });

  it('rejects backslash paths', () => {
    expect(() => assertSafeScriptPath('sub\\file.py')).toThrow(ConfigValidationError);
  });

  it('rejects empty strings', () => {
    expect(() => assertSafeScriptPath('')).toThrow(ConfigValidationError);
  });
});

describe('assertSafeDirectoryName', () => {
  it('accepts plain directory names', () => {
    expect(() => assertSafeDirectoryName('my-workflow')).not.toThrow();
    expect(() => assertSafeDirectoryName('project_v2')).not.toThrow();
  });

  it('rejects path traversal', () => {
    expect(() => assertSafeDirectoryName('../../tmp')).toThrow(ConfigValidationError);
    expect(() => assertSafeDirectoryName('..')).toThrow(ConfigValidationError);
  });

  it('rejects absolute paths', () => {
    expect(() => assertSafeDirectoryName('/tmp/evil')).toThrow(ConfigValidationError);
  });

  it('rejects nested paths', () => {
    expect(() => assertSafeDirectoryName('a/b')).toThrow(ConfigValidationError);
  });

  it('rejects backslash paths', () => {
    expect(() => assertSafeDirectoryName('a\\b')).toThrow(ConfigValidationError);
  });

  it('rejects empty strings', () => {
    expect(() => assertSafeDirectoryName('')).toThrow(ConfigValidationError);
  });
});
