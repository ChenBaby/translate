#!/usr/bin/env node
let http = require('http'),
    words = [].concat(process.argv),
    log = console.log,
    isSentence = false
function createOptions (input) {
    return {
        hostname: `fanyi.youdao.com`,
        port: 80,
        path: `/openapi.do?keyfrom=richole&key=1196902348&type=data&doctype=json&version=1.1&q=${encodeURIComponent(input)}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
}

function getTranslation (val) {
    return new Promise((resolve, reject) => {
        var thisRequest,
            thisChunk = '',
            thisData
        thisRequest = http.request(createOptions(val), (res) => {
            res.setEncoding('utf-8')

            res.on('data', (chunk) => {
                thisChunk += chunk
            })

            res.on('end', () => {
                if (!isSentence) log(`# ${val}`)
                thisData = JSON.parse(thisChunk)
                let translations = ''
                translations += thisData.translation.join('  ')
                if (thisData.basic && thisData.basic.explains) {
                    translations += `\n${thisData.basic.explains.join('\n')}`
                }
                if (thisData.web) {
                    let webtranslations = ''
                    thisData.web.forEach((item) => {
                        webtranslations += `${item.key}: ${item.value.join(',')}\n`
                    })
                    translations += `\n${webtranslations}`
                }
                resolve(translations)
            })
        })
        thisRequest.on('error', (e) => {
            reject(new Error(e.message))
        })
        thisRequest.end()
    })
}

if (words.length > 2) {
    words.splice(0, 2)
    words = words.filter(item => {
        if (item === '-s' || item === '--s') {
            isSentence = true
        } else {
            return item
        }
    })
    if (isSentence) {
        words = [words.join(' ')]
    }
    async function output () {
        for(let index = 0; index < words.length; index++) {
            if (index === 0) log(new Array(60).join('='))
            var translations = await getTranslation(words[index])
            log(translations)
            log('\n')
        }
    }
    try {
        output()
    }
    catch (error) {
        log(`error: ${error}\n`)
    }
} else {
    log('请输入待翻译词语，多个词语请用空格隔开, 若翻译句子加上参数 -s')
    log('例如: translate hello')
    log('例如: translate -s hello world')
}