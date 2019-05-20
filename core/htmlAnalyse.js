import sourceHelper from '../core/source'
import Url from '../util/url'
import contentType from '../model/contentType'
import Book from '../model/book'

let source = sourceHelper.source

function getContent (html, url, bookid, type) {
  let uri = Url(url)
  let result = null
  let sourceItem = sourceHelper.getSource(uri.host)
  if (!sourceItem) {
    return null
  }
  if (type == contentType.content) {
    result = getHtmlCommon(html, sourceItem.contentReg)
  } else if (type == contentType.catalogPageUrl) {
    result = getCatalogPageUrl(url, url, bookid)
  } else if (type == contentType.catalgs) {
    result = getCatalogs(html, sourceItem.catalogReges, url)
    result.lyWeb = sourceItem.disc
  }
  return result
}

function getHtmlCommon (html, regexStr) {
  try {
    let result = null
    html = html.replace(/\r/g, '').replace(/\n/g, '')
    var match = html.match(regexStr)
    if (match.length > 0) {
      result = replaceSymbel(match[0])
    }
    return result
  } catch (ex) {
    console.log(ex)
    return null
  }
}

function replaceSymbel (html) {
  html = html.replace(/<br.*?\/>/g, '\n')
  html = html.replace(/<script.*?<\/script>/g, '')
  html = html.replace(/&nbsp;/g, ' ')
  html = html.replace(/<p.*?>/g, '\n')
  html = html.replace(/<.*?>/g, '')
  html = html.replace(/&lt;\/script&gt;/g, '')
  html = html.replace(/&lt;\/div&gt;/g, '')
  html = html.replace(/\n\n/g, '\n')
  html = html.replace(/　/g, '')
  html = html.replace(/ /g, '')
  if (html.startsWith('\n')) {
    html = html.replace(/\n/, '')
  }
  html = html.replace(/\n/g, '\n　　')
  html = html.replace('八一中文网启用新网址Www.81xsw.Com', '')

  return '　　' + html
}

function getCatalogPageUrl (html, url, bookid) {
  // 乐文
  if (url.indexOf('www.lwtxt.net') > -1) {
    var index1 = url.lastIndexOf('/')
    var index2 = url.lastIndexOf('_')
    var bookId = url.substr(index1 + 1, index2 - index1 + 1)
    var result = 'http://www.lwtxt.net/modules/article/reader.php?aid=' + bookId
    return result
  }

  // 卓雅居
  if (url.indexOf('www.zhuoyaju.com') > -1) {
    var uri = Url(url)
    var str = uri.pathname.substr(0, uri.pathname.lastIndexOf('/'))
    var bookId = str.substr(str.lastIndexOf('/') + 1, str.length - 1)
    var result = `http://www.zhuoyaju.com/book/${bookId}.html`
    return result
  }

  if (url.indexOf('www.dashubao.cc') > -1) {
    var index1 = url.lastIndexOf('/')
    var index2 = url.lastIndexOf('_')
    var bookId = url.substr(index1 + 1, index2 - index1 + 1)
    var result = 'http://www.dashubao.cc/modules/article/reader.php?aid=' + bookId
    return result
  }

  if (url.indexOf('www.aileleba.com/') > -1) {
    // http://www.aileleba.com/142904.shtml
    // http://www.aileleba.com/142904/zhangjie27434493.shtml
    var result = url.substr(0, url.lastIndexOf('/')) + '.shtml'
    return result
  }

  var result = url.substr(0, url.lastIndexOf('/') + 1)
  return result
}

function getCatalogs (html, regexStrs, catalogPageUrl) {
  try {
    //
    let catalogs = []
    let author = ''
    let cover = ''
    let intro = ''
    html = html.replace(/\r/g, '').replace(/\n/g, '')
    // 目录列表
    var catalogMatch = html.match(regexStrs.catalogAreaRegex)
    if (catalogMatch) {
      let matches = catalogMatch[0].match(regexStrs.catalogItemRegex)
      let index = 0
      matches.forEach(element => {
        var match = element.match(regexStrs.catalogItemDetailRegex)
        if (match && match.length > 1) {
          let catalog = {}
          catalog.index = index
          catalog.catalogUrl = regexStrs.addPre ? catalogPageUrl + match[1] : match[1]
          catalog.catalogUrl = catalog.catalogUrl.replace(/\t/g, '')
          catalog.catalogName = match[2]
          catalogs.push(catalog)
          index += 1
        }
      })
    }

    // 简介
    var introMatch = html.match(regexStrs.introRegex)
    if (introMatch && introMatch[1]) {
      intro = replaceSymbel(introMatch[1].trim())
    }

    // 封面
    var coverMatch = html.match(regexStrs.coverRegex)
    if (coverMatch && coverMatch[1]) {
      let url = Url(catalogPageUrl)
      cover = regexStrs.imgPre ? url.protocol + '//' + url.host + coverMatch[1].trim() : coverMatch[1].trim()
    }

    // 作者
    var authorMatch = html.match(regexStrs.authorRegex)
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim()
    }
    console.log(catalogs)
    console.log(intro)
    console.log(cover)
    console.log(author)
    return {
      catalogs,
      intro,
      cover,
      author
    }
  } catch (ex) {
    console.log(ex)
    return null
  }
}

function getSearchResult (html, sourceItem) {
  try {
    let matches = html.match(sourceItem.searchReg)
    let books = []
    matches.forEach(element => {
      try {
        var match = element.match(sourceItem.searchReg2)
        if (match && match.length > 1) {
          let book = new Book()
          book.type = 1
          book.bookId = sourceItem.disc + match[4]
          book.bookName = match[2]
          book.updatePageUrl = match[1]
          book.lyWeb = sourceItem.disc
          book.author = match[3]
          books.push(book)
        }
        return books
      } catch (err) {
        console.log(err)
      }
    })
    return books
  } catch (error) {
    return null
  }
}

module.exports = {
  getContent,
  getSearchResult
}
