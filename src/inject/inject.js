chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------


		// Only affects topic list
		$(".fl a").after(' <a href="#" class="appended">Save</a>');
		$(".appended").each(function() {
			this.id = $(this).prev().attr("href").split("=")[1];
		});
		$(".appended").hide();
		$(".appended").on("click", saveLink);

		// Add link to menu bar (all pages)
		//$(".menubar a").filter(function(index) { return $(this).text() === "Logout"; }).after(' | <a href="#" class="saved-show">Test</a>');
		$(".userbar a").filter(function(index) { return $(this).text() === "Help"; }).after(' | <a href="#" class="saved-show">Saved Topics</a> | <a href="#" id="avatar-toggle">Avatars On</a>');
		// Add div after userubar
		$(".userbar").after('<div id="saved-topics"><h3>Saved Topics</h3><ul></ul><a href="#" class="saved-show">Close</a></div>');
		$('#saved-topics').hide();
		$(".saved-show").on("click", toggleMenu);
		$("#avatar-toggle").on("click", toggleAvatars);
		
		// Disable NWS links (topic list only)
		$(".fr:contains('NWS')").closest("td").children(".fl").children("a").not(".appended").on("click", function(e)
                                                                              {
                                                                                  e.preventDefault();
                                                                                  alert('NWS link');
                                                                              }).css("color", "gray");

		// Storage operations
		var savedTopics = [];
		var showAvatars = true;
		chrome.storage.sync.get("saved", updateFromStorage);
		chrome.storage.local.get("avatars", updateFromLocal);
		

		// Logic
		function toggleMenu(e)
		{
			e.preventDefault();
			$("#saved-topics").is(':visible') ? $("#saved-topics").slideUp('fast', function(){}) : $("#saved-topics").slideDown('fast', function(){});
		}

		function rebuildList()
		{
			$('#saved-topics ul').empty();
			$(savedTopics).each(function(index, value)
			{
				$('#saved-topics ul').append('<li><a href="//boards.endoftheinter.net/showmessages.php?topic='+value+'">'+value+'</a></li>');
			});
		}

		function updateFromLocal(items)
		{
			if (items["avatars"] !== undefined)
			{
				showAvatars = items["avatars"];
				if (showAvatars === false)
					$('.userpic-holder').hide();
				console.log("Loaded avatar settings from local storage: " + showAvatars);
			}
			else
			{
				console.log("Defaulting avatar display to true")
				chrome.storage.local.set({"avatars": true});
			}

			updateAvatarText();
		}

		function updateFromStorage(items)
		{
			if (items["saved"] !== undefined)
			{
				savedTopics = items["saved"];
			}
			updateLinks();
			rebuildList();
			console.log("Loaded saved topics from network storage: " + savedTopics);
		}

		function saveLink(e)
		{
			var linkID = $(this).prev().attr("href").split("=")[1];
			if ($.inArray(linkID, savedTopics) === -1)
			{
				savedTopics[savedTopics.length] = linkID;
			}
			else
			{
				var index = $.inArray(linkID, savedTopics);
				while (index !== -1)
				{
					console.log("Removing all instances of " + linkID + " from the array");
					savedTopics.splice(index, 1);
					index = $.inArray(linkID, savedTopics);
				}
			}
			chrome.storage.sync.set({"saved": savedTopics}, function()
			{ 
				var error = chrome.runtime.lastError;
				if (error)
				{
					alert("There was an error");
				}
				console.log("Saved to Chrome storage");
				rebuildList();
			});
			updateLinks();
			return false;
		}

		function updateLinks()
		{
			console.log("All links updated");
			$("a.appended").each(function()
			{
				if($.inArray(this.id, savedTopics) > -1)
				{
					$(this).text("x");
					$(this).prev().css("font-style", "italic");
					console.log("Found " + this.id + " in the array");
				}
				else
				{
					$(this).text("Save");
					$(this).prev().css("font-style", "");
				}
			});
		}

		$(".oh").hover(
			function()
			{
				$(this).closest("tr").children("td").css("background-color", "#EAF2FF");
				$(this).find(".appended").show();
			},
			function()
			{
				$(this).closest("tr").children("td").css("background-color", "");
				$(this).find(".appended").hide();
			}
		)

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
			// $('.userpic-holder').toggle();
			// $('.userpic-holder').is(':visible') ? $('#avatar-toggle').text("Avatars On") : $('#avatar-toggle').text("Avatars Off");
		}

		function updateAvatarText()
		{
			showAvatars ? $('#avatar-toggle').text("Avatars On") : $('#avatar-toggle').text("Avatars Off");
		}
	}
	}, 10);
});