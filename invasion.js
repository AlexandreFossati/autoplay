const { Builder, By, Key, until } = require('selenium-webdriver')
const logs = require('./logs')
let util = require('./util')

async function attackInvader() {
  let driver = this.driver

  let div = await driver.findElement(By.id('relogio_invasao'))
  await div.click()

  logs.save(`Ataque ao invasor realizado`)
}

async function navToInvasionPage() {
  let driver = this.driver

  let invasionNinja = await driver.findElement(
    By.xpath("//*[contains(text(), 'Invasão Ninja')]"))

  await invasionNinja.click()
  await driver.manage().setTimeouts({implicit: 2000})
}

async function checkAndAttackInvader() {
  let driver = this.driver

  await driver.manage().setTimeouts({implicit: 2000})
  await navToInvasionPage()

  try {
    await driver.findElement(By.id('img_captcha'))
    await util.solveCaptcha()
    await attackInvader()
  } catch(e) {
    logs.save('Não há um inimigo para atacar na Invasão')
  }  
}

function init(driver) {
  this.driver = driver
}

exports.attackInvader = attackInvader
exports.navToInvasionPage = navToInvasionPage
exports.checkAndAttackInvader = checkAndAttackInvader
exports.init = init