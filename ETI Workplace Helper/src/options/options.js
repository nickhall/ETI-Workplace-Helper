$('document').ready(function() {
	chrome.storage.local.get(null, loadOptions);
	$('#save').click(saveOptions);
	$('#clear').click(clearLinks);
	$('#reset').click(resetColors);
});

function saveOptions()
{
	chrome.storage.local.set({'nwsChangeColor': $('#nws-checkbox').is(':checked'), 'rowChangeColor': $('#row-checkbox').is(':checked'), 'nwsColor': $('#nws-color-text').val(), 'rowColor': $('#row-color-text').val()},
		function()
		{
			alert("Settings successfully saved");
		});
}

function loadOptions(items)
{
	if (items['nwsChangeColor'] === true)
	{
		$('#nws-checkbox').prop('checked', true);
	}
	if (items['rowChangeColor'] === true)
	{
		$('#row-checkbox').prop('checked', true);
	}

	$('#nws-color-text').val(items['nwsColor']);
	$('#row-color-text').val(items['rowColor']);
}

function clearLinks()
{
	chrome.storage.sync.set({'saved': {}}, function() { alert('Saved links cleared'); });
}

function resetColors()
{
	$('#nws-color-text').val('gray');
	$('#row-color-text').val('#EAF2FF');
}