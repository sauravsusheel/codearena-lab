import test from 'node:test';
import assert from 'node:assert/strict';
import { SANDBOX_IMAGES, LANGUAGE_FILES, commandFor } from '../server/sandbox.mjs';

const languages=['python','java','c','cpp','csharp','javascript','typescript','html','css','sql','php','go','rust','kotlin','swift','dart','ruby','r','bash','lua'];

test('all 20 CodeArena languages have authoritative sandbox specifications',()=>{
  assert.equal(Object.keys(SANDBOX_IMAGES).length,20);
  for(const language of languages){
    const spec=commandFor(language);
    assert.ok(spec.image,`${language} image missing`);
    assert.ok(spec.file,`${language} source file missing`);
    assert.ok(spec.script,`${language} execution command missing`);
  }
});

test('compiled languages never execute binaries from noexec /tmp',()=>{
  const specs=['c','cpp','go','rust','swift','kotlin'];
  for(const language of specs){
    const spec=commandFor(language);
    assert.doesNotMatch(spec.script,/\/tmp\/main(?:\s|$)/,`${language} uses /tmp/main`);
    assert.doesNotMatch(spec.script,/\/tmp\/main\.jar(?:\s|$)/,`${language} uses /tmp/main.jar`);
  }
});

test('C# uses a generated project instead of dotnet build on Program.cs',()=>{
  assert.match(commandFor('csharp').script,/CodeArena\.csproj/);
  assert.doesNotMatch(commandFor('csharp').script,/dotnet build \/work\/Program\.cs/);
});
