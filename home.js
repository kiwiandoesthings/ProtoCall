var knownSelectInput = document.getElementById("known-room-select-input");
var newSelectInput = document.getElementById("new-room-select-input");

async function loadClient() {
	if (getCookie("userID") == "") {
		window.location = "/login.html";
	} else {
		var userInfo = await getUserInfo();

		knownSelectInput.placeholder = userInfo.userUsername + "'s room"; 
		newSelectInput.placeholder = "Other user's room";

		addAllKnownRooms();
		addAllNewRooms();
	}
}

var searchOptions = {
	includeScore: true,
  	threshold: 0.3
};

function updateSearchRooms(target, searchItems, elementName) {
	var roomNames = [];
	var roomIDs = [];
	for (var i = 0; i < searchItems.length; i++) {
        var parts = searchItems[i].split(",");
        roomNames.push(parts[0]);
        roomIDs.push(parts[1]);
    }
    
    var fuse = new Fuse(roomNames, searchOptions);
    var results = fuse.search(target);

    clearList(elementName);

    for (var i = 0; i < results.length; i++) {
        var match = results[i];
        var originalIndex = match.refIndex; 
        
        addVisualRoom(match.item, roomIDs[originalIndex], elementName);
    }
}

function addAllKnownRooms() {
	clearList("known-room-search-results");
	var knownRooms = getCookie("knownrooms");
	var favoriteRoomsCookie = getCookie("favrooms");
	var rooms = knownRooms.split(".").slice(1);
	var favoriteRooms = favoriteRoomsCookie.split(".").slice(1);
	for (var room of rooms) {
		var parts = room.split(",");

		var favoriteType = "favorite";
		for (var favoriteRoom of favoriteRooms) {
			if (favoriteRoom.split(",")[0] == parts[0]) {
				favoriteType = "un" + favoriteType;
				break;
			}
		}

		var safeName = parts[0].replace(/'/g, "\\'");
		var buttons = ``;
		if (parts[0].toLowerCase() != "homeroom") {
			buttons += `<img src="resources/delete.png" class="icon-small" onclick="removeRoom(\'` + safeName + `\', ` + parts[1] + `)"></img>`;
		}
		buttons += `<img src="resources/` + favoriteType + `.png" class="icon-small" onclick="` + favoriteType + `Room(\'` + safeName + `\', ` + parts[1] + `)">`;
		addVisualRoom(parts[0], parts[1], "known-room-search-results", buttons);
	}
}

function addVisualRoom(roomName, roomID, elementName, buttons) {
	var parent = document.getElementById(elementName);
	var list = parent.querySelector("ul");
	var listItem = document.createElement("li");
	listItem.innerHTML = `
	<div class="search-result-item">
		<a class="result-label" href="/chat.html?connectToRoom=` + roomName + `">` + roomName + `</a>
		<div class="result-actions">
			<a>
				` + buttons + `
			</a>
		</div>
	</div>`;
	list.appendChild(listItem);
}

function clearList(elementName) {
	var parent = document.getElementById(elementName);
    var list = parent.querySelector("ul");
    list.innerHTML = ""; 
}

knownSelectInput.addEventListener("input", () => {
	if (knownSelectInput.value.length == 0) {
		addAllKnownRooms();
		return;
	}
	var knownRooms = getCookie("knownrooms").split(".");
	var realRooms = knownRooms.slice(1);
	updateSearchRooms(knownSelectInput.value, realRooms, "known-room-search-results");
});

async function addAllNewRooms() {
	var rooms = await fetch(apiString + "request_roomSearch?targetName=" + newSelectInput.value, {
    	credentials: "include" 
	});
	if (!rooms.ok) {
		alert(await rooms.text());
		return;
	}
	var json = await rooms.json();
	clearList("new-room-search-results");
	var knownRooms = getCookie("knownrooms").split(".");
	var realRooms = knownRooms.slice(1);
	var knownNames = [];
	for (room in realRooms) {
		knownNames[room] = realRooms[room].split(",")[0];
	}
	for (var room of json) {
		if (knownNames.includes(room.roomName)) {
			continue;
		}
		var safeName = room.roomName.replace(/'/g, "\\'");
		addVisualRoom(room.roomName, room.roomID, "new-room-search-results", `
        <img src="resources/add.png" class="icon-small" onclick="addRoom(\'` + safeName + `\', ` + room.roomID + `)">`);
	}
}

newSelectInput.addEventListener("input", async () => {
	addAllNewRooms();
});

loadClient();

easyStart();

var roomSelectInput = document.getElementById("new-room-select-input");
var createButton = document.getElementById("room-create-button");
createButton.addEventListener("click", async () => {
	var roomName = roomSelectInput.value;
	if (confirm("Are you sure you want to create room \"" + roomName + "\"")) {
		console.log("e");
		await fetch(apiString + "push_createRoom?roomName=" + roomName, {
			method: "POST",
			credentials: "include"
		});
		roomSelectInput.value = "";
		addAllNewRooms();
	}
});

function addRoom(roomName, roomID) {
	var knownRooms = getCookie("knownrooms").split(".").slice(1);
	for (var room of knownRooms) {
		if (room.substring(0, room.indexOf(",")) == roomName) {
			return;
		}
	}

	setCookie("knownrooms", getCookie("knownrooms") + "." + roomName + "," + roomID);

	addAllKnownRooms();
	addAllNewRooms();
}

function removeRoom(roomName, roomID) {
	var knownRooms = getCookie("knownrooms").split(".").slice(1);
	var newRooms = "";
	for (var room of knownRooms) {
		if (room.substring(0, room.indexOf(",")) == roomName) {
			continue;
		}
		newRooms += "." + room;
	}
	setCookie("knownrooms", newRooms);

	unfavoriteRoom(roomName, roomID);

	addAllKnownRooms();
	addAllNewRooms();
}

function favoriteRoom(roomName, roomID) {
	var favoriteRooms = getCookie("favrooms").split(".").slice(1);
	for (var room of favoriteRooms) {
		if (room.substring(0, room.indexOf(",")) == roomName) {
			return;
		}
	}

	setCookie("favrooms", getCookie("favrooms") + "." + roomName + "," + roomID);

	addAllKnownRooms();
}

function unfavoriteRoom(roomName, roomID) {
	var favoriteRooms = getCookie("favrooms").split(".").slice(1);
	var newRooms = "";
	for (var room of favoriteRooms) {
		if (room.substring(0, room.indexOf(",")) == roomName) {
			continue;
		}
		newRooms += "." + room;
	}
	setCookie("favrooms", newRooms);

	addAllKnownRooms();
}