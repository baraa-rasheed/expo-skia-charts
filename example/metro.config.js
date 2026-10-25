// Resolve the library from ../src so edits hot-reload without a rebuild.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libRoot = path.resolve(projectRoot, '..');
const config = getDefaultConfig(projectRoot);

config.watchFolders = [libRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = { 'expo-skia-charts': path.join(libRoot, 'src') };
// Ensure a single copy of peer deps.
config.resolver.blockList = [new RegExp(`${libRoot}/node_modules/(react|react-native|react-native-skia|react-native-reanimated|react-native-gesture-handler|react-native-worklets)/.*`)];

module.exports = config;
