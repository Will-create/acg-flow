exports.version = '0.0.1';				// the component version
exports.dateupdated = '2019-05-12';		// the version date (format: 'yyyy-MM-dd HH:mm')
exports.id = 'xpathscraper';		// the component id
exports.title = 'Scrape with xPath';				// the human readable block
exports.color = '#E84FF7';				// the color of the block
exports.click = true;					//
exports.input = ['#FFFD54', '#68B25B'];		// color of inputs, will be 2 inputs
exports.output = ['#041EF5'];				// color of outputs, will have 1 output
exports.group = 'ACG DEVS';			// The group name
exports.author = 'Louis Bertson';		// The author
exports.icon = 'commenting-o';			// The visible icon
exports.status = '';					// the status text
exports.npm = ['xpath','jsdom'];						// npm dependencies
exports.input = true;
exports.output = 2;
exports.cloning = false;				// Disables data cloning
exports.traffic = false;				// hides stats under component box in designer UI
exports.options = { };					// pre defined options

exports.install = function(component) {

	var xpath= require('xpath');
	var jsdom = require("jsdom");
    var txt = '';

	component.on('data', function(flowdata,next) {
		var pageurl = component.options.pageurl;
		var selector = component.options.selector;
		if ( pageurl && selector) {
			//request status of phone

				 RESTBuilder.GET(pageurl).callback(function(err,response,output) {
					if(err)
						return

					 var res =new JSDOM(output.response);

					  txt = xpath.select(selector, res).toString()
					 console.log('Fichier text from xpath'+txt);
					 component.send2(0,txt);

			})
		}
	});
};

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="pageurl" data-jc-config="type:string;required:true">@(URL of the Page)</div>
	<div data-jc="textbox" data-jc-path="selector" data-jc-config="type:string;required:true">@(CSS selector)</div>
</div>`;