module.exports = function override(config, env) {
  config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          inline: true
        }
      }
    })
  return config;

  //just return the original config and pretend this never happened
  //return config;
}
