'use strict';

var should = require('should'),
    app = require('../../../server'),
    request = require('supertest');

describe('GET /api/all_bots', function() {
  
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/all_bots')
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});