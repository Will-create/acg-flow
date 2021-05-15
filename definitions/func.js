const {v4 : uuid4 } = require('uuid');
DEF.helpers.uuid = function(){
	return uuid4();
};