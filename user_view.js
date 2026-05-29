var profilePictureView = document.getElementById("profile-picture-view");
var userAboutView = document.getElementById("user-about-view");
var usernameView = document.getElementById("username-view");

var userID = getUrlParameter("userID");
if (!userID) {
	window.location = "/home.html";
}

async function loadUserProfile() {
	var userInfo = await getUserInfo(userID);
	var userProfile = await getUserProfile(userID);

	if (!userProfile) {
		alert("The user you are trying to view does not exist!");
		return;
	}

	var profilePictureUrl = userProfile.profilePictureUrl;
	if (profilePictureUrl == "none") {
		profilePictureUrl = "/resources/default_profile_picture_unset.png";
	}

	profilePictureView.src = profilePictureUrl;
	userAboutView.innerHTML = userProfile.aboutMe;
	usernameView.innerHTML = userInfo.userUsername;
	usernameView.style.color = "#" + userInfo.userColor;
}

loadUserProfile();