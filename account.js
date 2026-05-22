if (getCookie("userID") == "") {
	//window.location = "/login.html";
}

var knownRooms = getCookie("knownrooms").split(".");
for (var room in knownRooms) {
	if (room == 0) {
		continue;
	}
	var parts = knownRooms[room].split(",");
}

async function start() {
    try {
        await connection.start();
        console.log("Connected to server");
		var userInfo = await fetch(apiString + "request_userInfo?userID=" + getCookie("userID"), {
    		credentials: "include" 
		});
		if (!userInfo.ok) {
			alert(await userInfo.text());
			//window.location = "/login.html";
		}
		var json = await userInfo.json();
		var nameDisplay = document.getElementById("username-display");
		nameDisplay.innerHTML = "Currently logged in as: <span style=\"color: #" + json.userColor + "\">" + json.userUsername + "</span>";
    } catch (error) {
        console.log("Error connecting: " + error);
    }
}

start();

function logout() {
	setCookie("loggedin", false);
	window.location = "/login.html";
}

function addVisualRoom(roomName, roomID) {
	var list = document.getElementById("known-room-list");
	var listItem = document.createElement("li");
	var link = document.createElement("a");
	var buttonDelete = document.createElement("button");

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

async function promptDelete() {
	if (prompt("Are you sure you want to delete your account? You will lose ownership of any rooms you own and they will be made public.")) {
		await fetch(apiString + "push_deleteAccount", {
			method: "POST",
			credentials: "include"
		});
	}

	setCookie("loggedin", false);
	window.location = "/login.html";
}