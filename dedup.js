const fs = require('fs');
const DedupLeads = require('./js/dedup_leads').dedupLeads;

const run = () => {
	// get file names
	const files = [];
	process.argv.forEach(val => {
	  if (val.indexOf('.json') !== -1) {
	  	files.push(val);
	  }
	});

	files.forEach(file => {
	  const text = JSON.parse(fs.readFileSync(file).toString());
	  const  { leads } = text;
	  const fileName = file.split('.json')[0];
		const dedupedSet = new DedupLeads(leads, fileName);
	});
};

run();
