if (getCookie("userID") != "") {
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
const allowedProfilePictureFormats = ["image/png", "image/jpeg", "image/gif"];
var profilePicture = document.getElementById("profile-picture-input");
profilePicture.addEventListener('change', function (event) {
	var input = event.target;
	var file = input.files[0];
	if (!file) {
		return;
	}

	if (!allowedProfilePictureFormats.includes(file.type)) {
		alert("Your uploaded profile picture must be of one of the following file types: png, jpeg/jpg, gif.");
		input.value = "";
		return;
	}

	try {
		var reader = new FileReader();
        
        reader.onload = function(eek) {
            var image = new Image();
            image.onload = function() {
                if (image.width !== 512 || image.height !== 512) {
                    alert("Your uploaded profile picture must be exactly 512x512 pixels. Your image is " + image.width + "x" + image.height + ".");
                    input.value = "";
                }
            };
			image.onerror = function() {
                alert("Could not read your uploaded profile picture. It may be corrupted.");
                input.value = "";
            };

            image.src = eek.target.result;
        };
        reader.readAsDataURL(file);
    } catch (error) {
        alert("Could not read the image file. It may be corrupted.");
        input.value = "";
    }
});

easyStart();

async function register() {
	var usernameValue = username.value;
	var color = colorPicker.value.slice(1);
	var passwordValue = password.value;
	var profilePictureValue = profilePicture.files[0];

	var formData = new FormData();
    formData.append("username", usernameValue);
    formData.append("password", passwordValue);
    formData.append("color", color);
	formData.append("profilePicture", profilePictureValue);

	var loginInfo = await fetch(apiString + "push_registerAccount", {
    	method: "POST",
		credentials: "include",
		body: formData
	});

	if (!loginInfo.ok) {
		alert(await loginInfo.text());
		return;
	}
	var json = await loginInfo.json();
	setCookie("loggedin", true);
	window.location.replace('/account.html');
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
	window.location.replace('/account.html');
}