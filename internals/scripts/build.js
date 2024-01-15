// @ts-check
const execSync = require('child_process').execSync
const buildSha = require('child_process').execSync('git rev-parse HEAD').toString().trim()
const buildDatetime = Date.now().toString()

execSync(`tsc && REACT_APP_BUILD_SHA="${buildSha}" REACT_APP_BUILD_DATETIME="${buildDatetime}" vite build`, {
  stdio: 'inherit',
})
