async function openLoginScreen() {
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

exports.openLoginScreen = openLoginScreen