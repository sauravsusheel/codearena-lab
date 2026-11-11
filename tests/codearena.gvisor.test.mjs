import test from 'node:test';
import assert from 'node:assert/strict';
import { commandFor, SANDBOX_IMAGES, buildSandboxArgs, isGVisorAvailable } from '../server/sandbox.mjs';

test('gVisor (runsc) runtime is correctly positioned before container image in arguments', () => {
  const args = buildSandboxArgs('python', {}, 'runsc');
  const runtimeIndex = args.indexOf('--runtime');
  assert.notEqual(runtimeIndex, -1, '--runtime flag must be present');
  assert.equal(args[runtimeIndex + 1], 'runsc', 'runtime must be runsc');
  const imageIndex = args.indexOf(SANDBOX_IMAGES.python);
  assert.equal(runtimeIndex + 2, imageIndex, '--runtime runsc must immediately precede the target image');
});

test('hardened sandbox security flags are enforced for all 20 runtime languages', () => {
  const languages = Object.keys(SANDBOX_IMAGES);
  for (const lang of languages) {
    const args = buildSandboxArgs(lang, {}, 'runsc');
    assert.ok(args.includes('--cap-drop') && args[args.indexOf('--cap-drop') + 1] === 'ALL', `${lang} must drop ALL capabilities`);
    assert.ok(args.includes('--security-opt') && args[args.indexOf('--security-opt') + 1] === 'no-new-privileges', `${lang} must enforce no-new-privileges`);
    assert.ok(args.includes('--network') && args[args.indexOf('--network') + 1] === 'none', `${lang} must have network disabled`);
    assert.ok(args.includes('--read-only'), `${lang} must have read-only rootfs`);
    assert.ok(args.includes('--user') && args[args.indexOf('--user') + 1] === '1000:1000', `${lang} must run as unprivileged user 1000:1000`);
    assert.ok(args.some(a => a.startsWith('/tmp:rw,noexec')), `${lang} /tmp must be mounted noexec`);
    assert.ok(args.some(a => a.startsWith('/work:rw,exec')), `${lang} /work must be mounted exec`);
  }
});

test('standard sandbox defaults to runc when CODEARENA_SANDBOX_RUNTIME is empty', () => {
  const args = buildSandboxArgs('python', {}, '');
  assert.equal(args.includes('--runtime'), false, 'Default container invocation should not pass custom runtime');
});

test('isGVisorAvailable returns a boolean indicating host runsc registration', async () => {
  const available = await isGVisorAvailable();
  assert.equal(typeof available, 'boolean');
});

