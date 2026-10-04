import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SANDBOX_IMAGES } from '../server/sandbox.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typescriptImage = SANDBOX_IMAGES.typescript;

function runDocker(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`docker ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

async function main() {
  console.log(`Building ${typescriptImage}`);
  await runDocker(['build', '-t', typescriptImage, path.join(root, 'docker', 'sandboxes', 'typescript')]);

  const images = [...new Set(Object.values(SANDBOX_IMAGES))].filter(image => image !== typescriptImage);
  for (const image of images) {
    console.log(`Pulling ${image}`);
    await runDocker(['pull', image]);
  }

  console.log('All CodeArena sandbox images are ready.');
}

main().catch(error => {
  console.error(`Unable to prepare CodeArena sandbox images: ${error.message}`);
  process.exitCode = 1;
});