const { promisify } = require('util')
const fs = require('fs')

const readFileAsync = promisify(fs.readFile)

function updateParams(selectedVillage, rankingCount, page) {
  let json = {
    selectedVillage: selectedVillage,
    rankingCount: rankingCount,
    page: page
  }

  fs.writeFile('Params.txt', JSON.stringify(json), err => {
    if(err) throw err
  })
}

function removePlayers(enemies) {
  enemies = enemies.filter(enemy => {
    if(enemy.ryous > 100) return true
  })

  fs.writeFile('ListaDeAtaque.txt', JSON.stringify(enemies), err => {
    if(err) throw err
  })
}

async function saveBattle(player, reward, enemies) {
  let money = reward

  if(money > 150) {
    enemies.push({player: player, ryous: money})

    enemies = enemies.sort((a, b) => {
      return a.ryous < b.ryous ? -1 : 1
    })

    fs.writeFile('ListaDeAtaque.txt', JSON.stringify(enemies), err => {
      if(err) throw err
    })
  }
}

async function asyncReadParams() {
  let text = await readFileAsync('Params.txt', 'utf-8')
  let json = JSON.parse(text)
  return json
}

async function asyncReadList() {
  let text = await readFileAsync('ListaDeAtaque.txt', 'utf-8')
  let array = JSON.parse(text)
  return array
}

function initializeFile() {
  fs.writeFile(`./log/${this.date}.txt`, '', (err) => {
    if (err) throw err
  })
}

function save(text) {
  let time = new Date().toLocaleTimeString()

  fs.appendFileSync(`./log/${this.date}.txt`, `\n${time}: ${text}`, (err) => {
    if (err) throw err
  })
  
}

function init(date) {
  this.date = date
}

exports.updateParams = updateParams
exports.removePlayers = removePlayers
exports.saveBattle = saveBattle
exports.asyncReadParams = asyncReadParams
exports.asyncReadList = asyncReadList
exports.initializeFile = initializeFile
exports.save = save
exports.init = init