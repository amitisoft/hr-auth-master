var path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');


// Helper functions
var ROOT = path.resolve(__dirname);

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ROOT].concat(args));
}

module.exports = {
  entry: {
    handler: './handler.ts'
  },
  target: 'node',
  externals: [ "aws-sdk" ], // modules to be excluded from bundled file
  resolve: {
    extensions: ['', '.ts', '.js', '.json'],
    root: root('./../../../../'),
    modulesDirectories: [
        root('node_modules')
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: 'index.js'
  },
  module: {
    preLoaders: [
      {
        test: /\.ts$/,
        loader: 'string-replace-loader',
        query: {
          search: '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
          replace: '$1.import($3).then(mod => mod.__esModule ? mod.default : mod)',
          flags: 'g'
        },
        include: [root('.')]
      }
    ],
    loaders: [
      {
        test: /\.ts$/,
        loaders: [
          'ts-loader'
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
    ]
  },
  plugins: [
      // new webpack.optimize.CommonsChunkPlugin({
      //     name: "vendor",
      //     filename: "vendor.bundle.js",
      //     minChunks: function(module) {
      //         var context = module.context;
      //         if (typeof context !== "string") return false;
      //         return context.indexOf("node_modules") >= 0;
      //     }
      // }),


  ]
};
