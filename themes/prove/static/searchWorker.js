importScripts('/vendor/lunr.min.js');
importScripts('/lunrConfig.js');

var debug = function () {
  if (lunrConfig.debug) console.debug.apply(console, arguments);
} ;

debug("lunrConfig", lunrConfig);
debug("lunrPlugins", lunrPlugins);

self.index = null;
self.pendingQuery = '';

function measure ( what , callback ) {

    debug( what + " started.");
	var t0 = performance.now();
	var output = callback();
	var t1 = performance.now();
	console.log( what + " took " + (t1 - t0) + " milliseconds.");
	return output;

}


function executeQuery ( index , queryString ) {
    let resultHTML;
    try {

        //const results = self.index.search(queryString);
        const results = measure("Search", function(){return index.search(queryString);});
        const matches = results
          .slice(0,lunrConfig.limit)
          .map(result => (
            {
                "result": result,
                "document": self.documents[result.ref],
            }
        ));

        postMessage(matches);

    }
    catch ( err ) {
        console.error(err);
        postMessage([]);
    }
}

function initWorker ( documents ) {

    self.documents = documents;

	debug("Documents", self.documents);

	self.index = lunr(function () {
		lunrPlugins.forEach(function (plugin) { this.use(plugin) }, this) ;
		self.documents.forEach(function (doc) { this.add(doc) }, this) ;
	}) ;

	debug("Index", self.index);

    if (self.pendingQuery) executeQuery(self.index, self.pendingQuery);

}

fetch('/index.json')
	.then( response => response.json() )
	.then( object => object.documents )
	.then( documents => {
		measure("Initializing search worker", function () {initWorker(documents);});
	});

onmessage = function (event) {
    debug('Worker: Message received from main script:', event.data);
    const queryString = event.data;

    if ( self.index ) executeQuery(self.index, queryString);
    else self.pendingQuery = queryString;
};
