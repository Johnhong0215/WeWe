// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Tell Metro to bundle .glb and .gltf as assets
  config.resolver.assetExts.push('glb', 'gltf');

  return config;
})();
