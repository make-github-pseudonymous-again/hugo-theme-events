var lunrConfig = {
	"limit": 5,
} ;

var lunrPlugins = [
	function () {
		this.ref('id');
		this.field('link');
		this.field('title');
		this.field('content');
		this.field('summary');
		this.field('status');
		this.field('authors');
		this.field('tags');
	}
] ;
