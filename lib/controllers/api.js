'use strict';

var mongoose = require('mongoose'),
Thing = mongoose.model('Thing');
var Bot = mongoose.model('Bot');

exports.getAllBots = function(req, res) {
    var lang = req.params.lang;
    console.log(lang);
    Bot.find({language: lang}, function(err, bots) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        res.json(bots);
    });
};
exports.addNewBot = function(req, res) {
    var code = req.params.code;
    console.log(req.body.code);
    var newBot = new Bot(req.body);
    newBot.save(function(error, bot, numberAffected) {
        if (error) {res.send(error);}
        res.json(bot);
    });
};

exports.use_verify_service = function(req, res) {
    // return res.json({'success': 1});
    var problem = req.query.problem;
    var tests = req.query.tests;
    var lang = req.query.language;
    lang = lang.toLowerCase();
    if (lang === 'javascript') {
        lang = 'js';
    }

    console.log(problem);

    var http = require('http');
    var querystring = require('querystring');

    var data = {
        tests: tests,
        solution: problem
    };

    var dataString = querystring.stringify({jsonrequest:JSON.stringify(data)});

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': dataString.length
  };

    // make request to singpath backend
    var url = "ec2-54-251-204-6.ap-southeast-1.compute.amazonaws.com";
    var options = {
        hostname: url,
        path: '/'+lang.toLowerCase(),
        method: 'POST',
        headers: headers
    };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            console.log(chunk);
            res.send(chunk);
        });
    });

    request.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    request.write(dataString);
    request.end();
};