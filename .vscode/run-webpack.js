/* eslint-disable no-console */
const { spawn } = require('child_process');
const path = require('path');

// Prefer running the project's local webpack binary with the current Node executable.
// This avoids depending on a global package manager (pnpm) being available in PATH.
const projectRoot = path.resolve(__dirname, '../');
const webpackBin = path.resolve(projectRoot, 'node_modules', 'webpack', 'bin', 'webpack.js');

let webpack;
try {
  // Use process.execPath (the node executable) to run the webpack JS file directly.
  webpack = spawn(process.execPath, [webpackBin, '--mode=development', '--watch'], { cwd: projectRoot });
} catch (err) {
  console.error('Failed to spawn local webpack binary:', err);
  process.exit(1);
}

webpack.on('error', (webpackError) => {
  if (webpackError) {
    console.error(webpackError);
    process.exit(1);
  }
});

webpack.stdout.on('data', (chunk) => {
  const stdout = chunk.toString();
  console.log(stdout);
  // guard in case process.send is not available (when not forked)
  if (typeof process.send === 'function') process.send(stdout);
});

webpack.stdout.on('error', (error) => {
  console.log(error);
});

webpack.stderr.on('data', (chunk) => {
  const stderr = chunk.toString();
  console.log(stderr);
});
