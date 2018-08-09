const router = require('express').Router()
const { google } = require('googleapis')
const request = require('request')
const User = require('../db/User')  // * 디비처리

const KEY_FILE = require('../data/GoogleAuth.json')
const tokenStorage = {
  access_token: null,
  token_type: null,
  expiry_date: null
}

function CheckAccessToken() {
  return new Promise(function (resolve, reject) {
    let nowTime = new Date().getTime()
    if (tokenStorage.access_token === null) { 
      reject(new Error('failed: Token null')) 
    } else if (tokenStorage.expiry_date < nowTime) {
      reject(new Error('failed: Token Expiry '))
    } else {
      resolve()
    }
  })
}

function GetAccessToken() {
  return new Promise(function (resolve, reject) {
    let jwt = new google.auth.JWT(
      KEY_FILE.client_email,
      null,
      KEY_FILE.private_key,
      ['https://www.googleapis.com/auth/androidpublisher']   // 영수증 검증을 위한 권한
    )

    jwt.authorize(function (err, tokens) {
      if (err) {
        reject(err)
        return
      }

      tokenStorage.access_token = tokens.access_token
      tokenStorage.token_type = tokens.token_type
      tokenStorage.expiry_date = tokens.expiry_date
      resolve()
    })
  })
}

function ValidationIAB(packageName, productId, token) {  
  return new Promise(function (resolve, reject) {
    let getURL = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${token}?access_token=${tokenStorage.access_token}`

    request.get(getURL, function(error, response, body) {
      let parseBody = JSON.parse(body)

      if (error) {
        reject(new Error('false'))
      }
      if (!(parseBody.error === null || parseBody.error === undefined)) {
        reject(new Error('false'))
      } else if (parseBody.purchaseState === 0) {
        resolve(true)
      } else {
        reject(new Error('false'))
      }
    })
  })
}    

function ChargeGold(uid, pid, token) {
  return new Promise(function (resolve, reject) {
    User.ChargeGold(uid, pid, token).then(data => {
      resolve(data)
    }).catch(err => {
      reject(err)
    })
  })
}

router.post('/receipt', (req, res, next) => {
  let packageName = '구글에 등록된 어플리케이션 패키지이름'
  let uid = req.body.uid
  let productId = req.body.productid
  let token = req.body.token
  
  CheckAccessToken()
    .catch(GetAccessToken)
    .then(function() {
      return ValidationIAB(packageName, productId, token)
    })
    .catch(function(err) {
      return new Promise(function(resolve, reject) {
        resolve(err)
      })
    })
    .then(data => {
      if (typeof data === 'boolean') {
        ChargeGold(uid, productId, token).then(data => {
          if (data.code === null || data.code === undefined) {
            res.json({code: 'sucess', result: data})
          } else {
            res.json({code: 'fail', result: data})
          }
        })        
      } else {
        res.json({code: 'false'})
      }      
    })
})

module.exports = router