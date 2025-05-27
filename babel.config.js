module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel']
    }
  }
}; 