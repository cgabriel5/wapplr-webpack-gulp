// [https://stackoverflow.com/a/41922950]
/* eslint-env browser */

import "../scss/about.scss";
import $ from "jquery";

// [https://stackoverflow.com/questions/47711951/font-awesome-5-bundle-via-npm]
// [https://fontawesome.com/how-to-use/use-with-node-js]
// [https://gist.github.com/robmadole/708be3e5e19d4ffebae90c076739cd86]
// Import font-awesome
import fontawesome from "@fortawesome/fontawesome";
// import solid from "@fortawesome/fontawesome-free-solid";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import faCircle from "@fortawesome/fontawesome-free-regular/faCircle";
import faFacebook from "@fortawesome/fontawesome-free-brands/faFacebook";
import faTwitter from "@fortawesome/fontawesome-free-brands/faTwitter";

// Add entire styles or individual icons
fontawesome.library.add(faUser, faCircle, faFacebook, faTwitter);

let container = document.getElementById("container");

setTimeout(() => {
	$("body").css("background", "gold");
	container.innerHTML = `This is the about page. <i class="fab fa-twitter"></i><i class="fas fa-user"></i><i class="far fa-circle"></i><i class="fab fa-facebook"></i>`;
}, 1500);
