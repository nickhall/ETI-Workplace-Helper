$(document).ready(function() {

	// ----------------------------------------------------------
	// This part of the script triggers when page is done loading
	console.log("Running injected script...");
	// ----------------------------------------------------------

	// Initial DOM modification
	// Only affects topic list
	$(".fl a").after(' <a href="#" class="appended">Save</a>');
	$(".appended").each(function() {
		this.id = $(this).prev().attr("href").split("=")[1];
	});
	$(".appended").hide();
	$(".appended").on("click", saveLink);

	// Add link to menu bar (all pages)
	$(".userbar a").filter(function(index) { return $(this).text() === "Help"; }).after(' | <a href="#" id="poll-show">Today\'s Poll</a> | <a href="#" class="saved-show">Saved Topics</a> | <a href="#" id="avatar-toggle">Avatars On</a> | <a href="#" id="nws-toggle">NWS On</a>');

	// Add div after userubar
	$(".userbar").after('<div id="saved-topics"><h3>Saved Topics</h3><ul></ul><a href="#" class="saved-show">Close</a></div>');
	$('#saved-topics').hide();

	$(".userbar").after('<div id="poll-div">Placeholder</div>');
	$('#poll-div').hide();

	// Add event handlers (might change this to click() later but w/e)
	$(".saved-show").on("click", toggleMenu);
	$("#poll-show").on("click", togglePoll);
	$("#avatar-toggle").on("click", toggleAvatars);
	$('#nws-toggle').on("click", function(){ allowNWS = !allowNWS; allowNWS ? $(this).text("NWS On") : $(this).text("NWS Off"); chrome.storage.local.set({'nws': allowNWS}); });
	
	// Disable NWS links (topic list only)
	$(".fr:contains('NWS')").closest("td").children(".fl").children("a").not(".appended").on("click",
		function(e)
		{
        	if (!allowNWS)
            {
            e.preventDefault();
            }
        });

	// Storage operations
	var savedTopics = {};
	var showAvatars = true;
	var allowNWS    = true;
	chrome.storage.sync.get("saved", loadNetworkStorage);
	chrome.storage.local.get(null, loadLocalSettings);

	// Mutation observers are event listeners that fire on DOM change
	// Covers both Firefox and Chrome implementations of MutationObserver
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutations, observer)
	{
		if (showAvatars === false)
		{
			mutations.forEach(function(mutation) {
	   		for (var i = 0; i < mutation.addedNodes.length; i++)
	   		{
		 		if ($(mutation.addedNodes[i]).has('.userpic-holder').length === 1)
		 		{
					$('.userpic-holder').hide();
					console.log("New avatars hidden");
				}
			}
			});
		}
	});

	observer.observe(document, { subtree: true,	childList: true	});

	// Logic
	function toggleMenu(e)
	{
		e.preventDefault();
		$("#saved-topics").is(':visible') ? $("#saved-topics").slideUp('fast', function(){}) : $("#saved-topics").slideDown('fast', function(){});
	}

	function togglePoll(e)
	{
		e.preventDefault();
		if ($("#poll-div").is(':visible'))
			{
				$("#poll-div").slideUp('fast', function(){});
			}
			else
			{
				//rebuildPoll(function() { $("#poll-div").slideDown('fast', function(){}); });
				rebuildPoll(function(){});
				$("#poll-div").text("Loading...");
				$("#poll-div").slideDown('fast', function(){});
			}
	}

	function rebuildPoll(callback)
	{
		var poll = "Loading...";
		$.get("//endoftheinter.net/main.php", function(data)
			{
				poll = $(data).find(".poll")[0].innerHTML;
				var pollDiv = $("#poll-div");
				pollDiv.hide();
				pollDiv.html(poll);
				pollDiv.slideDown('fast', function(){});
				console.log("Successfully scraped poll data.");

				// Adjust URLs so they call the correct domain
				$("#poll-div form").attr('action', '//endoftheinter.net/poll.php');
				$("#poll-div form a").each(function(index, value)
				{
					var newTarget = $(this).attr('href');
					$(this).attr('href', '//endoftheinter.net/' + newTarget);
				});
				//$("#poll-div a").last().after(' | <a href="#" id="close-poll">Close Poll</a>')
				callback();
			});
	}

	function rebuildList()
	{
		$('#saved-topics ul').empty();
		for (var key in savedTopics)
		{
			if (savedTopics.hasOwnProperty(key))
			{
				$('#saved-topics ul').append('<li><a href="//boards.endoftheinter.net/showmessages.php?topic='+key+'">'+savedTopics[key]+'</a> <a href="#" class="saved-appended">x</a></li>');
			}
		}

		$(".saved-appended").on("click", saveLink);

		console.log('Rebuilt saved topic list');
	}

	// Local storage includes NWS ad avatar settings
	function loadLocalSettings(items)
	{
		showAvatars = items["avatars"];
		if (showAvatars === false)
			$('.userpic-holder').hide();
		console.log("Loaded avatar settings from local storage: " + showAvatars);
		updateAvatarText();

		if (showAvatars === true)
		{
			$('.userpic-holder').show();
		}

		allowNWS = items["nws"];
		allowNWS ? $('#nws-toggle').text("NWS On") : $('#nws-toggle').text("NWS Off");
		console.log("Loaded nws settings from local storage: " + allowNWS);

		var nwsColor = items['nwsColor'];
		console.log("Loaded NWS link color settings from local storage: " + nwsColor);

		var nwsChangeColor = items['nwsChangeColor'];
		if (nwsChangeColor === true)
		{
			$(".fr:contains('NWS')").closest("td").children(".fl").children("a").not(".appended").css('color', nwsColor);
		}

		var rowColor = items['rowColor'];
		console.log("Loaded row color settings from local storage: " + rowColor);
		
		var rowChangeColor = items['rowChangeColor'];
		if (rowChangeColor === true)
		{
			$(".grid tr td").hover(
				function()
				{
					$(this).closest("tr").children("td").css("background-color", rowColor);
					$(this).find(".appended").show();
				},
				function()
				{
					$(this).closest("tr").children("td").css("background-color", "");
					$(this).find(".appended").hide();
				}
			);
		}
		
	}

	// Network storage only has saved topics
	function loadNetworkStorage(items)
	{
		if (items["saved"] !== undefined)
		{
			savedTopics = items["saved"];
			console.log("Loaded saved topics from network storage");
		}
		updateLinks();
		rebuildList();
	}

	function saveLink(e)
	{
		e.preventDefault();
		var linkID = $(this).prev().attr("href").split("=")[1];
		if (savedTopics.hasOwnProperty(linkID))
		{
			delete savedTopics[linkID];
			console.log('Deleted link ' + linkID);
		}
		else
		{
			var linkText = $(this).prev().text();
			savedTopics[linkID] = linkText;
			console.log('Saved link ID ' + linkID + ' with title ' + linkText);
		}
		chrome.storage.sync.set({"saved": savedTopics}, function()
		{
			console.log("Saved modified link list to network storage");
			rebuildList();
		});
		updateLinks();
	}

	// Links here refers to all links that were dynamically added by the script either in the topic list or saved link list
	function updateLinks()
	{
		console.log("All appended link text updated");
		$("a.appended").each(function()
		{
			if(savedTopics.hasOwnProperty(this.id))
			{
				$(this).text("x");
				$(this).prev().css("font-style", "italic");
				console.log("Found " + this.id + " in saved links, added delete");
			}
			else
			{
				$(this).text("Save");
				$(this).prev().css("font-style", "");
			}
		});
	}

	// Manipulation of message list
	function toggleAvatars(e)
	{
		e.preventDefault();
		if (showAvatars === true)
		{
			$('.userpic-holder').hide();
		}
		else
		{
			$('.userpic-holder').show();
		}
		showAvatars = !showAvatars;
		console.log('Toggled avatar display, now ' + showAvatars);
		updateAvatarText();
		chrome.storage.local.set({"avatars": showAvatars}, function(){ console.log("Avatar settings saved locally"); });
	}

	function updateAvatarText()
	{
		showAvatars ? $('#avatar-toggle').text("Avatars On") : $('#avatar-toggle').text("Avatars Off");
	}
});
