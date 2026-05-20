if (getCookie("userID") != "" && getCookie("userSecret") != "") {
	window.location = "/account.html";
}

var colorLabel = document.getElementById("colorlabel");
var colorPicker = document.getElementById("color");
if (colorLabel != null) {
	setInterval(function() {
		colorLabel.style.color = colorPicker.value;
	}, 10);
}

var username = document.getElementById("username");
username.addEventListener('input', () => {
	const nonAscii = /[^a-zA-Z0-9-_]/g;
    
    if (nonAscii.test(username.value)) {
        username.value = username.value.replace(nonAscii, '');
    }
});
var password = document.getElementById("password");
password.addEventListener('input', () => {
	const nonAscii = /[^a-zA-Z0-9-_]/g;
    
    if (nonAscii.test(password.value)) {
        password.value = password.value.replace(nonAscii, '');
    }
});

easyStart();

async function register() {
	var usernameValue = username.value;
	var color = colorPicker.value.slice(1);
	var passwordValue = password.value;

	var thisInfo = await fetch("https://api.kiwiandoesthings.place/request_deviceInfo");
	var thisJson = await thisInfo.json();
	var loginInfo = await fetch("https://api.kiwiandoesthings.place/request_registerAccount?username=" + usernameValue + "&password=" + passwordValue + "&color=" + color + "&info=" + thisJson.id);
	var json = await loginInfo.json();
	var userID = json.userID;
	var userSecret = json.userSecret;
	if (json  == "-1") {
		alert("Account is either already registered or provided registration info is invalid");
		return;
	}
	console.log("UserID returned: " + userID);
	console.log("UserSecret returned: " + userSecret);
	setLoginInfo(userID, userSecret);
	setCookie("loggedin", true);
	window.location.replace('/account.html');
}

async function login() {
	var usernameValue = username.value;
	var passwordValue = password.value;

	var loginInfo = await fetch("https://api.kiwiandoesthings.place/request_loginInfo?username=" + usernameValue + "&password=" + passwordValue);
	var json = await loginInfo.json();
	var userID = json.userID;
	var userSecret = json.userSecret;
	if (json == "-1") {
		alert("Login is invalid");
		return;
	}
	console.log("UserID returned: " + userID);
	console.log("UserSecret returned: " + userSecret);
	setLoginInfo(userID, userSecret);
	setCookie("loggedin", true);
	window.location.replace('/account.html');
}

function setLoginInfo(userID, userSecret) {
	setCookie("userID", userID);
	setCookie("userSecret", userSecret);
}