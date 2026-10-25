module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo (SDK 54+) auto-adds the react-native-worklets plugin when installed.
  return { presets: ['babel-preset-expo'] };
};
