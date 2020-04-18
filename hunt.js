const { Builder, By, Key, until } = require('selenium-webdriver')
const logs = require('./logs')
const util = require('./util')

async function clickHuntButton() {
  let driver = this.driver

  try {
    let form = await driver.findElement(By.id('form_cacada_tempo'))
    let tds = await form.findElements(By.tagName('td'))
    let td = tds[1]
    let input = await td.findElement(By.tagName('input'))
    input.click()

    await driver.manage().setTimeouts({implicit: 3000})

  } catch(e) {
    clickHuntButton()
  }    
}

async function hunt() {
  let driver = this.driver

  let huntByTime = await driver.findElement(
    By.xpath("//*[contains(text(), 'Caça p/ tempo')]"))

  await huntByTime.click()

  await util.solveCaptcha()

  await clickHuntButton()
}

async function userStillHaveTimeToHunt() {
  let driver = this.driver

  await driver.get('http://www.narutoplayers.com.br/?p=cacadas')
  await driver.manage().setTimeouts({implicit: 2000})

  let huntByTime = await driver.findElement(
    By.xpath("//*[contains(text(), 'Caça p/ tempo')]"))

  await huntByTime.click()

  let elementsFound = await driver.findElements(
    By.xpath("//*[contains(text(), 'Você já usou todo seu tempo de caçada por hoje!')]"))

  return elementsFound.length > 0 ? false : true
}

async function checkAndStartHunting() {
  let secondsLeft = 300

  let stillHaveTimeToHunt = await userStillHaveTimeToHunt()

  if(stillHaveTimeToHunt) {
    logs.save(`Ainda tem tempo pra caçar`)
    let isClockOnTheScreen = await util.isClockOnDOM()

    if(!isClockOnTheScreen) {
      logs.save(`Não tem relógio`)

      let playerAttacked = await util.playerWasAttacked()

      if(!playerAttacked) {
        await hunt()
        logs.save(`Caçada realizada`)

        return secondsLeft
      }
      logs.save(`O player foi atacado`)
      let remainingSeconds = await util.getRemainingSeconds()

      if(remainingSeconds > 0) {
        logs.save(`Tempo restante da penalidade: ${remainingSeconds} segundos`)
        secondsLeft = remainingSeconds

        return secondsLeft
      }
      logs.save(`Apenas atualizar a página`)
      await util.getReward('AtaqueExterno')
      let afterGetRewardStillHaveTimeToHunt = await userStillHaveTimeToHunt()

      if(afterGetRewardStillHaveTimeToHunt) {
        await hunt()
        logs.save(`Caçada realizada`)
        return secondsLeft
      }

      logs.save(`Acabou o tempo da caçada`)
      return secondsLeft
    }
    logs.save(`Tem relógio`)
    let remainingSeconds = await util.getRemainingSeconds()

    if(remainingSeconds > 0) {
      logs.save(`Aguardar por ${remainingSeconds} segundos`)
      secondsLeft = remainingSeconds

      return secondsLeft
    }
    logs.save(`Apenas receber recompensa`)
    await util.getReward('CaçadaPorTempo')
    let afterGetRewardStillHaveTimeToHunt = await userStillHaveTimeToHunt()

    if(afterGetRewardStillHaveTimeToHunt) {
      await hunt()
      logs.save(`Caçada realizada`)
      return secondsLeft
    }
    
    logs.save(`Acabou o tempo da caçada`)
    return secondsLeft
  }
  
  logs.save(`Acabou o tempo da caçada`)
  this.timeToHuntIsUp = false

  return secondsLeft
}

function init(timeToHuntIsUp, driver) {
  this.timeToHuntIsUp = timeToHuntIsUp
  this.driver = driver
}

exports.clickHuntButton = clickHuntButton
exports.checkAndStartHunting = checkAndStartHunting
exports.userStillHaveTimeToHunt = userStillHaveTimeToHunt
exports.hunt = hunt
exports.timeToHuntIsUp = this.timeToHuntIsUp
exports.init = init