const { Builder, By, Key, until } = require('selenium-webdriver')
const logs = require('./logs')
const util = require('./util')

async function getBattleReward() {
  let driver = this.driver

  let divs = await driver.findElements(By.className('linha_css_memo center'))
  let div = divs[0]

  let strongs = await div.findElements(By.tagName('strong'))
  let reward = await strongs[0].getText()

  return parseFloat(reward)
}

async function clickAttackButton() {
  let driver = this.driver

  let form = await driver.findElement(By.id('form1'))
  let table = await form.findElement(By.tagName('table'))
  await table.findElement(By.tagName('input')).click()
  await driver.manage().setTimeouts({implicit: 2000})
}

async function clickHuntPlayer() {
  let driver = this.driver
  
  let form = await driver.findElement(By.id('form_cacada_nome'))
  let table = await form.findElement(By.tagName('table'))
  await table.findElement(By.tagName('input')).click()
  await driver.manage().setTimeouts({implicit: 2000})
  
  try {
    await driver.findElement(By.id('error'))
    return false
  } catch(e) {
    return true
  }
}

async function attackPlayer(player) {
  let driver = this.driver

  await driver.get('http://www.narutoplayers.com.br/?p=cacadas')
  await driver.manage().setTimeouts({implicit: 2000})

  await driver.findElement(By.id('nome_inimigo')).sendKeys(player, Key.RETURN)
  await util.solveCaptcha()
  
  let enemyFound = await clickHuntPlayer()

  if(enemyFound) {
    await clickAttackButton()
    return true
  }
  else {
    return false
  }
}

async function getLink(element) {
  try {
    let href = await element.findElement(By.tagName('a')).getAttribute('href')
    return href
  } catch(e) {
    getLink(element)
  }
}

async function getPlayerName() {
  let driver = this.driver
  let playerName = null

  let rows = await driver.findElements(By.className('linha_css linha_css_text'))

  while(this.rankingCount < 50) {
    let level = await rows[this.rankingCount].findElement(By.className('col_css_ranking_level')).getText()
    let div = await rows[this.rankingCount].findElement(By.className('col_css_ranking_vila'))
    let title = await div.findElement(By.tagName('img')).getAttribute('title')

    if(level < 10) {
      let div = await rows[this.rankingCount].findElement(By.className('col_css_ranking_vila'))
      let title = await div.findElement(By.tagName('img')).getAttribute('title')

      if(title != this.selectedVillage) {
        let internalDiv = await rows[this.rankingCount].findElement(By.className('col_css_ranking_player'))
        let href = await getLink(internalDiv)
        await driver.get(href)
        await driver.manage().setTimeouts({implicit: 2000})

        let header = await driver.findElement(By.className('avatar_master_info'))
        playerName = await header.findElement(By.tagName('a')).getText()
        
        console.log('FOUND')

        this.rankingCount++
        break
      }

    }
  
    this.rankingCount++
  }

  if(this.rankingCount >= 49) {
    this.rankingCount = 0
    this.page++
  }

  return playerName
}

async function selectPage(page) {
  let driver = this.driver
  let option = null

  while(!option) {
    try {
      // 1 ao 338
      option = await driver.findElement(By.xpath(`//*[@id="posicao"]/option[${page}]`))
      await option.click()
      await clickSearchButton()

    } catch(e) {
      console.log('Erro ao encontrar ')
      selectPage(page)
    }
  }  
}

async function clickSearchButton() {
  let driver = this.driver

  try {
    let form = await driver.findElement(By.id('form_raking'))
    let table = await form.findElement(By.tagName('table'))
    let tbody = await table.findElement(By.tagName('tbody'))
    let tr = await tbody.findElement(By.tagName('tr'))
    let tds = await tr.findElements(By.tagName('td'))
    let td = tds[3]

    let internalTable = await td.findElement(By.tagName('table'))
    let internalTbody = await internalTable.findElement(By.tagName('tbody'))
    let internalTr = await internalTbody.findElement(By.tagName('tr'))
    let internalTds = await internalTr.findElements(By.tagName('td'))
    let internalTd = internalTds[1]

    await internalTd.findElement(By.tagName('input')).click()

  } catch(e) {
    console.log('Erro ao clicar no botão buscar')
    await clickSearchButton()
  }
}

async function selectGeneralRanking() {
  let driver = this.driver

  let options = await driver.findElement(By.id('slot')).findElements(By.tagName('option'))
  await options[0].click()

  let villages = await driver.findElement(By.id('vila')).findElements(By.tagName('option'))
  await villages[0].click()

  await clickSearchButton()

  await driver.manage().setTimeouts({implicit: 2000})
}

async function navToRanking() {
  let driver = this.driver  
  await driver.get('http://www.narutoplayers.com.br/?p=ranking')
  await driver.manage().setTimeouts({implicit: 2000})
}

async function attackPlayerFromRanking() {
  let loop = true

  while(loop) {
    await navToRanking()
    await selectGeneralRanking()
    await selectPage(this.page)
  
    let player = await getPlayerName()
  
    if(player) {
      let attackIsOk = await attackPlayer(player)
  
      if(attackIsOk) {
        logs.save(`Player do ranking atacado: ${player}`)
        let reward = await getBattleReward()
        logs.saveBattle(player, reward, this.enemies)
        logs.updateParams(this.selectedVillage, this.rankingCount, this.page)
        loop = false
      }
    }
  }
}

async function attackPlayersFromList() {
  let enemies = this.enemies
  let itWorked = false

  if(this.enemyIndex >= enemies.length)
    return itWorked

  while(this.enemyIndex < enemies.length) {    
    itWorked = await attackPlayer(enemies[this.enemyIndex].player)    

    if(itWorked) {
      logs.save(`Player da lista atacado: ${enemies[this.enemyIndex].player}`)
      let reward = await getBattleReward()
      this.enemies[this.enemyIndex].ryous = reward
      this.enemyIndex++
      break
    }

    this.enemyIndex++
  }

  if(this.enemyIndex >= enemies.length)
    logs.removePlayers(this.enemies)

  return itWorked
}

async function verifyIfUserCanAttack() {
  let driver = this.driver

  await driver.get('http://www.narutoplayers.com.br/?p=cacadas')
  await driver.manage().setTimeouts({implicit: 2000})

  let underPenaltyTime = await util.playerWasAttacked()

  if(underPenaltyTime) return false

  return true
}

async function checkAndAttackPlayer() {
  let userCanAttack = await verifyIfUserCanAttack()
  let secondsLeft = 300

  if(userCanAttack) {
    let itWorked = await attackPlayersFromList()

    if(!itWorked) await attackPlayerFromRanking() 
  }
  else {
    secondsLeft = await util.getRemainingSeconds()
  }

  logs.save(`Fim do processo. Tempo até restart: ${secondsLeft}`)
  return secondsLeft
}

function init(enemies, selectedVillage, rankingCount, page, driver) {
  this.enemyIndex = 0
  this.enemies = enemies
  this.selectedVillage = selectedVillage
  this.rankingCount = rankingCount
  this.page = page
  this.driver = driver
}

exports.checkAndAttackPlayer = checkAndAttackPlayer
exports.init = init