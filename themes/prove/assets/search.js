function matchToHTML ( match ) {
	const href = match.document.link;
	const text = `${match.document.link} - ${match.document.title} (${match.result.score})`;
	return `<a class="collection-item" href="${href}">${text}</a>`;
}

function measure ( what , callback ) {

	var t0 = performance.now();
	var output = callback();
	var t1 = performance.now();
	console.debug( what + " took " + (t1 - t0) + " milliseconds.");
	return output;

}

function initSearch ( ) {

	var searchWorker = new Worker('/searchWorker.js');

	const search = document.getElementById('search');
	const results = document.getElementById('search-results');
	const onInput = function (event) {
		const queryString = event.target.value;
		searchWorker.postMessage(queryString);
	};

	const onFocusIn = function () {
		document.body.classList.add('searching');
	} ;

	const onFocusOut = function () {
		document.body.classList.remove('searching');
	} ;

	search.addEventListener('input', onInput);
	search.addEventListener('focusin', onFocusIn);
	search.addEventListener('focusout', onFocusOut);

	searchWorker.onmessage = function(e) {
		var matches = e.data;
		if (matches.length === 0) {
			resultHTML = `<a class="collection-item">No search results found</a>`;
		}
		else {
			resultHTML = matches.map(matchToHTML).join('');
		}

		results.innerHTML = '<div class="collection">' + resultHTML + '</div>' ;
	}

	// Configure search button to show and focus search input
	const searchButton = document.getElementById('search-button');
	const onClick = function () {
		document.body.classList.add('searched-at-least-once');
		window.scrollTo(0, 0);
		search.focus();
	} ;
	searchButton.addEventListener('click', onClick);

	// Notify page that search is ready
	document.body.classList.add('searching-initialized');

}

measure("Initializing searching feature", function () {initSearch();});
