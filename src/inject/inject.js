chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Running injected script...");
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
		$(".userbar a").filter(function(index) { return $(this).text() === "Help"; }).after(' | <a href="#" class="saved-show">Saved Topics</a> | <a href="#" id="avatar-toggle">Avatars On</a> | <a href="#" id="nws-toggle">NWS On</a>');
		// Add div after userubar
		$(".userbar").after('<div id="saved-topics"><h3>Saved Topics</h3><ul></ul><a href="#" class="saved-show">Close</a></div>');
		$('#saved-topics').hide();
		$(".saved-show").on("click", toggleMenu);
		$("#avatar-toggle").on("click", toggleAvatars);
		$('#nws-toggle').on("click", function(){ allowNWS = !allowNWS; allowNWS ? $(this).text("NWS On") : $(this).text("NWS Off"); chrome.storage.local.set({'nws': allowNWS}); });
		
		// Disable NWS links (topic list only)
		$(".fr:contains('NWS')").closest("td").children(".fl").children("a").not(".appended").on("click", function(e)
                                                                              {
                                                                              	if (!allowNWS)
                                                                              	{
                                                                                	e.preventDefault();
                                                                                	alert('NWS link');
                                                                                }
                                                                              }).css("color", "gray");

		// Storage operations
		var savedTopics = {};
		var showAvatars = true;
		var allowNWS    = true;
		chrome.storage.sync.get("saved", updateFromStorage);
		chrome.storage.local.get(["avatars", "nws"], updateFromLocal);
		

		// Logic
		function toggleMenu(e)
		{
			e.preventDefault();
			$("#saved-topics").is(':visible') ? $("#saved-topics").slideUp('fast', function(){}) : $("#saved-topics").slideDown('fast', function(){});
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
			if (showAvatars === true)
			{
				$('.userpic-holder').show();
			}

			if (items["nws"] === undefined)
			{
				console.log("Defaulting NWS allowance to true");
				chrome.storage.local.set({"nws": true});
			}
			else
			{
				allowNWS = items["nws"];
				allowNWS ? $('#nws-toggle').text("NWS On") : $('#nws-toggle').text("NWS Off");
				console.log("Loaded nws settings from local storage: " + allowNWS);
			}
			
		}

		function updateFromStorage(items)
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
				var error = chrome.runtime.lastError;
				if (error)
				{
					alert("There was an error");
				}
				console.log("Saved modified link list to network storage");
				rebuildList();
			});
			updateLinks();
		}

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
		}

		function updateAvatarText()
		{
			showAvatars ? $('#avatar-toggle').text("Avatars On") : $('#avatar-toggle').text("Avatars Off");
		}
	}
	}, 10);
});