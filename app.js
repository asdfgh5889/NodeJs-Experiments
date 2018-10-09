const express = require('express')
const requestHandler = require('request')
const mkdirPath = require('./mkdirPath.js')
const fileSystem = require('fs')
const md5 = require('md5')

const app = express()
const port = 3030
const baseUrl = "https://my.abad.uz"
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/*', (request, response) => {
  console.log("BODY:  " + Object.keys(request.body)[0])
  console.log(" ")

  if (fileSystem.existsSync("." + request.path + md5(JSON.stringify(request.body)) + ".json")) {
    console.log("Cache used")
    response.send(getCache(request))
  }
  else {
    console.log("Cache is not used")
    requestHandler({
      method: 'POST',
      preambleCRLF: true,
      postambleCRLF: true,
      uri: baseUrl + request.path,
      body: Object.keys(request.body)[0],
    },
      function (error, remoteResponse, body) {
        if (error) {
          console.error('upload failed:', error)
          return
        }
        response.send(body)
        console.log("Upload successful! " + request.path);
        cacheApiToFile(request, body)
      })
  }
})

let cacheApiToFile = (request, body) => {
  mkdirPath.mkDirByPathSync("." + request.path)
  fileSystem.writeFile("." + request.path + md5(JSON.stringify(request.body)) + ".json", body, (err) => {
    if (err) {
      return console.log(err)
    }
  })
}

let getCache = (request) => {
  return fileSystem.readFileSync("." + request.path + md5(JSON.stringify(request.body)) + ".json", (err) => {
    console.log("Error")
  })
}

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})