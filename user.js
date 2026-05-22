if (getCookie("userID") != "") {
	//window.location = "/account.html";
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

	var thisInfo = await fetch(apiString + "request_deviceInfo", {
    	credentials: "include" 
	});
	var thisJson = await thisInfo.json();
	var loginInfo = await fetch(apiString + "push_registerAccount?username=" + usernameValue + "&password=" + encodeURIComponent(passwordValue) + "&color=" + color + "&info=" + thisJson.id, {
    	method: "POST",
		credentials: "include" 
	});
	if (!loginInfo.ok) {
		alert(await loginInfo.text());
		return;
	}
	var json = await loginInfo.json();
	setCookie("loggedin", true);
	//window.location.replace('/account.html');
}

async function login() {
	var usernameValue = username.value;
	var passwordValue = password.value;

	var loginInfo = await fetch(apiString + "request_loginInfo?username=" + usernameValue + "&password=" + encodeURIComponent(passwordValue), {
		credentials: "include"
	});
	if (!loginInfo.ok) {
		alert(await loginInfo.text());
		return;
	}
	var json = await loginInfo.json();
	setCookie("loggedin", true);
	//window.location.replace('/account.html');
}