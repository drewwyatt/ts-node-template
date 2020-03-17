#! /usr/bin/env node
const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const readline = require('readline')

const {
  PACKAGE_JSON_PATH,
  POSTINSTALL_SCRIPT,
  PRETTIER_CONFIG_PATH,
  README_PATH,
} = require('./consts')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const DEFAULT_NAME = process
  .cwd()
  .split('/')
  .reduce((_, curr) => curr, '')

const handleError = err => {
  console.error('[ERROR] There was a problem setting up this project.')
  console.error(err)
  try {
    fs.writeFileSync(path.resolve(__dirname, './setup-error.json'), JSON.stringify(err))
  } catch (_) {
    console.error('[ERROR] Could not write error log')
  }
  process.exit(1)
}

rl.question(`Enter project name or leave blank for "${DEFAULT_NAME}": `, name => {
  try {
    const projectName = (name || DEFAULT_NAME).trim()
    if (!projectName) {
      console.log(`Invalid project name "${projectName}".`)
      console.log('Exiting...')
      process.exit(1)
    }

    console.log('Setting up project with name:', projectName)
    updatePackageJson(projectName)
      .then(updateReadme)
      .then(cleanup)
      .then(() => rl.close())
      .catch(handleError)
  } catch (err) {
    handleError(err)
  }
})

const updatePackageJson = async projectName => {
  console.log('👷‍♀️ updating package.json....')
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'))
  packageJson.name = projectName
  packageJson.scripts.postinstall = POSTINSTALL_SCRIPT
  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    prettier.format(JSON.stringify(packageJson), {
      config: PRETTIER_CONFIG_PATH,
      parser: 'json',
    }),
  )
  return projectName
}

const updateReadme = async projectName => {
  console.log('👷‍♀️ updating readme...')
  const readme = fs.readFileSync(README_PATH, 'utf8')
  fs.writeFileSync(README_PATH, readme.replace(/# (.*)/, ['#', projectName].join(' ')))
  return projectName
}

const cleanup = async () => {
  console.log('👷‍♀️ removing setup script...')
  fs.rmdirSync(__dirname, { recursive: true })
  return
}

rl.on('close', () => {
  console.log('✅ Setup complete.')
  console.log('👋 Exiting...')
  process.exit(0)
})
