if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}


var mongoose = require('mongoose');
var mongo = require('mongodb');
var moment = require('moment');

var URI = process.env.MLAB_URI ||'mongodb://localhost/deals'


mongoose.connect(URI);


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

module.exports.findDeal = function(dealRequest){
    return new Promise((resolve, reject) => {
        // try to get the most recent version 
        Deal.findOne({name:dealRequest}).sort({time: -1}).then(newDeal => {
            resolve(newDeal)
        }).catch(err => {
            reject(err)   
        })
    })

}

