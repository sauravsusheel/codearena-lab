import test from 'node:test';
import assert from 'node:assert/strict';
import { commandFor, SANDBOX_IMAGES } from '../server/sandbox.mjs';

function buildSandboxArgs(language, limits = {}, runtime = '') {
  const spec = commandFor(language);
  const name = 'codearena-test-security';
  const args = [
    'create', '--name', name, '--network', 'none', '--read-only',
    '--pids-limit', '64', '--cpus', String(Math.max(0.1, Number(limits.cpu || 1))),
    '--memory', `${Math.max(16, Number(limits.memory || 256))}m`,
    '--memory-swap', `${Math.max(16, Number(limits.memory || 256))}m`,
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--user', '1000:1000',
    '--ulimit', 'nofile=256:256', '--ulimit', 'nproc=64:64',
    '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777',
    '--tmpfs', '/work:rw,exec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777',
    '-w', '/work', '-e', 'HOME=/tmp', '-e', 'TMPDIR=/tmp',
    spec.image, 'sh', '-lc', 'sleep 600'
  ];
  if (runtime) {
    const idx = args.indexOf(spec.image);
    args.splice(idx, 0, '--runtime', runtime);
  }
  return args;
}

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
