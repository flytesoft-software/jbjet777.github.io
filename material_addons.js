var MaterialAddons=function(){function k(){return $("section.is-active").index()}function r(){L&&D();for(var a=0;a<x.length;a++)x[a]===f&&u()}function D(){d.swipe(g);d.touchEnd(l);L=!1}function u(){d.swipeOff();d.touchEndOff();L=!0;l()}function y(a){"left"===a.swipeType&&(v.swipeOff(),m.MaterialLayout.toggleDrawer(),console.log("Drawer swipe left."),v.transitionEndOne(function(a){v.swipe(y);console.log("Drawer swipe listener back on.")}))}function g(a){if("right"===a.swipeType)if(a.startX<.15*H)I||
(d.swipeOff(),I=!0,console.log("Calling drawer trigger"),d.touchEndOne(function(a){console.log("Drawer trigger");m.MaterialLayout.toggleDrawer();I=!1;d.swipe(g)}));else{if(0<f&&($(e[f]).offset({left:a.distX}),Math.abs(a.distX)>.5*H&&!t)){d.swipeOff();t=!0;var w=$(e[f]).children("div.page-content");var b=$(e[f-1]).children("div.page-content");w.addClass("eclipse-content-swipe-out-right");w.animationEndOne(function(a){w.removeClass("eclipse-content-swipe-out-right");b.addClass("eclipse-content-swipe-in-right");
z=!0;E[f-1].click();$(e[f]).css("left","");n&&n(a);b.animationEndOne(function(a){b.removeClass("eclipse-content-swipe-in-right");d.swipe(g);f=a.currentPageIdx=k();r();h&&h(a)})})}}else"left"===a.swipeType&&f<e.length-1&&($(e[f]).offset({left:a.distX}),Math.abs(a.distX)>.5*H&&!t&&(d.swipeOff(),t=!0,w=$(e[f]).children("div.page-content"),b=$(e[f+1]).children("div.page-content"),w.addClass("eclipse-content-swipe-out-left"),w.animationEndOne(function(a){w.removeClass("eclipse-content-swipe-out-left");
b.addClass("eclipse-content-swipe-in-left");z=!0;E[f+1].click();$(e[f]).css("left","");n(a);b.animationEndOne(function(a){b.removeClass("eclipse-content-swipe-in-left");d.swipe(g);f=a.currentPageIdx=k();r();h&&h(a)})})))}function l(){e.css({position:""});t=I=!1}function p(){q.show();b.hasClass("eclipse-header-transition")||b.addClass("eclipse-header-transition");q.hasClass("eclipse-footer-transition")||q.addClass("eclipse-footer-transition");q.transitionEndOff();F=!1;G&&q.transitionEndOne(G)}function A(){F=
!0;G&&G();q.transitionEndOff();q.transitionEndOne(function(a){console.log("Footer change.");q.hide()});b.removeClass("eclipse-header-transition");q.removeClass("eclipse-footer-transition")}function B(){c=$("#main-header").children("div.mdl-layout__drawer-button");c.addClass("eclipse-drawer-button")}var m=document.querySelector("#main-content"),d=$("#app-content"),b=$("header"),N=$("#table-bar"),q=$("footer"),e=$("section"),E=$("header a"),v=$(".mdl-layout__drawer"),J=$(".mdl-spinner"),c,I=!1,H=$(window).width(),
f=k(),t=!1,L=!1,z=!1,G=null,C=null,K=!1,F=!1,x=[],M=null,h=null,n=null;(function(){if(m.classList.contains("is-upgraded"))console.log("MDL already upgraded."),B(),C?(console.log("Callback to MDL complete."),window.setTimeout(C,1)):K=!0;else{var a=!1,b=m,d=new MutationObserver(function(b){d.disconnect();console.log("MDL mutations found: "+b.length);0<b.length&&!a&&(a=!0,B(),C?C():K=!0)});d.observe(b,{attributes:!0})}})();(function(){var a=navigator.userAgent.toLowerCase();-1<a.indexOf("windows")||
-1<a.indexOf("macintosh")||-1<a.indexOf("linux")&&-1===a.indexOf("android")?(console.log("Running on desktop browser."),$("head").append("<style>::-webkit-scrollbar{ width: 9px; height: 9px;} ::-webkit-scrollbar-thumb { background: #ccc;}</style>")):console.log("Running on mobile browser.")})();console.log("Binding material addon events.");$(window).resize(function(a){console.log("Material window resize called.");H=$(window).width();M&&M(a)});D();E.click(function(a){var b=$(this).index();console.log("Tab click fired.");
if(b!==f&&!z){n&&n(a);var d=window.setTimeout(function(){e.transitionOrAnimationOff();f=b;r();h&&(a.currentPageIdx=b,h(a));console.log("No page change animation called.")},500);e.transitionOrAnimationOne(function(){window.clearTimeout(d);e.transitionOrAnimationOff();f=b;r();h&&(a.currentPageIdx=b,h(a));console.log("Section transistion or animation called.")})}z=!1});v.swipe(y);this.changePage=function(a){if(a)if("number"===typeof a){var b=k();if(a!==b&&0<a&&a<$("section").toArray().length){if(a>b){d.swipeOff();
t=!0;b=$(e[b]).children("div.page-content");var c=$(e[a]).children("div.page-content");b.addClass("eclipse-content-swipe-out-left");b.animationEndOne(function(e){b.removeClass("eclipse-content-swipe-out-left");c.addClass("eclipse-content-swipe-in-left");z=!0;E[a].click();n&&n(e);c.animationEndOne(function(a){c.removeClass("eclipse-content-swipe-in-left");d.swipe(g);f=a.currentPageIdx=k();r();t=!1;h&&h(a)})})}else d.swipeOff(),t=!0,b=$(e[b]).children("div.page-content"),c=$(e[a]).children("div.page-content"),
b.addClass("eclipse-content-swipe-out-right"),b.animationEndOne(function(e){b.removeClass("eclipse-content-swipe-out-right");c.addClass("eclipse-content-swipe-in-right");z=!0;E[a].click();n&&n(e);c.animationEndOne(function(a){c.removeClass("eclipse-content-swipe-in-right");d.swipe(g);f=a.currentPageIdx=k();r();t=!1;h&&h(a)})});return!0}}else throw"Page index must be numberic.";else throw"Must provide page index to change to.";return!1};this.disableYScroll=function(){d.css("overflow-y","hidden")};
this.enableYScroll=function(){d.css("overflow-y","")};this.onHeaderChange=function(a){"function"===typeof a&&(G=a)};this.onMDLComplete=function(a){"function"===typeof a&&(C=a,K&&(K=!1,C()))};this.getCurrentPageIndex=function(){return k()};this.getHeaderHeight=function(){if(F)return 0;var a=N.outerHeight(!0)/2;return b.outerHeight(!0)+a};this.getFooterHeight=function(){return F?0:q.outerHeight(!0)};this.getPages=function(){return e};this.disableSwipe=function(a){"undefined"===typeof a?u():"number"===
typeof a?x.push(a):"object"===typeof a?Array.isArray(a)&&typeof("number"===a[0])?x=x.concat(a):u():u()};this.enableSwipe=function(){x.length=0;setSwipeOn()};this.getPageIndex=function(){return k()};this.onPageChange=function(a){if(a)"function"===typeof a&&(h=a);else throw"Invalid input to onPageChange.";};this.onBeforePageChange=function(a){if(a)"function"===typeof a&&(n=a);else throw"Invalid input to onPageChange.";};this.toggleHeaderFooter=function(a){if(void 0!==a){if(a)return p(),!0;A();return!1}if(b.hasClass("eclipse-header-transition"))A();
else return p(),!0;return!1};this.showSpinner=function(){J.removeClass("is-active");J.addClass("is-active")};this.hideSpinner=function(){J.removeClass("is-active");J.addClass("zero-height")};this.isHeaderFooterShown=function(){return!F};this.isDrawerOpen=function(){return v.hasClass("is-visible")};this.onDrawerOpen=function(a){v.transitionEnd(function(b){this.isDrawerOpen()&&a(b)}.bind(this))};this.onDrawerClosed=function(a){v.transitionEnd(function(b){this.isDrawerOpen()||a(b)}.bind(this))};this.onWindowResize=
function(a){M=a};this.toggleDrawer=function(){m.MaterialLayout.toggleDrawer()};this.spinBackDrawerButton=function(){c&&(c.hasClass("eclipse-rotate-drawer-button")?(c.removeClass("eclipse-rotate-drawer-button"),c.transitionEndOne(function(){c.clickOff();c.children("i").html("menu")})):(c.addClass("eclipse-rotate-drawer-button"),c.clickOne(function(){m.MaterialLayout.toggleDrawer();console.log("Drawer open prevented.");c.removeClass("eclipse-rotate-drawer-button");c.transitionEndOne(function(){c.children("i").html("menu")})}),
c.transitionEndOne(function(){c.children("i").html("arrow_forward")})))};this.unSpinDrawerButton=function(){c.hasClass("eclipse-rotate-drawer-button")&&(c.removeClass("eclipse-rotate-drawer-button"),c.transitionEndOne(function(){c.clickOff();c.children("i").html("menu")}))};this.isDrawerButtonSpun=function(){return c.hasClass("eclipse-rotate-drawer-button")?!0:!1}},DialogBox=function(k,r,D,u){function y(){try{g[0].close(),document.querySelector(".mdl-list").style.overflowY="auto",document.querySelector(".mdl-list").style.overflowY=
"",l.clickOff(),p.clickOff()}catch(b){console.log("Dialog box already closed.")}}var g=$("#diag"),l=$("#ok_button"),p=$("#close_button"),A=$("#diag_title"),B=$("#diag_description"),m=null,d=null;componentHandler.upgradeElement(g[0]);g[0].showModal||dialogPolyfill.registerDialog(g[0]);g.css("background-color","white");A.html("Error");B.html("An error occured.");l.html("OK");p.html("Close");l.show();p.show();k&&A.html(k);r&&B.html(r);D&&l.html(D);u&&p.html(u);l.click(function(b){console.log("OK close called.");
y();if(m)return m(b)});p.click(function(b){console.log("CLOSE close called.");y();if(d)return d(b)});this.close=function(){y()};this.hideOKButton=function(){l.hide()};this.hideCloseButton=function(){p.hide()};this.show=function(){l.focus();try{g[0].show()}catch(b){console.log("Show dialog already called.")}};this.showModal=function(){try{g[0].showModal()}catch(b){console.log("Dialog already open.")}};this.setTitleText=function(b){A.html(b)};this.setDescriptionText=function(b){B.html(b)};this.setOKCallBack=
function(b){m=b};this.setOKText=function(b){l.html(b)};this.setCloseCallBack=function(b){d=b};this.setCloseText=function(b){p.html(b)}};