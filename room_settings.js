var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var roomID = urlParams.get('roomID') || -1;
roomID = parseInt(roomID);
if (roomID == -1) {
	window.location.replace("/chat.html");
}

var oppositePublicity = "";

async function start() {
	var privacyButton = document.getElementById("room-privacy-toggle-button");
	var roomInfo = await getRoomInfo(parseInt(roomID));
	oppositePublicity = "public";
	if (roomInfo.privacy == "PUBLIC") {
		oppositePublicity = "private"
	}
	privacyButton.innerHTML = "Make " + roomInfo.roomName + " " + oppositePublicity;
}

start();

easyStart();

async function toggleRoomPrivacy() {
	var response = await fetch(apiString + "push_setRoomPrivacy?roomID=" + roomID + "&newPrivacy=" + oppositePublicity, {
		method: "POST",
		credentials: "include"
	});
	if (!response.ok) {
		alert(await response.text());
	}
	start();
}

var userInput = document.getElementById("user-access-input");
var banButton = document.getElementById("ban-user-button");
var accessButton = document.getElementById("give-access-button");
var moderatorButton = document.getElementById("give-moderator-button");

async function setUserAccess(accessLevel) {
	var userID = await getUserId(userInput.value);
	if (userID == -1) {
		return;
	}

	var result = await fetch(apiString + "push_setUserAccess?otherID=" + userID + "&accessLevel=" + accessLevel + "&roomID=" + roomID, {
		method: "POST",
		credentials: "include"
	});
	if (!result.ok) {
		alert(await result.text());
	}
}