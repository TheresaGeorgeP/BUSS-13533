/**
 * Name : Customer SS.js
 * ID   : customscript25
 * Type : User Event
 *
 * Version      Date        Author          Remarks
 * V1.0.0		Unknown		Unknown			Initial Release
 * V1.0.1		04/12/2018	jatkinson		Exclude Ataata Implementation cases when identifying implementation case against
 * 											which the credential email is to be merged and attached.
 * V1.0.2		05/12/2018	awillisbrowne	NETEAM-1263 - Replace SPF address based on hosting jurisdiction
 * 				19/12/2018	awillisbrowne	NETEAM-1263 / 1348 - Add logic to accommodate empty hosting jurisdiction
 * V1.10		27/01/2020	jatkinson		BUSS-1178 Changes to accommodate SFDC deployment, along with refactoring.
 * V1.11		11/02/2020	jatkinson		BUSS-1298 Change to sourcing of order reseller fields to work around nlobjSearchColumn error for custentity6
 * V1.12        12/03/2020  lassaf          BUSS-1574 Adding Canada subsidiary
 * V1.13        25/02/2021  jatkinson       Removed now deprecated functionality folowng move to Service Cloud (SFDC)
 *
 */



function AfterSubmit (Type) {

	var userId = nlapiGetUser();
	if (userId != 2097780 && userId != 16060308) {

		var recordId = nlapiGetRecordId();
		if (Type != 'delete') {

			var originalCustomerRecord = nlapiGetOldRecord();
			var originalNewCustomerRecord = originalCustomerRecord.getFieldValue('custentitynewcustrecord');

			var editedCustomerRecord = nlapiGetNewRecord();
			var editedNewCustomerRecord = editedCustomerRecord.getFieldValue('custentitynewcustrecord');

			if (editedNewCustomerRecord && (editedNewCustomerRecord != originalNewCustomerRecord)) {

				reParentRPSRecords(recordId, editedNewCustomerRecord);

			}

		}

	}

}

// FIXME -- Consider re-factoring to Mimecast Account
function reParentRPSRecords (from, to) {

	try {

		var filter = new Array();
		filter[0] = new nlobjSearchFilter('custrecordrpsentity', null, 'is', from);
		var rpssearch = nlapiSearchRecord('customrecordrpsscreening', null, filter, null);
		for (var p = 0; rpssearch != null && p < rpssearch.length;p++) {

			nlapiSubmitField('customrecordrpsscreening', rpssearch[p].getId(), 'custrecordrpsentity', to, false);

		}
		nlapiSubmitField('customer', to, 'custentitychangeofinvoicingrecord', 'T', false);

	} catch (e) {

		nlapiLogExecution('ERROR', 'reParentRPSRecords', e);

	}

}

