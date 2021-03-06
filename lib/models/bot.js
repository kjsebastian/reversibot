'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BotSchema = new Schema({
    name: String,
    language: String,
    code: String,
    username: String
});

mongoose.model('Bot', BotSchema);