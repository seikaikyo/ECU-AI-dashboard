const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const DIST_DIR = path.resolve(__dirname, './dist');
const SRC_DIR = path.resolve(__dirname, './src');

// Grafana 外部依賴
const grafanaExternals = [
  '@grafana/data',
  '@grafana/runtime',
  '@grafana/ui',
  '@grafana/scenes',
  'react',
  'react-dom',
];

const externals = {};
grafanaExternals.forEach((name) => {
  externals[name] = {
    commonjs: name,
    commonjs2: name,
    amd: name,
    root: name.replace('@grafana/', 'grafana').replace('/', ''),
  };
});

module.exports = (env = {}) => {
  const baseConfig = {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    context: path.join(__dirname),

    devtool: env.production ? 'source-map' : 'eval-source-map',

    entry: {
      module: path.resolve(SRC_DIR, 'module.ts'),
    },

    externals,

    mode: env.production ? 'production' : 'development',

    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(ts|tsx)$/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                baseUrl: './src',
                target: 'es2018',
                loose: false,
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: false,
                  dynamicImport: true,
                },
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 0,
                sourceMap: false,
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            // Keep publicPath relative for deployments
            publicPath: `public/plugins/ecu-ai-monitoring-panel/`,
            outputPath: 'img/',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          generator: {
            publicPath: `public/plugins/ecu-ai-monitoring-panel/`,
            outputPath: 'fonts/',
          },
        },
      ],
    },

    output: {
      clean: {
        keep: /^\.git/,
      },
      filename: '[name].js',
      library: {
        type: 'amd',
      },
      path: DIST_DIR,
      publicPath: 'public/plugins/ecu-ai-monitoring-panel/',
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          // 複製 plugin.json 和其他靜態資源
          { from: 'src/plugin.json', to: '.' },
          { from: 'src/README.md', to: '.' },
          { from: 'src/CHANGELOG.md', to: '.' },
          { from: 'src/img', to: 'img' },
          
          // 複製授權檔案
          { from: 'LICENSE', to: '.' },
        ],
      }),
      
      // 在 plugin.json 中替換版本號
      new ReplaceInFileWebpackPlugin([
        {
          dir: DIST_DIR,
          files: ['plugin.json'],
          rules: [
            {
              search: /%VERSION%/g,
              replace: require('./package.json').version,
            },
            {
              search: /%TODAY%/g,
              replace: new Date().toISOString().substr(0, 10),
            },
          ],
        },
      ]),

      // TypeScript 類型檢查
      new ForkTsCheckerWebpackPlugin({
        async: Boolean(env.development),
        issue: {
          include: [
            { file: '**/*.{ts,tsx}' },
          ],
        },
        typescript: {
          configFile: path.join(__dirname, 'tsconfig.json'),
        },
      }),
    ],

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: [SRC_DIR, 'node_modules'],
      unsafeCache: true,
    },

    watchOptions: {
      ignored: /node_modules/,
    },
  };

  if (env.development) {
    baseConfig.plugins.push(
      new (require('webpack-livereload-plugin'))({
        port: 35729,
        hostname: 'localhost',
      })
    );
  }

  return baseConfig;
};