var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var roomID = urlParams.get('roomID') || -1;
roomID = parseInt(roomID);
if (roomID == -1) {
	//window.location.replace("/chat.html");
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
	await connection.invoke("push_setRoomPrivacy", roomID, oppositePublicity, getCookie("userID"), getCookie("userSecret"));
}