exports.id = 'pgdbms';
exports.title = 'PG_DBMS';
exports.version = '0.1';
exports.group = 'Databases';
exports.author = 'Louis Bertson';
exports.color = '#7327F5';
exports.icon = 'database';
exports.input = true;
exports.output = 2;
exports.options = {};
exports.readme = `# DBMS database engine for PostgreSQL

## Outputs

First output is response from dbms engine and second is the data passed in.

## Collection

if the collection field is left empty, then we try to look at \`flowdata.get('collection')\`, to set this value you need to use \`flowdata.set('collection', '<collection-name>')\` in previous component (currently only \`function\` can be used)
## Insert
- will insert recieved data
- expects data to be an Object
- returns error, success, id
## Read
- will read a document by id
- expects data to be an Object with an \`id\` property
- returns error, response
## Update
- will update document by id
- expects data to be an Object with \`id\` property and all the props to be updated
- returns error, response
- if response is 0 then update failed
## Remove
- will remove document by id
- expects data to be an Object with an \`id\` property
- returns error, response
- if response is 0 then remove failed
## Query
- will query DB
- expects data to be an Array as shown bellow
- returns error, response
\`\`\`javascript
[
	['where', 'sensor', 'temp'], // builder.where('sensor', 'temp');
	['limit', 2]                 // builder.limit(2);
]
\`\`\``;

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="connexion" class="m mt10">PG connexion string</div>
	<div data-jc="textbox" data-jc-path="collection" class="m mt10">DB collection name</div>
	<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:insert,update,read,query,remove" class="m">@(Method)</div>
	<div data-jc="visible" data-jc-path="method" data-jc-config="if:value === 'insert'">
		<div data-jc="checkbox" data-jc-path="addid">Add unique ID to data before insert</div>
	</div>
	<div data-jc="visible" data-jc-path="method" data-jc-config="if:value === 'update'">
		<div data-jc="checkbox" data-jc-path="upsertid">Add unique ID to data before insert (only if it doesn't exist)</div>
	</div>
</div>`;

exports.install = function(instance) {
	instance.on('data', function(flowdata, next) {
		instance.send2(1, flowdata.clone());
		var options = instance.options;
		var connexion = options.connexion;
		if (!connexion){
			flowdata.data = {err: '[DB] No connexion string specified'};
			next(0,flowdata);
			instance.error('[DB] No connexion string specified');
			return
		}
		var collection = options.collection || flowdata.get('collection');
		if (!collection) {
			flowdata.data = { err: '[DB] No collection specified' };
			next(0, flowdata);
			instance.error('[DB] No collection specified');
			return;
		}
		require('dbms').init(connexion,ERROR('DBMS'));
		DBMS.measure && DBMS.measure(true);
		var dbms = DBMS();
		instance.status(dbms ? 'Conected' : 'Error', dbms ? 'green' : 'red');
		var builder;
		if (options.method === 'read') {
			console.log(flowdata.data);
			if (flowdata.data.params.id)
				flowdata.data.id = flowdata.data.params.id;
			if (!flowdata.data.id) {
				flowdata.data = { err: '[DB] Cannot get record by id: `undefined`' };
				next(0, flowdata);
				instance.error('[DB] Cannot get record by id: `undefined`');
				return;
			}
			builder = dbms.read(collection);
			builder.where('id', flowdata.data.id);
			builder.callback(function(err, response) {
				if (err) {
					instance.throw(err);
				} else {
					flowdata.data = { response: response };
					next(0, flowdata);
				}
			});
		} else if (options.method === 'insert') {
			options.addid && (flowdata.data.id = UID());
			dbms.add(collection,flowdata.data).callback(function(err) {
				if (err)
					instance.throw(err);
				else {
					flowdata.data = { success: err ? false : true, id: flowdata.data.id };
					next(0, flowdata);
				}
			});
		} else if (options.method === 'query') {
			var query = flowdata.data;
			builder = dbms.list(collection);
			query && query instanceof Array && query.forEach(function(q) {
				if (q instanceof Array) {
					var m = q[0];
					var args = q.splice(1);
					builder[m] && (builder[m].apply(builder, args));
				}
			});
			builder.callback(function(err, response) {
				if (err) {
					instance.throw(err);
				} else {
					flowdata.data = { response: response || [] };
					next(0, flowdata);
				}
			});
		} else if (options.method === 'update') {
			if (!options.upsert && !flowdata.data.id) {
				flowdata.data = { err: '[DB] Cannot update record by id: `undefined`' };
				next(0, flowdata);
				instance.error('[DB] Cannot update record by id: `undefined`');
				return;
			}
				if (options.upsertid && !flowdata.data.id) {
					flowdata.data.id = UID();
				builder = dbms.modify(collection, flowdata.data);
				builder.where('id', flowdata.data.id);
				builder.callback(function(err, count) {
					if (err)
						instance.throw(err);
					else {
						flowdata.data = { response: count || 0 };
						next(0, flowdata);
					}
				});
			}

		} else if (options.method === 'remove') {

			if (!flowdata.data.id) {
				flowdata.data = { err: '[DB] Cannot remove record by id: `undefined`' };
				next(0, flowdata);
				instance.error('[DB] Cannot remove record by id: `undefined`');
				return;
			}

			builder = dbms.remove(collection);
			builder.where('id', flowdata.data.id);
			builder.callback(function(err, count) {
				if (err)
					instance.throw(err);
				else {
					flowdata.data = { response: count || 0 };
					next(0, flowdata);
				}
			});
		}

	});
};
