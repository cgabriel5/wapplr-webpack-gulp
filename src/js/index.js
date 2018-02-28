// [https://stackoverflow.com/a/41922950]
/* eslint-env browser */

import "../scss/index.scss";
// import modernizr from "modernizr";
// import $ from "jquery";

// Instantiate fastclick library. [https://github.com/ftlabs/fastclick#amd]
import fastclick from "fastclick";
fastclick.attach(document.body);

import Vue from "vue";
import App from "../App.vue";
// [https://alligator.io/vuejs/intro-to-routing/]
import Router from "vue-router";

Vue.use(Router);

// We create the router instance here.
const router = new Router({
	routes: [
		{
			path: "/"
		}
	]
});

new Vue({
	router,
	el: "#app",
	render: h => h(App)
});
