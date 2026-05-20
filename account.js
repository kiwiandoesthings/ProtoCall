if (getCookie("userID") == "" || getCookie("userSecret") == "") {
	window.location = "/login.html";
}

var knownRooms = getCookie("knownrooms").split(".");
for (var room in knownRooms) {
	if (room == 0) {
		continue;
	}
	var parts = knownRooms[room].split(",");
	//addVisualRoom(parts[0], parts[1]);
}

async function start() {
    try {
        await connection.start();
        console.log("Connected to server");
		var userInfo = await fetch("https://api.kiwiandoesthings.place/request_userInfo?userID=" + getCookie("userID"));
		var json = await userInfo.json();
		if (json == "-1") {
			window.location = "/login.html";
		}
		var nameDisplay = document.getElementById("username-display");
		nameDisplay.innerHTML = "Currently logged in as: <span style=\"color: #" + json.userColor + "\">" + json.userUsername + "</span>";
    } catch (error) {
        console.log("Error connecting: " + error);
    }
}

start();

function logout() {
	setCookie("userID", "");
	setCookie("userSecret", "");
	window.location = "/login.html";
}

function addVisualRoom(roomName, roomID) {
	var list = document.getElementById("known-room-list");
	var listItem = document.createElement("li");
	var link = document.createElement("a");
	var buttonDelete = document.createElement("button");
	//buttonDelete
	link.href = "javascript:void(0)";
	link.addEventListener("click", function(event) {
        event.preventDefault();
        connectToRoomID(roomName, roomID);
    });
	link.textContent = roomName;
	listItem.appendChild(link);
	list.appendChild(listItem);
}

function resetKnownRooms() {
	setCookie("knownrooms", ".HomeRoom,0");
}

function promptDelete() {
	if (prompt("Are you sure you want to delete your account? You will lose ownership of any rooms you own and they will be made public.")) {
		connection.invoke("push_deleteAccount", getCookie("userID"), getCookie("userSecret"));
	}
}

connection.on("push_accountDeleted", async() => {
	alert("Your account has been deleted");
	setCookie("userID", "");
	setCookie("userSecret", "");
});