var ICONS = {
    'collection': 'class' ,
    'item' : 'notes' ,
    'author': 'face' ,
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
    if (parts[0] === 'tags') return 'tag' ;

    return 'item' ;
}

function matchToHTML ( match ) {
	const href = match.document.link;
	const title = `${match.document.link} - ${match.document.title} (${match.result.score})`;
	const subtitle = match.document.date ? statusAndDate(match.document.date, match.document.status) : '';
	const text = match.document.summary;
	const kind = getKind(match.document.link);
	const icon = ICONS[kind];
	let avatar = `<i class="material-icons circle">${icon}</i>` ;
	const thumbnail = match.document.thumbnail;
	if ( thumbnail ) {
		avatar = `<img src="${thumbnail.src}" alt="${thumbnail.caption}" class="circle">` ;
	}
	return `<a class="collection-item avatar" href="${href}">
	  ${avatar}
	  <span class="title">${title}</span>
	  <p>${subtitle}${text ? '<br>'+text : ''}</p>
	  <span class="secondary-content"><i class="material-icons">${icon}</i></span>
	</a>`;
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
		    resultHTML = `<a class="collection-item">Searching is taking longer than expected ...</a>`;
		    results.innerHTML = '<div class="collection">' + resultHTML + '</div>' ;
		}, 1000);
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
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
		var matches = e.data;
		if (matches.length === 0) {
			resultHTML = `<a class="collection-item">No search results found</a>`;
		}
		else {
			resultHTML = matches.map(matchToHTML).join('');
		}

		results.innerHTML = '<div class="collection">' + resultHTML + '</div>' ;

		if (renderMathInElement) renderMathInElement(results);

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
