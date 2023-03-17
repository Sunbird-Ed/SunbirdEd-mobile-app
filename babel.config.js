module.exports = function (api) {
  api.cache(true);

  const presets = [
    "@babel/env",
    "@babel/typescript",
    "@babel/preset-env",
      {
          "loose": true,
          "modules": false,
          "debug": true
      }
  ];
  const plugins = [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/proposal-class-properties", { "loose": true }],
    "@babel/proposal-object-rest-spread",
  ];

  return {
    presets,
    plugins
  };
};
