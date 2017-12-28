var mongoose = require('mongoose');
var mongo = require('mongodb');
var moment = require('moment');

mongoose.connect('mongodb://localhost/deals');

var db = mongoose.connection;

var DealSchema = mongoose.Schema({
	name:{
		type:String
	},
	deal:{
		type:String
	},
	time:{
		type:Number
	}
})

var Deal = module.exports = mongoose.model('Deal',DealSchema)


module.exports.createDeal = function(newDeal,callback){
	newDeal.save(callback);
}