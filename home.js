var knownSelectInput = document.getElementById("known-room-select-input");
var newSelectInput = document.getElementById("new-room-select-input");

async function loadClient() {
	if (getCookie("userid") == "" || getCookie("usersecret") == "") {
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
	var rooms = knownRooms.split(".").slice(1);
	for (var room of rooms) {
		var parts = room.split(",");
		var buttons = `
        	<img src="resources/delete.png" class="icon-small" onclick="removeRoom(\'` + parts[0] + `\', ` + parts[1] + `)">`;
		if (parts[0].toLowerCase() == "homeroom") {
			buttons = "";
		}
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
	var rooms = await fetch("https://api.kiwiandoesthings.place/request_roomSearch?targetName=" + newSelectInput.value + "&userID=" + getCookie("userid") + "&userSecret=" + getCookie("usersecret"));
	var json = await rooms.json();
	if (json == "-1") {
		alert("Your request could not be authenticated. Please clear your cookies and sign in again.");
	}
	clearList("new-room-search-results");
	for (var room of json) {
		addVisualRoom(room.roomName, room.roomID, "new-room-search-results", `
        <img src="resources/add.png" class="icon-small" onclick="addRoom(\'` + room.roomName + `\', ` + room.roomID + `)">`);
	}
}

newSelectInput.addEventListener("input", async () => {
	addAllNewRooms();
});

loadClient();

easyStart();

var roomSelectInput = document.getElementById("new-room-select-input");
var createButton = document.getElementById("room-create-button");
createButton.addEventListener("click", () => {
	var roomName = roomSelectInput.value;
	if (confirm("Are you sure you want to create room \"" + roomName + "\"")) {
		connection.invoke("push_createRoom", roomName, getCookie("userid"), getCookie("usersecret"));
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

	addAllKnownRooms();
}