const path = require('path');

module.exports = {
  mode: 'production',
  entry: [path.resolve(__dirname, 'src/index.js')],
  output: {
    filename: 'photoflex.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'photoflex',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    injectClient: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{ loader: 'babel-loader' }],
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ]
      }
    ]
  }
};
