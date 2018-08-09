const url = require('url')
const logger = require('./winston')

const dungeonType = require('../data/dungeon_type.json')
const bossType = require('../data/monster_basic.json')
const soldierType = require('../data/member_basic.json')

function pad(num) {
  return (num > 0 ? '' : '0') + num
}

exports.getDateTime = function() {
  const date = new Date()

  let tYear = date.getFullYear()
  let tMonth = pad(date.getMonth() + 1)
  let tDay = pad(date.getDate())
  let tHour = pad(date.getHours())
  let tMinute = pad(date.getMinutes())

  return tYear + '-' + tMonth + '-' + tDay + ' ' + tHour + ':' + tMinute
}

exports.writeLog = function (req, res) {
  let getURL = url.format({
    auth: req.auth,
    protocol: req.protocol,
    host: req.host,
    pathname: req.originalUrl
  })
  
  let log = {
    url: getURL,
    res: res
  }
  logger.info(log)  
}

exports.writeLog2 = function (req) {
  let getURL = url.format({
    auth: req.auth,
    protocol: req.protocol,
    host: req.host,
    pathname: req.originalUrl
  })
  logger.info(getURL)
}

exports.writeQuery = function (query) {
  logger.info(query)
}

exports.randomize = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

exports.setDungeon = function (dtype) {
  let dungeonlist = {}  
  
  if (dtype !== '') {
    dungeonlist = dungeonType.dungeon_type.filter((item) => {
      return item.type !== dtype
    })
  } else {
    dungeonlist = dungeonType
  }

  let num = this.randomize(0, dungeonlist.length - 1)
  let gettype = dungeonlist[num].type
  let getidx = dungeonlist[num].index
  let getboss = dungeonlist[num].boss_chance

  return ({gettype, getidx, getboss})
}

exports.getBossYN = function(ratio) {
  let bosslist = bossType.monster_basic.filter((boss) => {
    return boss.type === 'boss'
  })
  let bossarray = []
  for (let i = 0; i < 100; i++) {
    if (i < ratio) {
      bossarray.push('Y')
    } else {
      bossarray.push('N')
    }    
  }
  let num = this.randomize(0, 100 - 1)
  let num2 = num % 2

  if (bossarray[num] === 'Y') {    
    return ({'YN': bossarray[num], 'idx': bosslist[num2].index})
  } else {
    return ({'YN': bossarray[num], 'idx': 0})
  }
}

exports.getSoldier = function() {
  let soldierlist = soldierType.member_basic
  let array = []
  let getarray = []
  let getsolder = []

  for (let i = 0; i < 55; i++) { array.push(1) }
  for (let i = 0; i < 30; i++) { array.push(2) }
  for (let i = 0; i < 10; i++) { array.push(3) }
  for (let i = 0; i < 5; i++) { array.push(4) }
  
  for (let i = 0; i < 4; i++) {
    let n = this.randomize(0, 100 - 1)
    getarray.push(array[n])
    array.splice(n, 1)
  }

  for (let i = 0; i < getarray.length; i++) {
    let tmplist = soldierlist.filter((list) => { return list.grade === getarray[i] })
    let n = this.randomize(0, tmplist.length - 1)
    getsolder.push({'idx': tmplist[n].index, 'grade': tmplist[n].grade})
  }

  return getsolder
}