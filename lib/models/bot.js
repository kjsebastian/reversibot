'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BotSchema = new Schema({
    name: String,
    code: String
});

mongoose.model('Bot', BotSchema);