module.exports = function override(config, env) {
  //allow the use of web workers in chrome when running from a file system by using inline: true
  config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          inline: true
        }
      }
    })
  //ignore bip39 word lists that are not english. TODO: Make webpack work with non-ejected react
  //config.plugins.push( new webpack.IgnorePlugin(/^\.\/(?!english)/, /bip39\/src\/wordlists$/) );
  return config;

  //just return the original config and pretend this never happened
  //return config;
}
