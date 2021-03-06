var express = require('express');
var app = express();
const uuid = require('uuid');
var request = require('request');
var redis = require('redis'),
    client = redis.createClient('6379','localhost');
var queue = []
function addQueue(id,query) {
    if(query=='/favicon.ico') return false
    var o = {}
    o.url = 'http://localhost:3000' + query
    o.cb = function(id,url,data) {
        client.set(id,data)
    }
    o.id=id
    console.log(query+' added')
    queue.push(o)
    console.log('queue added', queue.length)
    if (queue.length == 1)
        thread()
}

function thread() {
    console.log('call', queue[0].url)
    request(queue[0].url, function(error, response) {
        console.log('done', queue[0].url)
        body = response ? response.body : ''
        queue[0].cb(queue[0].id,queue[0].url,body)
        queue.splice(0, 1);
        console.log('remaining queue', queue.length)
        if (queue.length > 0)
            thread()
    })
}
app.get('/*', function(req, res, next) {
  id = uuid.v1()
  addQueue(id,req.originalUrl)
  res.json({queueId:id,timestart:(new Date()).getTime()})
});
app.listen(80);
