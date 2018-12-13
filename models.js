var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = function()
{
	var UserSchema = new Schema({
		name : {type: String, required: true},
		exercises: [{
			description: String,
			duration: String,
			date: Date
		}]
	});

	var User = mongoose.model('Users', UserSchema);
	return {user: User};
}