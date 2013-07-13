$('document').ready(function() {
	$('#test').text("Success");
	chrome.storage.local.get(null, function(items) { console.log(items); });
	alert("options.js called");
});