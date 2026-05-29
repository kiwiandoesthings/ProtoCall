const apiString = "https://api.kiwiandoesthings.place/";
const connection = new signalR.HubConnectionBuilder().withUrl(apiString + "protocall?userID=" + getCookie("userID"), {
        withCredentials: true
    }).withAutomaticReconnect().configureLogging(signalR.LogLevel.Information).build();

connection.on("push_serverMessage", (alertMessage) => {
	alert(alertMessage);
	shouldCancelMessageClear = true;
});

function setCookie(key, value) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  document.cookie = `${key}=${value}; expires=${expiry.toUTCString()}; domain=.kiwiandoesthings.place; path=/`;
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

async function getUserInfo(userID = getCookie("userID")) {
	var userInfo = await fetch(apiString + "request_userInfo?userID=" + userID, {
    	credentials: "include" 
	});
	if (!userInfo.ok) {
		return {
			userUsername: "Unknown",
			userColor: "808080"
		};
	} else {
		return await userInfo.json();
	}
}

async function getUserProfile(userID = getCookie("userID")) {
	var userProfile = await fetch(apiString + "request_userProfile?userID=" + userID, {
		credentials: "include"
	});
	if (!userProfile.ok) {
		return null;
	} else {
		return await userProfile.json();
	}
}

if (getCookie("knownrooms") == "") {
	setCookie("knownrooms", ".HomeRoom,0");
}

async function getRoomInfo(roomID) {
	var roomInfo = await fetch(apiString + "request_roomInfo?roomID=" + roomID, {
    	credentials: "include" 
	});
	if (!roomInfo.ok) {
		//alert(await roomInfo.text());
		return -1;
	}
	var json = await roomInfo.json();
	return json;
}

async function getRoomID(roomName) {
	var roomInfo = await fetch(apiString + "request_roomID?roomName=" + roomName, {
    	credentials: "include" 
	});
	if (!roomInfo.ok) {
		alert(await roomInfo.text());
		return -1;
	}
	var json = await roomInfo.json();
	return json.roomID;
}

async function getUserId(userName) {
	var userInfo = await fetch(apiString + "request_userID?userName=" + userName, {
    	credentials: "include" 
	});
	if (!userInfo.ok) {
		alert(await userInfo.text());
		return -1;
	}
	var json = await userInfo.json();
	return json.userID;
}

function getUrlParameter(parameter) {
	var queryString = window.location.search;
	var urlParams = new URLSearchParams(queryString);

	return urlParams.get(parameter) || null;
}