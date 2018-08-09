require('dotenv').config()
const LOGDIR = process.env.LOGGER_DIR

const winston = require('winston')
const moment = require('moment')
require('winston-daily-rotate-file')

function timeStampFormat() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS zz')
}

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.DailyRotateFile)({
      filename: `${LOGDIR}/info_%DATE%.log`,
      datePattern: 'YYYMMDD',
      colorize: false,
      maxsize: 50000000,
      maxFiles: 1000,
      level: 'debug',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    }),
    new (winston.transports.Console)({      
      level: 'debug',
      colorize: true,
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })    
  ],
  exceptionHandlers: [
    new (winston.transports.DailyRotateFile)({
      filename: `${LOGDIR}/exception_%DATE%.log`,
      datePattern: 'YYYMMDD',
      colorize: false,
      maxsize: 50000000,
      maxFiles: 1000,
      level: 'error',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    }),
    new (winston.transports.Console)({
      name: 'exception',
      level: 'error',
      colorize: true,
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })
  ]
})
module.exports = logger