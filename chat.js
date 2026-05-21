document.getElementById("warning").innerHTML = "WARNING: This version of ProtoCall is in testing. Beware of bugs and unfinished features";

async function loadClient() {
	if (getCookie("userID") == "") {
		window.location = "/login.html";
	} else {
		var info = await getUserInfo(getCookie("userID"));
		var username = await info.userUsername;
		var color = await info.userColor;
		document.getElementById("username-view").innerHTML = username;
		document.getElementById("username-view").style.color = "#" + color;
	}
}

loadClient();

var lostConnection = false;
var connected = false;

var shouldCancelMessageClear = false;

var latestMessageIndex = -1;
var earliestMessageIndex = -1;

var userInfos = {};

var currentRoomID = -1;
var currentRoomName = "";

var totalMessages = 0;
var canRequestMessages = true;

document.getElementById("chat-input").addEventListener("keydown", function(event) {
	if (event.key === "Enter") {
		send();
		event.preventDefault();
	}
});

document.getElementById("chat-messages-area").addEventListener("wheel", function(event) {
	if (document.getElementById("chat-messages-area").scrollTop <= 5 && event.deltaY < 0) {
    	if (earliestMessageIndex > 1 && canRequestMessages) {
            requestMessages(earliestMessageIndex, 20);
			canRequestMessages = false;
        }
    }
});

async function start() {
    try {
		clearLog();
        await connection.start();
        console.log("Connected to server");
		setConnected();
		var queryString = window.location.search;
		var urlParams = new URLSearchParams(queryString);
		var roomName = urlParams.get('connectToRoom') || 'HomeRoom';
		var roomID = await getRoomID(roomName);
		await connectToRoomID(roomID);
    } catch (error) {
        console.log("Error connecting: " + error);
    }
}

start();

async function connectToRoom() {
	var roomName = document.getElementById("room-select-input").value;
	var roomID = await getRoomID(roomName);
	if (roomID == "-1") {
		roomID = 0;
	}
	var json = await getRoomInfo(roomID);
	if (json == -1) {
		if (confirm("That room does not exist! Create it?")) {
			connection.invoke("push_createRoom", roomName);
		}
		return;
	}
	clearLog();
	currentRoomID = json.roomID;
	setRoomInfos(json);
	systemLog("You have successfully connected to room \"" + colorMsg(roomName, "var(--server-alert-color)") + "\"");
	await requestMessages(-1, 50);
	if (getCookie("knownrooms").indexOf(roomName) == -1) {
		addRoomToList(roomName, currentRoomID);
	}
}

async function connectToRoomID(roomID) {
	var roomInfo = await getRoomInfo(roomID);
	if (roomInfo == -1) {
		alert("Failed to connect directly to room");
		connectToRoomID(0);
		return;
	}
	currentRoomID = roomID;
	setRoomInfos(roomInfo);
	systemLog("You have successfully connected to room \"" + colorMsg(roomInfo.roomName, "var(--server-alert-color)") + "\"");
	await requestMessages(-1, 50);
}

async function setRoomInfos(roomJson) {
	document.getElementById("room-name").innerHTML = roomJson.roomName;
	document.getElementById("room-status").innerHTML = roomJson.privacy;
	document.getElementById("room-status").style.color = "var(--public-color)";

	var listItem = document.createElement("li");
	var userInfo = await getUserInfo(getCookie("userID"));
	listItem.innerHTML = userInfo.userUsername;
	listItem.style.color = "#" + userInfo.userColor;
	//document.getElementById("connected-users").appendChild(listItem);
}

connection.onclose(error => {
	systemLog("You have disconnected from the server!");
	lostConnection = true;
});

connection.onreconnected(connectionID => {
	setConnected();
});

connection.on("push_recieveRoom", async (roomName, roomID) => {
	clearLog();
	currentRoomID = roomID;
	await requestMessages(-1, 50);
	document.getElementById("room-name").innerHTML = roomName;
	addRoomToList(roomName, currentRoomID);
});

connection.on("push_recieveMessages", async (messages) => {
	canRequestMessages = true;

	var fetchPromises = messages.map(message => {
        if (userInfos[message.authorID] === undefined) {
            userInfos[message.authorID] = fetch(apiString + "request_userInfo?userID=" + message.authorID, {
    			credentials: "include" 
			}).then(result => result.json()).catch(() => ({ userUsername: "Unknown", userColor: "808080" }));
        }
        return userInfos[message.authorID];
    });
	
	await Promise.all(fetchPromises);

	var isHistory = earliestMessageIndex !== -1 && messages[0].messageIndex < earliestMessageIndex;

    if (isHistory) {
        messages.reverse();
    }

	for (var message of messages) {
        var userInfo = await userInfos[message.authorID];

        if (message.messageIndex === earliestMessageIndex && isHistory) {
			continue;
		}

		var sendTime = message.messageTimestamp;
		if (sendTime.length == 0) {
			sendTime = "Unknown Time";
		}

        if (!isHistory) {
            log(message.content, userInfo.userUsername, "#" + userInfo.userColor, sendTime, false);
            latestMessageIndex = Math.max(latestMessageIndex, message.messageIndex);
            if (earliestMessageIndex === -1 || message.messageIndex < earliestMessageIndex) {
                earliestMessageIndex = message.messageIndex;
            }
        } else {
            log(message.content, userInfo.userUsername, "#" + userInfo.userColor, sendTime, true);
            earliestMessageIndex = message.messageIndex;
        }
    };
});

async function send() {
	var input = document.getElementById("chat-input");
	var sanitizedText = sanitizeText(input.value);
	if (sanitizedText != input.value) {
		systemLog("You cannot send messages with disallowed HTML tags!");
	}
	if (sanitizedText == "") {
		return;
	}
	if (connected && currentRoomID != -1) {
		await connection.invoke("push_sendMessage", sanitizedText, getDatetime(), parseInt(currentRoomID));
		if (shouldCancelMessageClear) {
			shouldCancelMessageClear = false;
			return;
		}
		input.value = "";
	} else {
		if (currentRoomID != -1) {
			systemLog("You cannot send messages while not connected!");
		} else {
			systemLog("You cannot send messages while not in a room!");
		}
	}
}

function setConnected() {
	if (connected) {
		systemLog("You have successfully reconnected to the server!");
		lostConnection = false;
	} else {
		systemLog("You have successfully connected to the server!");
	}
	connected = true;
}

function systemLog(text, back = false) {
	log(colorMsg(text, "var(--server-message-color)"), "&lt;System", "var(--server-message-color)", getDatetime(), back);
}

function log(text, authorUsername, authorColor, timestamp, back = false) {
	var sanitizedText = text;
	if (authorUsername != "&lt;System") {
		sanitizedText = sanitizeText(text);
	}

    var grid = document.getElementById("chat-container");

    var timeElement = document.createElement("div");
    timeElement.className = "timestamp";
    timeElement.innerText = timestamp;

    var msgElement = document.createElement("div");
    msgElement.className = "message";
    msgElement.innerHTML = "<span style=\"color: " + authorColor + ";\">" + authorUsername + "></span> " + sanitizedText;

    if (back) {
        grid.prepend(timeElement);
        grid.prepend(msgElement);
    } else {
        grid.appendChild(msgElement);
        grid.appendChild(timeElement);

        var area = document.getElementById("chat-messages-area");
        area.scrollTop = area.scrollHeight;
    }
    totalMessages++;
}

function clearLog() {
	var log = document.getElementById("chat-container");
	log.innerHTML = "";
	totalMessages = 0;
	earliestMessageIndex = -1;
	latestMessageIndex = -1;

	document.getElementById("room-name").innerHTML = "No Room Connected";
	document.getElementById("room-status").innerHTML = "Unknown";
	document.getElementById("room-status").style.color = "var(--unknown-color)";

	//document.getElementById("connected-users").innerHTML = "";
}

function getDatetime() {
	var now = new Date();
	var options = {
 	   	hour: '2-digit',
 	   	minute: '2-digit',
 	   	second: '2-digit',
	    day: '2-digit',
	    month: '2-digit',
	    year: 'numeric',
	    hour12: false
	};

	var formatter = new Intl.DateTimeFormat('en-GB', options);
	var parts = formatter.formatToParts(now);
	var datetime = Object.fromEntries(parts.map(p => [p.type, p.value]));

 	return formattedDate = `${datetime.hour}:${datetime.minute}:${datetime.second} ${datetime.month}/${datetime.day}/${datetime.year}`;
}

function sanitizeText(text) {
	return DOMPurify.sanitize(text, {
    	ALLOWED_TAGS: ["color", "b", "i", "u"],
    	ALLOWED_ATTR: ["color"]
	}).trim();
}

function editRoom() {
	if (currentRoomID == -1) {
		systemLog("You are not connected to a room!");
		return;
	}
	window.location.replace("/room_settings.html?roomID=" + currentRoomID);
}

async function requestMessages(start, end) {
	await connection.invoke("push_messageRequest", start, end, parseInt(currentRoomID));
}