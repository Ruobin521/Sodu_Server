import axios from 'axios';
import url from '../api/soduUrl';
import analysis from '../api/htmlAnalyse'
import contentType from '../model/contentType'
const iconv = require('iconv-lite');
const resultCode = require('../api/result-code');

async function getContent(params) {
    try {
        var result = await axios({
            method: 'get',
            url: params.url,
            responseType: 'arraybuffer',
            transformResponse: [function(data) {
                var str = iconv.decode(data, 'GBK')
                return str
            }]
        })
        var content = analysis.getContent(result.data, params.url, params.id, contentType.content)
        let result = resultCode.createResult(resultCode.success, content)
        return result
    } catch (e) {
        let result = resultCode.createResult(resultCode.faild, e.message)
        return result
    }
}

function getCatalogPageUrl(params) {
    var url = analysis.getContent(null, params.url, params.id, contentType.catalogPageUrl)
    return url;
}

async function getCatalogs(params) {
    let url = getCatalogPageUrl(params)
    try {
        var result = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
            transformResponse: [function(data) {
                var str = iconv.decode(data, 'GBK')
                return str
            }]
        })
        console.log(result);
        var catalogs = analysis.getContent(result.data, url, params.id, contentType.catalgs)
        let result = resultCode.createResult(resultCode.success, catalogs)
        return result
    } catch (e) {
        let result = resultCode.createResult(resultCode.faild, e.message)
        return result
    }
}

module.exports = {
    getContent,
    getCatalogs
}