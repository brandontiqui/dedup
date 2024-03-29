const fs = require('fs');

class DedupLeads {
	constructor(leads, fileName) {
		this.leads = leads;
    this.fileName = fileName;
		this.sortDataSet();
		this.deduplicate();
		this.generateOutputFile();
		this.generateOutputFile({includeLogs: true});
	}

	getLeads() {
		return this.leads;
	}

	getDedupedLeads(includeLogs) {
		if (includeLogs) {
			return this.leads;
		} else {
			return this.leads
			  .filter(lead => !lead.isDuplicate)
			  .map(lead => ({
			  	_id: lead._id,
			  	email: lead.email,
			  	firstName: lead.firstName,
			  	lastName: lead.lastName,
			  	address: lead.address,
			  	entryDate: lead.entryDate
			  }));
		}
	}

	generateOutputFile({includeLogs} = {}) {
		const timestamp = new Date().toISOString();
		let dedupedLeads;
		if (includeLogs) {
			dedupedLeads = this.getDedupedLeads(includeLogs);
		} else {
			dedupedLeads = this.getDedupedLeads();
		}
		const data = {
			leads: dedupedLeads
		};
		const outputFileName = includeLogs ? `${this.fileName}_with_logs` : this.fileName;
		fs.writeFileSync(`./output_files/${outputFileName}_${timestamp}.json`, JSON.stringify(data, null, 2));
	};

  getLeadsCount() {
    return this.leads.length;
  }

  getFieldChanges(keptObj, removedObj) {
    const keysToCheck = ['_id', 'email', 'firstName', 'lastName', 'address', 'entryDate'];
    const fieldChanges = [];
    keysToCheck.forEach((key) => {
      if (keptObj[key] !== removedObj[key]) {
        fieldChanges.push({
          field: key,
          valueFrom: removedObj[key],
          valueTo: keptObj[key]
        });
      }
    });
    return fieldChanges;
  }

  sortDataSet() {
  	const compareDates = (a, b) => {
  	  let comparison = 0;
      const dateA = new Date(a.entryDate);
      const dateB = new Date(b.entryDate);
      if (dateA > dateB) {
  	    comparison = -1;
      } else if (dateA < dateB) {
      	comparison = 1;
      }
  	  return comparison;
  	};

    return this.leads
      .sort(compareDates);
  }

  deduplicate() {
  	//sort by date desc
  	const sortedList = this.leads;
  	  // track id's and emails seen as the key, value is the index of master object
  	const seenIdsAndEmails = {};
  	// iterate over list
  	sortedList.forEach((masterLead, masterLeadIndex) => {
  		const masterLeadEmail = masterLead.email.toLowerCase();

  	  // if labeled as duplicate continue
  	  if (masterLead.isDuplicate) return;

  	  // set associatedKeys prop on master obj
  	  masterLead.associatedKeys = {
  	  	[masterLead._id]: true,
  	  	[masterLeadEmail]: true
  	  };

  	  masterLead.logs = [];

  	  // current lead index is master
  	  // iterate over rest of leads
  	  for (let currentLeadIndex = masterLeadIndex + 1; currentLeadIndex < sortedList.length; currentLeadIndex++) {
  	  	const currentLead = sortedList[currentLeadIndex];
  	    // if already labeled isDuplicate, continue
  	    if (currentLead.isDuplicate) continue;
  			const currentLeadEmail = currentLead.email.toLowerCase();

  	    // if new duplicate
  	    if (masterLead.associatedKeys[currentLead._id] ||
  	    	masterLead.associatedKeys[currentLeadEmail]) {
  	    	masterLead.hasDuplicates = true;
  	      // record lead id and email in master obj
  	    	masterLead.associatedKeys[currentLead._id] = true;
  	    	masterLead.associatedKeys[currentLeadEmail] = true;
  	      // label as duplicate
  	      currentLead.isDuplicate = true;
  	    }
  	  }

  	  // if there are duplicates for master obj
  	  if (masterLead.hasDuplicates) {
  		  // iterate over rest of leads
  		  for (let currentLeadIndex = masterLeadIndex + 1; currentLeadIndex < sortedList.length; currentLeadIndex++) {
  		  	const currentLead = sortedList[currentLeadIndex];
  				const currentLeadEmail = currentLead.email.toLowerCase();
  		    // if key is a match
  		    if (masterLead.associatedKeys[currentLead._id] ||
  		    	masterLead.associatedKeys[currentLeadEmail]) {
  		    	let keptLeadObj = Object.assign({}, masterLead);
  		    	// remove other props
  		    	if (masterLead.logs.length !== 0) {
              keptLeadObj = Object.assign({}, masterLead.logs[masterLead.logs.length - 1]).kept;
  		    	}

            const fieldChanges = this.getFieldChanges(keptLeadObj, currentLead);

  		    	delete keptLeadObj.logs;

  		      // log current lead obj
  		      const logRecord = {
              fieldChanges: fieldChanges,
  		      	removed: currentLead,
              kept: keptLeadObj
  		      };
  		      // label as duplicate
  		      currentLead.isDuplicate = true;
  		    	masterLead.logs.push(logRecord);
  		    }
  		  }
  	  }
  	})
  }
};

module.exports = {
  dedupLeads: DedupLeads
};
