const ICONS = {
	'collection': 'class' ,
	'item' : 'notes' ,
	'author': 'face' ,
	'speaker': 'face' ,
	'tag' : 'label' ,
} ;

const statusAndDate = ( date , status ) => {
	if (status === "CANCELLED") return `<s>${date}</s><span class="red-text"> (CANCELLED)</span>` ;
	else if (status === "TENTATIVE") return `${date}<span class="orange-text"> (TENTATIVE DATE AND TIME)</span>`;
	else if (status === "CONFIRMED") return `${date}<span class="green-text"> (CONFIRMED)</span>`;
	return date;
}

const BEGIN_PATH = SiteBaseURL.split('/').slice(3).join('/').length + 1;

const getKind = ( url ) => {

	const parts = url.slice(BEGIN_PATH,-1).split('/');

	if (parts.length === 1) return 'collection' ;

	if (parts[0] === 'authors') return 'author' ;
	if (parts[0] === 'speakers') return 'speaker' ;
	if (parts[0] === 'tags') return 'tag' ;

	return 'item' ;
}

const matchToHTML = ( match ) => {
	const href = match.document.link;
	const title = `${match.document.title} (${match.result.score.toFixed(3)})`;
	const url = `${decodeURI(match.document.link)}`;
	const subtitle = match.document.date ? statusAndDate(match.document.date, match.document.status) : '';
	const text = match.document.summary || '';
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
		<p>${subtitle}<br>${url}</p>
		<div class="hide-on-small-only">${text}</div>
		<span class="secondary-content"><i class="material-icons">${icon}</i></span>
	</li>`;
}

const measure = ( what , callback ) => {
	const t0 = performance.now();
	const output = callback();
	const t1 = performance.now();
	console.debug( what + " took " + (t1 - t0) + " milliseconds.");
	return output;
}

const search = document.getElementById('search');
const results = document.getElementById('search-results');
const searchButton = document.getElementById('search-button');

let searchTimeout;
let searchWorker;

const query = ( queryString ) => {
	if (!searchWorker) {
		resultHTML = `<li class="collection-item">Connecting to worker...</li>`;
		results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;
		searchWorker = new Worker(`${SiteBaseURL}/searchWorker.js`);
		searchWorker.onmessage = (e) => {
			clearTimeout(searchTimeout);
			searchTimeout = undefined;
			const data = e.data;
			const state = data.state;
			const error = data.error;
			const matches = data.matches;
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
	}
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		resultHTML = `<li class="collection-item">Search is taking longer than expected ...</li>`;
		results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;
	}, 1000);
	return searchWorker.postMessage(queryString);
}

const initSearch = ( ) => {

	resultHTML = `<li class="collection-item">Type something to initiate a search...</li>`;
	results.innerHTML = '<ul class="collection">' + resultHTML + '</ul>' ;

	const onInput = (event) => {
		query(event.target.value);
	};

	const onFocusIn = () => {
		document.body.classList.add('searching');
	} ;

	const onFocusOut = () => {
		document.body.classList.remove('searching');
	} ;

	const gobble = (event) => {
		event.stopPropagation();
	} ;

	search.addEventListener('input', onInput);
	search.addEventListener('focusin', onFocusIn);
	search.addEventListener('click', gobble);
	document.body.addEventListener('click', onFocusOut);

}

let searchInputInitialized = false;
const ensureSearchFeature = () => {
	if (searchInputInitialized) return;
	searchInputInitialized = true;
	measure("Initializing searching feature", initSearch);
}

const initSearchButton = ( ) => {

	// Configure search button to show and focus search input
	const onClick = (event) => {
		event.stopPropagation();
		ensureSearchFeature();
		document.body.classList.add('searched-at-least-once');
		window.scrollTo(0, 0);
		search.focus();
	} ;
	searchButton.addEventListener('click', onClick);

	// Notify page that search is ready
	document.body.classList.add('searching-initialized');

}

measure("Initializing searching button", initSearchButton);
