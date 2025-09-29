const { exec } = require('child_process');
const path = require('path');

module.exports = (env, options) => {
  const { mode = 'development' } = options;

  const rules = [
    {
      test: /\.ts$/, // Only match .ts files
      use: 'ts-loader',
      exclude: /node_modules|dist|typings/,
    },
  ];

  const main = {
    mode,
    entry: {
      main: './src/main.ts', // Entry point is the main TypeScript file
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js'], // Only .ts and .js extensions
    },
    module: {
      rules,
    },
    devtool: mode === 'development' ? 'source-map' : false, // Use 'source-map' for dev and disable in production
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.afterDone.tap('pack-zip', () => {
            exec('node .vscode/pack-zip.js', (err, stdout, stderr) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(stdout);
            });
          });
        },
      },
    ],
  };

  return [main];
};