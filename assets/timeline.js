
fetch(`${SiteBaseURL}/index.json`)
  .then( response => response.json() )
  .then( object => object.documents )
  .then( initTimeline ) ;

const chronologically = ( a , b ) => a.begin - b.begin ;
const antichronologically = ( a , b ) => b.begin - a.begin ;

function initTimeline ( documents ) {

  const events = documents.filter(document => document.kind === 'page');

  for ( const event of events ) {
    event.begin = new Date(event.utc);
    event.end = new Date(event.begin.getTime() + 60 * 60);
  }

  events.sort(chronologically);

  refreshTimeline(events);
}

function refreshTimeline ( events ) {

  const now = new Date();

  const happeningInTheFuture = event => event.begin > now ;
  const happeningInThePast = event => event.end < now ;
  const happeningToday = event => false ;
  const happeningNow = event => event.begin < now && now < event.end ;

  const past = events.filter(happeningInThePast).sort(antichronologically);
  const future = events.filter(happeningInTheFuture);
  const today = events.filter(happeningToday);
  const current = events.filter(happeningNow);

  const collections = [ ] ;

  collections.push(collection("Now", current));
  collections.push(collection("Today", today));

  if ( future.length > 0 ) {
    if ( future.length > 1 ) {
      collections.push(collection("Upcoming", future.slice(0,3)));
    }
    collections.push(collection("Past", past.slice(0,3)));
  }

  const html = collections.join('');

  console.dir(html);

  document.getElementById("timeline").innerHTML = html ;

}

function itemCard ( event ) {
  return (
    `<div class="col s12">
      <div class="card">
	<div class="card-image">
	  ${event.thumbnail ? `<img src=${event.thumbnail.src} alt=${event.thumbnail.caption}>` : ''}
	</div>
	<div class="card-content">
	  <span class="card-title">${event.title}</span>
	  <span class="card-subtitle">${event.date}</span>
	</div>
	<div class="card-action">
	  <a href=${event.link}>Read more</a>
	</div>
      </div>
    </div>`
  );
}

function collection ( title , events ) {

  if (events.length === 0) return '';

  return (
    `<h4>${title}</h4>
    <div class="row">
      ${events.map(itemCard).join('')}
    </div>`
  ) ;

}
