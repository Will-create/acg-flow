exports.version = '0.0.1';				// the component version
exports.dateupdated = '2019-05-12';		// the version date (format: 'yyyy-MM-dd HH:mm')
exports.id = 'google';		// the component id
exports.title = 'Google SEARCH';				// the human readable block
exports.color = '#343CF5';				// the color of the block
exports.click = true;					//
exports.input = ['#FFFD54', '#68B25B'];		// color of inputs, will be 2 inputs
exports.output = ['#041EF5'];				// color of outputs, will have 1 output
exports.group = 'ACG DEVS';			// The group name
exports.author = 'Louis Bertson';		// The author
exports.icon = 'commenting-o';			// The visible icon
exports.status = '';					// the status text
exports.npm = ['google-it'];						// npm dependencies
exports.input = true;
exports.output = 2;
exports.cloning = false;				// Disables data cloning
exports.traffic = false;				// hides stats under component box in designer UI
exports.options = { };					// pre defined options

exports.install = function(component) {

	var google= require('google-it');
	var links = [];
	google.resultsPerPage = 5;
    google.lang = 'fr';
	component.on('data', function(flowdata,next) {
		var keyword = flowdata.data;
		var expectation = component.options.expectation;
		if ( keyword ) {
			//search on google search bar
			google({query : keyword}).then(function(res){
				flowdata.data = res.links;
				MAIN.google =links = res;
				next(0, links);
			})
		}
	});
};
exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="expectation" data-jc-config="type:string">@(Expectation)</div>
</div>`;