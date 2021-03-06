const { Builder, By, Key, until } = require('selenium-webdriver')
let util = require('./util')
let logs = require('./logs')
let invasion = require('./invasion')
let hunt = require('./hunt')
let attack = require('./attack')

async function acceptLevelUp() {
  let popup = null

  try {
    popup = await driver.findElement(By.className('upgrade_fechar'))
    
  } catch(e) {
    console.log('Não subiu de nível')
  }

  let itWorked = false

  while(popup && !itWorked) {
    try {
      let strong = await popup.findElement(By.tagName('strong'))
      let a = await strong.findElement(By.tagName('a'))
      await a.click()
      logs.save('Player subiu de nível')
      itWorked = true
    } catch(e) { 
      // faz nada
    }
  }
}

async function executeSteps() {
  let driver = this.driver
  let secondsTillNextHunt = 300
  let itWorked = false

  while(!itWorked) {
    try {
      // if(hunt.timeToHuntIsUp) {
      //  secondsTillNextHunt = await hunt.checkAndStartHunting()
    
      //  if(!hunt.timeToHuntIsUp) 
      //    secondsTillNextHunt = await attack.checkAndAttackPlayer()
      // }  
      
      // else {
      //  secondsTillNextHunt = await attack.checkAndAttackPlayer()
      // }
    
      await invasion.checkAndAttackInvader()
      itWorked = true

    } catch(e) {
      await acceptLevelUp()
    }

  }
  return secondsTillNextHunt
}

async function loop() {
  this.iteration++
  logs.save(`Iteração: ${this.iteration}`)

  let secondsTillNextHunt = await executeSteps()

  logs.save(`Fim do processo. Tempo até o restart: ${secondsTillNextHunt}`)
  setTimeout(loop.bind(this), secondsTillNextHunt * 1000)
}

async function main() {
  let driver = await new Builder().forBrowser('firefox').build()

  // init logs local variables
  logs.init(new Date().getTime())

  // variables to hunt
  hunt.timeToHuntIsUp = true
  hunt.init(true, driver)

  // variables to attack players
  let enemies = await logs.asyncReadList()
  let json = await logs.asyncReadParams()
  let selectedVillage = json.selectedVillage
  let rankingCount = json.rankingCount
  let page = json.page

  // attack.init(enemies, selectedVillage, rankingCount, page, driver)
  this.enemyIndex = 0
  this.enemies = await logs.asyncReadList()
  this.selectedVillage = selectedVillage
  this.rankingCount = rankingCount
  this.page = page

  // start  
  util.init(driver)
  invasion.init(driver)
  this.iteration = 0
  this.driver = driver

  logs.initializeFile()  

  await util.openLoginScreen()  
  await loop()
}

main()