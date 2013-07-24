$('document').ready(function() {
	chrome.storage.local.get(null, loadOptions);
});

function saveOptions()
{
	//
}

function loadOptions(items)
{
	console.log('Loading options: ' + items['nws']);
}

function clearLinks()
{
	//
}