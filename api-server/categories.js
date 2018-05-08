const clone = require('clone')
const config = require('./config')

let db = {}

const defaultData = {
  categories: [
      {
        name: 'react',
        path: 'react'
      },
      {
        name: 'redux',
        path: 'redux'
      },
      {
        name: 'udacity',
        path: 'udacity'
      }
  ]
}

function getData (token) {
  //每个标识都有自己的 DB 副本。这种情况下的标识就像一个应用程序 ID
  let data = db[token]
  //如果 db 中没有，则填充默认用户数据。
  if (data == null) {
    data = db[token] = clone(defaultData)
  }
  return data
}

function getAll (token) {
  return new Promise((res) => {
    res(getData(token))    
  })
}

module.exports = {
  getAll
}
