import axios from 'axios'
import url from '../core/soduUrl'
import Book from '../model/book'
const resultCode = require('../api/api-resultCode')
var moment = require('moment')
// var iconv = require('iconv-lite')

function getRankBooks (html) {
  let str = html
  console.log(html)
  let books = []
  let bookReg = /<div class="main-html".[\s\S]*?<div style="width:88px;float:left;">.[\s\S]*?<\/div>/g
  let listReg = /<a href="(.[\S\s]*?)".*?>.*?addToFav\((.[\S\s]*?), '(.[\S\s]*?)'.[\S\s]*?<a.[\S\s]*?>(.[\S\s]*?)<\/a>.[\S\s]*?width:88.*>(.[\S\s]*?)<\/div>/

  let matches = str.match(bookReg)
  let book
  matches.forEach(element => {
    var match = element.match(listReg)
    book = new Book()
    book.bookId = match[2]
    book.bookName = match[3]
    book.newestCatalogName = match[4].replace(/【.*?】/, '')
    book.updatePageUrl = match[1]
    book.updateTime = moment(match[5], 'YYYY/MM/DD hh:mm:ss').format(
      'YYYY/MM/DD hh:mm'
    )
    books.push(book)
  })
  return books
}

async function getRank (index) {
  let uri = url.getRankUrl(index)
  try {
    var res = await axios({
      method: 'get',
      url: uri + '?jdfwkey=4u1sk3'
    })
    var books = getRankBooks(res.data)
    let result = resultCode.createResult(resultCode.success, books)
    return result
  } catch (e) {
    let result = resultCode.createResult(resultCode.faild, e.message)
    return result
  }
}

module.exports = { getRank }
