const { Builder, By, Key, until } = require('selenium-webdriver')

const fs = require('fs')
const deepai = require('deepai')

deepai.setApiKey('204040f4-1ee7-4390-a4b4-54e0cffab326');

async function compareImages() {
  let res = await deepai.callStandardApi('image-similarity', {
      image1: fs.createReadStream("img/captcha.jpeg"),
      image2: fs.createReadStream("img/Naruto.jpeg"),
  })
  
  if(res.output.distance == 0) return 0
  
  res = await deepai.callStandardApi('image-similarity', {
      image1: fs.createReadStream("img/captcha.jpeg"),
      image2: fs.createReadStream("img/Sakura.jpeg"),
  })

  if(res.output.distance == 0) return 1

  res = await deepai.callStandardApi('image-similarity', {
      image1: fs.createReadStream("img/captcha.jpeg"),
      image2: fs.createReadStream("img/Sasuke.jpeg"),
  })

  if(res.output.distance == 0) return 2

  res = await deepai.callStandardApi('image-similarity', {
      image1: fs.createReadStream("img/captcha.jpeg"),
      image2: fs.createReadStream("img/Kakashi.jpeg"),
  })

  if(res.output.distance == 0) return 3
}

async function solveCaptcha() {
  let driver = this.driver

  let captcha = await driver.findElement(By.id('img_captcha'))
  let image64 = await captcha.takeScreenshot()

  fs.writeFileSync('img/captcha.jpeg', image64, 'base64');
  let givenImage = await compareImages()

  if(givenImage == 0) await driver.findElement(By.id('teste_resp1')).click()
  else if(givenImage == 1) await driver.findElement(By.id('teste_resp2')).click()
  else if(givenImage == 2) await driver.findElement(By.id('teste_resp3')).click()
  else if(givenImage == 3) await driver.findElement(By.id('teste_resp4')).click()
}

async function getReward(from) {
  let driver = this.driver

  if(from == 'CaçadaPorTempo') {
    try {
      let span = await driver.findElement(By.id('receber_m'))
      await span.findElement(By.tagName('img')).click()
  
    } catch(e) {
      getReward(from)
    }
  }
  else {
    try {
      let div = await driver.findElement(By.id('relogio_contador'))
      await div.click()
  
    } catch(e) {
      getReward(from)
    }
  }
}

async function getRemainingSeconds() {
  let driver = this.driver

  try {
    let time = await driver.findElement(By.id('relogio_contador')).getText()

    if(time == 'Caçada concluída!' || time == 'Atualizar!') {
      return 0
    }

    let min = parseInt(time.split(':')[1])
    let sec = parseInt(time.split(':')[2])
    return ( min * 60 ) + sec

  } catch(e) {
    return 0
  }
}

async function playerWasAttacked() {
  let driver = this.driver

  let elementsFound = await driver.findElements(
    By.xpath("//*[contains(text(), 'Tempo restante de penalidade:')]"))

  return elementsFound.length > 0 ? true : false
}

async function isClockOnDOM() {
  let driver = this.driver

  let elementsFound = await driver.findElements(
    By.xpath("//*[contains(text(), 'Tempo restante de caçada:')]"))

  return elementsFound.length > 0 ? true : false
}

async function openLoginScreen() {
  let driver = this.driver
  await driver.get('http://www.narutoplayers.com.br')

  let select = await driver.findElement(By.id('servidor'))
  let options = await select.findElements(By.tagName('option'))
  await options[1].click()

  // await driver.findElement(By.id('usuario')).sendKeys('fossatialex', Key.RETURN)
  // await driver.findElement(By.id('senha')).sendKeys('c6#&#*$N', Key.RETURN)

  await driver.findElement(By.id('usuario')).sendKeys('alexfossati', Key.RETURN)
  await driver.findElement(By.id('senha')).sendKeys('bKn13#rF09', Key.RETURN)

  await driver.wait(until.urlIs('http://www.narutoplayers.com.br/?p=status'))
}

function init(driver) {
  this.driver = driver
}

exports.compareImages = compareImages
exports.solveCaptcha = solveCaptcha
exports.getReward = getReward
exports.getRemainingSeconds = getRemainingSeconds
exports.playerWasAttacked = playerWasAttacked
exports.isClockOnDOM = isClockOnDOM
exports.openLoginScreen = openLoginScreen
exports.init = init