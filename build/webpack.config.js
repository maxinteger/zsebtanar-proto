const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const sassExtract = new ExtractTextPlugin({
  filename: '[name].css',
  allChunks: true,
  disable: isDev
})
const cssExtract = new ExtractTextPlugin({
  filename: '[name].css',
  allChunks: true,
  disable: isDev
})

module.exports = {
  entry: {
    admin: './src/admin/admin.jsx',
    public: './src/public/public.jsx'
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    path: `${__dirname}/../bin`
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: isDev && 'source-map',

  target: 'web',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.js', '.jsx', '.js', '.json'],
    modules: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../node_modules')]
  },

  devServer: {
    contentBase: path.resolve(__dirname, '../src/resources'),
    overlay: {
      warnings: true,
      errors: true
    },
    inline: true,
    historyApiFallback: {
      verbose: true,
      rewrites: [
        { from: /^\/assets\/.*(|.css|.png|.ico)$/, to: ctx => ctx.parsedUrl.pathname },
        { from: /^\/.*\.js$/, to: ctx => '/' + ctx.parsedUrl.pathname.split('/').pop() },
        { from: /^\/admin/, to: '/admin.html' },
        { from: /^\//, to: '/index.html' }
      ]
    }
  },
  externals: 'firebase',
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          cacheDirectory: true,
          presets: ['env', 'react'],
          plugins: [
            require('babel-plugin-ramda').default,
            require('babel-plugin-transform-object-rest-spread'),
            require('babel-plugin-transform-class-properties')
          ]
        }
      },
      {
        test: /\.css$/,
        use: cssExtract.extract(['css-loader'])
      },
      {
        test: /\.scss$/,
        use: sassExtract.extract(['css-loader', 'sass-loader'])
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  },

  plugins: [
    sassExtract,
    // new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.ejs'),
      alwaysWriteToDisk: false,
      filename: 'admin.html',
      title: 'Zsebtanár - Tanár',
      isDev: !isProd,
      site: 'admin',
      chunks: ['vendor', 'admin']
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.ejs'),
      alwaysWriteToDisk: false,
      filename: 'index.html',
      isDev: !isProd,
      site: 'public',
      title: 'Zsebtanár - proto',
      chunks: ['vendor', 'public']
    }),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.min.js'
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!isProd),
      __PRODUCTION__: JSON.stringify(isProd),
      __FN_PATH__: JSON.stringify(
        isProd ? '/api/' : 'http://localhost:5002/zsebtanar-proto-76083/us-central1/'
      )
    }),
    ...(isProd
      ? [
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            compress: {
              warnings: false, // Suppress uglification warnings
              pure_getters: true,
              unsafe: true,
              unsafe_comps: true,
              screw_ie8: true
            },
            output: {
              comments: false
            },
            exclude: [/\.min\.js$/gi] // skip pre-minified libs
          })
        ]
      : [])
  ]
}
