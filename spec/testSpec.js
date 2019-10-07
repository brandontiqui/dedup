const DedupLeads = require('../js/dedup_leads').dedupLeads;
const fs = require('fs');
const path = require('path');

describe('Dedup Leads', function(){
    let dedupedSet;

    beforeEach(function(){
        const jsonPath = path.join(__dirname, '..', 'input.json');
        const text = JSON.parse(fs.readFileSync(jsonPath).toString());
        const  { leads } = text;
        const fileName = 'input';
        dedupedSet = new DedupLeads(leads, fileName);
    });

    it('Should have the correct number of leads', function(){
        const result = dedupedSet.getLeadsCount();
        expect(result).toBe(10);
    });

    it('Should have the correct number of leads after deduplication', function(){
        const result = dedupedSet.getDedupedLeads().length;
        expect(result).toBe(4);
    });

    it('Should have unique ids after deduplication', function(){
        let result = dedupedSet.getDedupedLeads();
        let foundDuplicateId = false;
        const idsSeen = {};
        result.some(lead => {
            const leadId = lead._id;
            if (idsSeen[leadId]) {
                foundDuplicateId = true;
                return true;
            } else {
                idsSeen[leadId] = true;
            }
        });

        expect(foundDuplicateId).toBe(false);
    });

    it('Should have unique emails after deduplication', function(){
        let result = dedupedSet.getDedupedLeads();
        let foundDuplicateEmail = false;
        const emailsSeen = {};
        result.some(lead => {
            const leadEmail = lead.email;
            if (emailsSeen[leadEmail]) {
                foundDuplicateEmail = true;
                return true;
            } else {
                emailsSeen[leadEmail] = true;
            }
        });

        expect(foundDuplicateEmail).toBe(false);
    });
});