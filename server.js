const { Builder, By, Key, until } = require('selenium-webdriver')
let util = require('./util')

async function main() {
  this.driver = await new Builder().forBrowser('firefox').build()
  await util.openLoginScreen()
}

main()