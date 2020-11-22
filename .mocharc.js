const config = {
  require:'@workingname/register',
  extension: 'js',
  recursive: true,
  reporter: 'dot',
}

if (process.env.CI === 'true') {
  const { name } = require(`${process.cwd()}/package.json`)
  Object.assign(config, {
    reporter: 'xunit',
    'reporterOption': `output=${__dirname}/test-results/${name.replace('/', '-')}/mocha.xml`
  })
}

module.exports = config
