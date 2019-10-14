
fetch(`${SiteBaseURL}/index.json`)
  .then( response => response.json() )
  .then( object => object.documents )
  .then( initTimeline ) ;

const chronologically = ( a , b ) => a.begin - b.begin ;
const antichronologically = ( a , b ) => b.begin - a.begin ;

const DURATION_ONE_HOUR = 'PT1H' ;
const TIMEOUT_ONE_MINUTE = 60 * 1000 ;

function parseDuration ( str ) {

  // https://tools.ietf.org/html/rfc5545#section-3.3.6

  const multiplier = str[0] === '-' ? -1 : 1 ;
  let index = 0;
  let total = 0;
  let n = 0;


  if (str[0] === '-' || str[0] === '+') ++index;
  ++index; // P

  for ( ; index < str.length ; ++index ) {

    const c = str[index];

    if (c === 'T') {
      // TODO FIX currently no validation is done
    }

    else if ( '0' <= c && c <= '9' ) {
      n *= 10;
      n += (+c);
    }

    else {

      switch ( c ) {
        case 'W':
          n *= 7;
        case 'D':
          n *= 24;
        case 'H':
          n *= 60;
        case 'M':
          n *= 60;
        case 'S':
          n *= 1000;
      }

      total += n;
      n = 0;
    }

  }

  return multiplier * total ;

}

function initTimeline ( documents ) {

  const events = documents.filter(document => document.kind === 'page');

  for ( const event of events ) {
    event.begin = new Date(event.utc_begin);
    if ( event.utc_end ) {
      event.end = new Date(event.utc_end);
    }
    else {
      if ( !event.duration ) event.duration = DURATION_ONE_HOUR ;
      event.end = new Date(event.begin.getTime() + parseDuration(event.duration));
    }
  }

  events.sort(chronologically);

  refreshTimeline(events);
  window.setInterval(refreshTimeline, TIMEOUT_ONE_MINUTE, events);

}

function refreshTimeline ( events ) {

  console.debug("Refreshing timeline.");

  const now = new Date();
  const beginningOfToday = new Date((new Date(now)).setHours(0,0,0,0));
  const beginningOfTomorrow = new Date(beginningOfToday);
  beginningOfTomorrow.setDate(beginningOfToday.getDate() + 1);

  const happeningInTheFuture = event => event.begin > now ;
  const happeningInThePast = event => event.end < now ;
  const happeningToday = event => (event.begin < beginningOfTomorrow && beginningOfToday <= event.end);
  const happeningNow = event => event.begin < now && now < event.end ;

  const past = events.filter(happeningInThePast).sort(antichronologically);
  const future = events.filter(happeningInTheFuture);
  const today = events.filter(happeningToday);
  const current = events.filter(happeningNow);

  refreshContentTimeline(past,future,today,current);
  refreshSidenavTimeline(past,future,today,current);

}

function refreshContentTimeline ( past,future,today,current ) {

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

  const root = document.getElementById("timeline");

  if (root && root.innerHTML !== html) {
    root.innerHTML = html ;
  }

}

function refreshSidenavTimeline ( past,future,today,current ) {

  const collections = [ ] ;

  collections.push(sidenavCollection("Now", current));
  collections.push(sidenavCollection("Today", today));

  if ( future.length > 0 ) {
    if ( future.length > 1 ) {
      collections.push(sidenavCollection("Upcoming", future.slice(0,3)));
    }
    collections.push(sidenavCollection("Past", past.slice(0,3)));
  }

  const html = collections.join('');

  const root = document.getElementById("sidenav-timeline");

  if (root && root.innerHTML !== html) {
    root.innerHTML = html ;
  }

}

function sidenavCollection ( title , events ) {

  if (events.length === 0) return '';

  return (
    `<li class="timeline-item"><div class="divider"></div></li>
     <li class="timeline-item"><a class="subheader">${title}</a></li>
     ${events.map(itemLi).join('')}`
  ) ;

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

function itemLi ( event ) {

  return (
      `<li class="timeline-item">
        <a href="${event.link}">${event.title}</a>
      </li>`
  ) ;

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
