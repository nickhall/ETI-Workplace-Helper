 //example of using a message handler from the inject scripts
 chrome.extension.onMessage.addListener(
   function(request, sender, sendResponse) {
   	chrome.pageAction.show(sender.tab.id);
     sendResponse();
 });


// Local storage saves these:
// bool avatars: True displays avatars
// bool nws: True allows NWS links to be clicked and opened
// string nwsColor: Saves the color of NWS links
// bool nwsChangeColor: True enables the changing of NWS link color
// string rowColor: Saves the color for table row hover
// bool rowChangeColor: True enables the row hover color change

chrome.storage.local.get(null, function(items) {
	if (items['avatars'] === undefined)
	{
		chrome.storage.local.set({'avatars': true});
		console.log("Defaulted avatar display to true");
	}

	if (items["nws"] === undefined)
	{
		console.log("Defaulting NWS allowance to true");
		chrome.storage.local.set({"nws": true});
	}

	if (items["nwsColor"] === undefined)
	{
		console.log("Defaulting NWS color to gray");
		chrome.storage.local.set({"nwsColor": "gray"}, function() {});
	}

	if (items["nwsChangeColor"] === undefined)
	{
		console.log("Defaulting NWS color change to true");
		chrome.storage.local.set({"nwsChangeColor": true}, function() {});
	}

	if (items["rowColor"] === undefined)
	{
		console.log("Defaulting row highlight color to #EAF2FF");
		chrome.storage.local.set({"rowColor": "#EAF2FF"}, function() {});
	}

	if (items["rowChangeColor"] === undefined)
	{
		console.log("Defaulting row color change to true");
		chrome.storage.local.set({"rowChangeColor": true}, function() {});
	}
});