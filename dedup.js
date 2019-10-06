const fs = require('fs');

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
	});
};

run();
