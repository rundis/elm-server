#!/usr/bin/env node
const browserSync = require('browser-sync');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const platform = require('elm/platform');
const commander = require('commander');
const path = require('path');
const fs = require('fs');
const elmPackage = require(path.join(__dirname, 'elm-package'));

process.env.ELM_HOME = platform.shareDir;

elmServer('test/src/Main.elm', {
  outputFile: 'test/dist/test.html'
});

function elmServer(inputFilesArg, opts) {
  const inputFiles = inputFilesArg instanceof Array ?
    inputFilesArg :
    [inputFilesArg];

  const outputFile =
    !opts.outputFile ?
      path.join('dist', 'index.html') :
      opts.watch ?
        path.join(opts.watch, opts.outputFile) :
        opts.outputFile;

  const watch = opts.watch || path.dirname(outputFile);
  const startPath =
    path.extname(outputFile) === '.html' ?
      path.basename(outputFile) :
      '/';

  function elmMake() {
    const makeArgs = inputFiles.concat(['--output', outputFile]);
    const executablePath = platform.executablePaths['elm-make'];

    spawn(executablePath, makeArgs, { stdio: 'inherit' });
  }

  elmMake();

  chokidar
    .watch(elmPackage['source-directories'])
    .on('change', elmMake);

  return browserSync({
    server: watch,
    startPath: startPath,
    files: [path.join(watch, '**', '*')]
  });
}