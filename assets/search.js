var ICONS = {
    'collection': 'class' ,
    'item' : 'notes' ,
    'author': 'face' ,
    'speaker': 'face' ,
    'tag' : 'label' ,
} ;

var searchTimeout = undefined;

function statusAndDate ( date , status ) {
    if (status === "CANCELLED") return `<s>${date}</s><span class="red-text"> (CANCELLED)</span>` ;
    else if (status === "TENTATIVE") return `${date}<span class="orange-text"> (TENTATIVE DATE AND TIME)</span>`;
    return date;
}

function getKind ( url ) {
    const parts = url.slice(1,-1).split('/');

    if (parts.length === 1) return 'collection' ;

    if (parts[0] === 'authors') return 'author' ;
    if (parts[0] === 'speakers') return 'speaker' ;
    if (parts[0] === 'tags') return 'tag' ;

    return 'item' ;
}

function matchToHTML ( match ) {
	const href = match.document.link;
	const title = `${decodeURI(match.document.link)} - ${match.document.title} (${match.result.score.toFixed(3)})`;
	const subtitle = match.document.date ? statusAndDate(match.document.date, match.document.status) : '';
	const text = match.document.summary;
	const kind = getKind(match.document.link);
	const icon = ICONS[kind];
	let avatar = `<i class="material-icons circle">${icon}</i>` ;
	const thumbnail = match.document.thumbnail;
	if ( thumbnail ) {
		avatar = `<img src="${thumbnail.src}" alt="${thumbnail.caption || ''}" class="circle">` ;
	}
	return `<li class="collection-item avatar" onClick="window.location.href='${href}'">
	  ${avatar}
	  <span class="title">${title}</span>
	  <p>${subtitle}</p>
	  <div class="hide-on-small-only">${text}</div>
	  <span class="secondary-content"><i class="material-icons">${icon}</i></span>
	</li>`;
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
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
		const queryString = event.target.value;
		searchWorker.postMessage(queryString);
		searchTimeout = setTimeout(function () {
		    resultHTML = `<li class="collection-item">Searching is taking longer than expected ...</li>`;
		    results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;
		}, 1000);
	};

	const onFocusIn = function () {
		document.body.classList.add('searching');
	} ;

	const onFocusOut = function () {
		document.body.classList.remove('searching');
	} ;

	const gobble = function (event) {
	    event.stopPropagation();
	} ;

	search.addEventListener('input', onInput);
	search.addEventListener('focusin', onFocusIn);
	search.addEventListener('click', gobble);
	document.body.addEventListener('click', onFocusOut);

	searchWorker.onmessage = function(e) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
		var data = e.data;
		var state = data.state;
		var error = data.error;
		var matches = data.matches;
		if ( state === 'loading') {
			resultHTML = `<li class="collection-item">Worker is generating an index</li>`;
		}
		else if ( state === 'ready') {
			resultHTML = `<li class="collection-item">Type to start searching</li>`;
		}
		else if (error) {
			resultHTML = `<li class="collection-item">lunr.js error: ${error.message}</li>`;
		}
		else if (matches.length === 0) {
			resultHTML = `<li class="collection-item">Nothing matches the query</li>`;
		}
		else {
			resultHTML = matches.map(matchToHTML).join('');
		}

		results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;

		if (renderMathInElement) renderMathInElement(results);

	}

	// Configure search button to show and focus search input
	const searchButton = document.getElementById('search-button');
	const onClick = function (event) {
		event.stopPropagation();
		document.body.classList.add('searched-at-least-once');
		window.scrollTo(0, 0);
		search.focus();
	} ;
	searchButton.addEventListener('click', onClick);

	resultHTML = `<li class="collection-item">Connecting to worker...</li>`;
	results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;

	// Notify page that search is ready
	document.body.classList.add('searching-initialized');

}

measure("Initializing searching feature", function () {initSearch();});
