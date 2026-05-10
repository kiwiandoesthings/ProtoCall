const connection = new signalR.HubConnectionBuilder().withUrl("https://api.kiwiandoesthings.place/protocall?userID=" + getCookie("userid") + "&userSecret=" + getCookie("usersecret")).withAutomaticReconnect().build();

connection.on("push_serverMessage", (alertMessage) => {
	alert(alertMessage);
	shouldCancelMessageClear = true;
});

function setCookie(key, value) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  document.cookie = `${key}=${value}; expires=${expiry.toUTCString()}; path=/`;
}

function getCookie(cookie) {
  const cookies = document.cookie.split("; ");
  for (let c of cookies) {
    const [key, value] = c.split("=");
    if (key === cookie) {
		return value;
	}
  }
  return "";
}

function colorMsg(message, color = "white") {
	return `<span style="color: ${color};">${message}</span>`;
}

async function easyStart() {
    try {
        await connection.start();
        console.log("Connected to server");
    } catch (error) {
        console.log("Error connecting: " + error);
    }
}

async function getUserInfo(userID = getCookie("userid")) {
	var userInfo = await fetch("https://api.kiwiandoesthings.place/request_userInfo?userID=" + userID);
	var json = await userInfo.json();
	if (json == "-1") {
		return {
			userUsername: "Unknown",
			userColor: "808080"
		};
	} else {
		return json;
	}
}

if (getCookie("knownrooms") == "") {
	setCookie("knownrooms", ".HomeRoom,0");
}

async function getRoomInfo(roomID) {
	var roomInfo = await fetch("https://api.kiwiandoesthings.place/request_roomInfo?roomID=" + roomID);
	var json = await roomInfo.json();
	if (json == "-1") {
		return "-1";
	}
	return json;
}

async function getRoomID(roomName) {
	var roomInfo = await fetch("https://api.kiwiandoesthings.place/request_roomID?roomName=" + roomName);
	var json = await roomInfo.json();
	if (json == "-1") {
		return "-1";
	}
	return json.roomID;
}