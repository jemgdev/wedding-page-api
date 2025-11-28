const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  // Modo de compilación
  mode: 'production',

  // Entrada de la función (Serverless Webpack la maneja automáticamente)
  entry: slsw.lib.entries,

  // Objetivo del código
  target: 'node',

  // Reglas para ignorar módulos de Node (no se empaquetan, se cargan en Lambda)
  externals: [nodeExternals()],

  // Configuración de salida
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },

  // Resolver extensiones y alias
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      // Configuración de alias para TypeScript (importante para resolver @user/)
      '@user': path.resolve(__dirname, 'dist/user/'),
      '@shared': path.resolve(__dirname, 'dist/shared/'),
      // Asegúrate de que los alias definidos en tsconfig.json estén aquí
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};