/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

class MaterialAddons 
{
    constructor()
    {
        var DRAWER_SWIPE_TRIGGER = 0.15;
        var TAB_SWIPE_TRIGGER = 0.5;
        
        // var layOut = document.querySelector('.mdl-layout');
        var layOut = document.querySelector('#main-content');
        var mainPage = $("#app-content");
        var header = $("header");
        var tableBar = $("#table-bar");
        var footer = $("footer");
        
        var privPages = $("section");    
        var privTabs = $("header a");
        var appDrawer = $(".mdl-layout__drawer");
        
        var spinner = $(".mdl-spinner");
        
        var drawerButton;
                
        var drawerToggleCalled = false;
        var screenWidth = geContentWidth();
        var pageIndex = getCurrentPageIndex();
        var swipeOccurring = false;
        var swipeOff = false;
        var ignorePageChange = false;
        
        var headerChangeCallBack = null;
        var mdlCompleteCallBack = null;
        var mdlCompleteCallOnRegister = false;
        var zeroHeaderFooter = false;        
        
        var disabledPages = [];
        
        var windowResizeFunc = null;
        var changePageFunc = null;
        var beforePageChangeFunc = null;
        
        mdlFinishedUpgrades();
        addCustomScroller();
        bindEvents();
                       
        function addCustomScroller()
        {
            var userStr = navigator.userAgent.toLowerCase();
            
            if((userStr.indexOf("windows") > -1 || userStr.indexOf("macintosh") > -1) || (userStr.indexOf("linux") > -1 && userStr.indexOf("android") === -1))
            {
                console.log("Running on desktop browser.");
                $("head").append("<style>::-webkit-scrollbar{ width: 9px; height: 9px;} ::-webkit-scrollbar-thumb { background: #ccc;}</style>");
            }
            else
            {
                console.log("Running on mobile browser.");
            }
        }
        
        function getPages()
        {
            return privPages;
        }
        
        function getCurrentPageIndex()
        {
            return $("section.is-active").index();
        }
        
        function getPageCount()
        {
            return $("section").toArray().length;
        }
        
        function onTabClick(event)
        {
            var idx = $(this).index();
            
            console.log("Tab click fired.");
            
            if(idx !== pageIndex)
            {
                if(!ignorePageChange)
                {
                    onBeforePageChange(event);
                    var changePageCapture = window.setTimeout(function()
                    {
                        privPages.transitionOrAnimationOff();
                        pageIndex = idx;
                        checkIfDisabled();
                        if(changePageFunc)
                        {
                            event.currentPageIdx = idx;
                            changePageFunc(event);
                        }
                        console.log("No page change animation called.");
                    }, 500);
                    
                    privPages.transitionOrAnimationOne(function()
                    {
                        window.clearTimeout(changePageCapture);
                        privPages.transitionOrAnimationOff();
                        pageIndex = idx;
                        checkIfDisabled();
                        if(changePageFunc)
                        {
                            event.currentPageIdx = idx;
                            changePageFunc(event);
                        }
                        console.log("Section transistion or animation called.");
                    });
                }                
            }
            
            ignorePageChange = false;
        }
        
        function onBeforePageChange(event)
        {
            if(beforePageChangeFunc)
            {
                beforePageChangeFunc(event);
            }
        }
        
        function checkIfDisabled()
        {
            if(swipeOff)
            {
                swipeOn();
            }
            for(var idx = 0; idx < disabledPages.length; idx++)
            {
                if(disabledPages[idx] === pageIndex)
                {
                    setSwipeOff();
                }
            }
        }
        
        function swipeOn()
        {
            mainPage.swipe(onSwipe);
            mainPage.touchEnd(onTouchEnd);
            swipeOff = false;
        }
        
        function setSwipeOff()
        {
            mainPage.swipeOff();
            mainPage.touchEndOff();
            swipeOff = true;
            onTouchEnd();
        }
    
        function bindEvents()
        {
            console.log("Binding material addon events.");
            $( window ).resize(onResize);
            swipeOn();
            privTabs.click(onTabClick);
            appDrawer.swipe(onDrawerSwipe);
        }
        
        function onDrawerSwipe(event)
        {
            if(event.swipeType === "left")
            {
                appDrawer.swipeOff();
                layOut.MaterialLayout.toggleDrawer();
                console.log("Drawer swipe left.");
                appDrawer.transitionEndOne(function(ev)
                {
                    // mainPage.click();
                    appDrawer.swipe(onDrawerSwipe);
                    console.log("Drawer swipe listener back on.");
                });
            }
        }
    
        function onSwipe(event)
        {
            if(event.swipeType === "right")
            {
                if(event.startX < (DRAWER_SWIPE_TRIGGER * screenWidth)) // Very close to left side of screen, open nav drawer.
                {
                    if(!drawerToggleCalled)
                    {
                        mainPage.swipeOff();
                        drawerToggleCalled = true;
                        console.log("Calling drawer trigger");
                        mainPage.touchEndOne(function(event)
                        {
                            console.log("Drawer trigger");
                            layOut.MaterialLayout.toggleDrawer();
                            drawerToggleCalled = false;
                            mainPage.swipe(onSwipe);
                        });
                    }
                }
                else
                {
                    if(pageIndex > 0)
                    {
                        $(privPages[pageIndex]).offset({left: event.distX});
                        if ((Math.abs(event.distX) > (screenWidth * TAB_SWIPE_TRIGGER)) && !swipeOccurring)
                        {
                            mainPage.swipeOff();
                            swipeOccurring = true;

                            var currentPage = $(privPages[pageIndex]).children("div.page-content");
                            var nextPage = $(privPages[pageIndex - 1]).children("div.page-content");

                            currentPage.addClass("eclipse-content-swipe-out-right");

                            currentPage.animationEndOne(function (event)
                            {
                                currentPage.removeClass("eclipse-content-swipe-out-right");
                                nextPage.addClass("eclipse-content-swipe-in-right");
                                ignorePageChange = true;
                                privTabs[pageIndex - 1].click();
                                $(privPages[pageIndex]).css("left", "");
                                onBeforePageChange(event);
                                nextPage.animationEndOne(function (event)
                                {
                                    nextPage.removeClass("eclipse-content-swipe-in-right");
                                    mainPage.swipe(onSwipe);
                                    pageIndex = event.currentPageIdx = getCurrentPageIndex();
                                    checkIfDisabled();
                                    
                                    if(changePageFunc)
                                    {                                        
                                        changePageFunc(event);
                                    }
                                });
                            });
                        }
                    }
                }
            }
            else if(event.swipeType === "left")
            {
                if(pageIndex < (privPages.length - 1))
                {
                    $(privPages[pageIndex]).offset({left: event.distX});
                    if((Math.abs(event.distX) > (screenWidth * TAB_SWIPE_TRIGGER)) && !swipeOccurring )
                    {
                        mainPage.swipeOff();
                        swipeOccurring = true;
                        
                        var currentPage = $(privPages[pageIndex]).children("div.page-content");
                        var nextPage = $(privPages[pageIndex + 1]).children("div.page-content");
                        
                        currentPage.addClass("eclipse-content-swipe-out-left");
                        
                        currentPage.animationEndOne(function(event)
                        {
                            currentPage.removeClass("eclipse-content-swipe-out-left");
                            nextPage.addClass("eclipse-content-swipe-in-left");
                            ignorePageChange = true;
                            privTabs[pageIndex + 1].click();
                            $(privPages[pageIndex]).css("left", "");
                            beforePageChangeFunc(event);
                            nextPage.animationEndOne(function(event)
                            {                            
                                nextPage.removeClass("eclipse-content-swipe-in-left");
                                mainPage.swipe(onSwipe);
                                
                                pageIndex = event.currentPageIdx = getCurrentPageIndex();
                                checkIfDisabled();
                                
                                if(changePageFunc)
                                {                                   
                                    changePageFunc(event);
                                }
                            });
                        });
                    }
                }
            }
        }
        
        function onTouchEnd()
        {
            console.log("Touch ended.");
            privPages.css({ position: '' }); // Delete position value if it was used during swipe event.
            drawerToggleCalled = false;
            swipeOccurring = false;
        }
        
        function onResize(event)
        {
            console.log("Material window resize called.");
            screenWidth = geContentWidth();
            
            if(windowResizeFunc)
            {
                windowResizeFunc(event);
            }               
        }
    
        function geContentWidth()
        {
            return $(window).width();
        }
        
        function showHeaderFooter()
        {
            footer.show();
            if(!header.hasClass("eclipse-header-transition"))
            {
                header.addClass("eclipse-header-transition");
            }
            if(!footer.hasClass("eclipse-footer-transition"))
            {
                footer.addClass("eclipse-footer-transition");
            }
            footer.transitionEndOff();            
            zeroHeaderFooter = false;            
            if(headerChangeCallBack)
            {
                footer.transitionEndOne(headerChangeCallBack);
            }            
        }
        
        function removeHeaderFooter()
        {
            zeroHeaderFooter = true;
            if(headerChangeCallBack)
            {
                headerChangeCallBack();
            }
            
            footer.transitionEndOff();
            footer.transitionEndOne(function(event)
            {
                console.log("Footer change.");
                footer.hide();                
            });
            
            header.removeClass("eclipse-header-transition");
            footer.removeClass("eclipse-footer-transition");
        }
        
        function initDrawerButtonUpgrades()
        {
            drawerButton =  $("#main-header").children("div.mdl-layout__drawer-button");
            drawerButton.addClass("eclipse-drawer-button");
        }
        
        /*
         * We use this function to modify anything after MDL has finished processing upgrades
         * This keeps the app drawer button from creating a border when focused by the browser.
         * @returns {undefined}
         */
        function mdlFinishedUpgrades()
        {
            if(!layOut.classList.contains("is-upgraded"))  // TODO: Ensure this works in all reload cases, may have seen cache bug in old Chrome version?
            {
                // select the target node
                var markUpsComplete = false;
                var target = layOut;

                // create an observer instance
                var initObserver = new MutationObserver(function(mutations) 
                {
                    initObserver.disconnect();
                    console.log("MDL mutations found: " + mutations.length);
                    if(mutations.length > 0)
                    {
                        if(!markUpsComplete)
                        {
                            markUpsComplete = true; // To ensure we only do this once.
                            initDrawerButtonUpgrades();
                            // showHeaderFooter();
                            if(mdlCompleteCallBack)
                            {
                                mdlCompleteCallBack();
                            }
                            else
                            {
                                mdlCompleteCallOnRegister = true;
                            }
                        }
                    }
                });

                // configuration of the observer:
                var initConfig = {attributes: true};

                // pass in the target node, as well as the observer options
                initObserver.observe(target, initConfig);
            }
            else
            {
                console.log("MDL already upgraded.");
                initDrawerButtonUpgrades();
                if(mdlCompleteCallBack)
                {
                    console.log("Callback to MDL complete.");
                    window.setTimeout(mdlCompleteCallBack, 1);
                }
                else
                {
                    mdlCompleteCallOnRegister = true;
                }
            }
            
        }
        
        /* Change page to index provided.
         * Returns true upon success.
         * @param {Number} idx -- The page index to change to.
         * @returns {Boolean}
         */
        this.changePage = function(idx)
        {
            if(idx)
            {
                if(typeof(idx) === 'number')
                {
                    var currentPage = getCurrentPageIndex();
                    if(idx !== currentPage)
                    {
                        if(idx > 0 && idx < getPageCount())
                        {
                            if(idx > currentPage)
                            {
                                mainPage.swipeOff();
                                swipeOccurring = true;

                                var currentPage = $(privPages[currentPage]).children("div.page-content");
                                var nextPage = $(privPages[idx]).children("div.page-content");

                                currentPage.addClass("eclipse-content-swipe-out-left");

                                currentPage.animationEndOne(function(event)
                                {
                                    currentPage.removeClass("eclipse-content-swipe-out-left");
                                    nextPage.addClass("eclipse-content-swipe-in-left");
                                    ignorePageChange = true;
                                    privTabs[idx].click();
                                    onBeforePageChange(event);
                                    nextPage.animationEndOne(function(event)
                                    {                            
                                        nextPage.removeClass("eclipse-content-swipe-in-left");
                                        mainPage.swipe(onSwipe);
                                        
                                        pageIndex = event.currentPageIdx = getCurrentPageIndex();
                                        checkIfDisabled();
                                        swipeOccurring = false;
                                        
                                        if(changePageFunc)
                                        {
                                            changePageFunc(event);
                                        }
                                    });
                                });
                            }
                            else
                            {
                                mainPage.swipeOff();
                                swipeOccurring = true;

                                var currentPage = $(privPages[currentPage]).children("div.page-content");
                                var nextPage = $(privPages[idx]).children("div.page-content");

                                currentPage.addClass("eclipse-content-swipe-out-right");

                                currentPage.animationEndOne(function (event)
                                {
                                    currentPage.removeClass("eclipse-content-swipe-out-right");
                                    nextPage.addClass("eclipse-content-swipe-in-right");
                                    ignorePageChange = true;
                                    privTabs[idx].click();
                                    onBeforePageChange(event);
                                    nextPage.animationEndOne(function (event)
                                    {
                                        nextPage.removeClass("eclipse-content-swipe-in-right");
                                        mainPage.swipe(onSwipe);
                                        
                                        pageIndex = event.currentPageIdx = getCurrentPageIndex();
                                        checkIfDisabled();
                                        swipeOccurring = false;
                                        
                                        if(changePageFunc)
                                        {                                            
                                            changePageFunc(event);
                                        }
                                    });
                                });                                
                            }
                            return true;
                        }
                    }                    
                }
                else
                {
                    throw "Page index must be numberic.";
                }
            }
            else
            {
                throw "Must provide page index to change to.";
            }
            return false;
        };
        
        this.disableYScroll = function()
        {
            mainPage.css('overflow-y', 'hidden');
        };
        
        this.enableYScroll = function()
        {
            mainPage.css('overflow-y', "");
        };
        
        this.onHeaderChange = function(func)
        {
            if(typeof(func) === "function")
            {
                headerChangeCallBack = func;
            }
        };
        
        this.onMDLComplete = function(func)
        {
            if(typeof(func) === "function")
            {
                mdlCompleteCallBack = func;
                
                if(mdlCompleteCallOnRegister)
                {
                    mdlCompleteCallOnRegister = false;
                    mdlCompleteCallBack();
                }
            }
        };
        
        this.getCurrentPageIndex = function()
        {
            return getCurrentPageIndex();
        };
        
        this.getHeaderHeight = function()
        {
            if(zeroHeaderFooter)
                return 0;
            
            var barHeight = tableBar.outerHeight(true) / 2;
            
            return (header.outerHeight(true) + barHeight);
        };
        
        this.getFooterHeight = function()
        {
            if (zeroHeaderFooter) 
                return 0;
            return footer.outerHeight(true);
        };
        
        this.getPages = function()
        {
            return privPages;
        };
        
        this.disableSwipe = function(pages)
        {
            if(typeof(pages) === "undefined")
            {
                setSwipeOff();
            }
            else if(typeof(pages) === "number")
            {
                disabledPages.push(pages);
            }
            else if(typeof(pages) === "object")
            {
                if(Array.isArray(pages) && typeof(pages[0] === "number"))
                {
                    disabledPages = disabledPages.concat(pages);
                }
                else
                {
                    setSwipeOff();
                }
            }
            else
            {
                setSwipeOff();
            }
        };
        
        this.enableSwipe = function()
        {
            disabledPages.length = 0;
            setSwipeOn();
        };
        
        this.getPageIndex = function()
        {
            return getCurrentPageIndex();
        };
        
        this.onPageChange = function(func)
        {
            if(func)
            {
                if(typeof(func) === 'function')
                {
                    changePageFunc = func;
                }
            }
            else
            {            
                throw "Invalid input to onPageChange.";
            }
        };
        
        this.onBeforePageChange = function(func)
        {
            if(func)
            {
                if(typeof(func) === 'function')
                {
                    beforePageChangeFunc = func;
                }
            }
            else
            {            
                throw "Invalid input to onPageChange.";
            }
        };
        
        /* Show or hides the header and footer, returns false if removed, else true.
         * @returns {Boolean}
         */
        this.toggleHeaderFooter = function(forceShow)
        {            
            if(forceShow !== undefined)
            {
                if(forceShow)
                {
                    showHeaderFooter();
                    return true;
                }
                else
                {
                    removeHeaderFooter();
                    return false;
                }
            }
            
            if(header.hasClass("eclipse-header-transition"))
            {
                removeHeaderFooter();
                return false;
            }
            else
            {
                showHeaderFooter();
                return true;
            }
            
           return false; 
        };
        
        this.showSpinner = function()
        {
            spinner.removeClass("is-active");
            spinner.addClass("is-active");           
        };
        
        this.hideSpinner = function()
        {
            spinner.removeClass("is-active");
            spinner.addClass("zero-height");
        };
        
        this.isHeaderFooterShown = function()
        {
            return !zeroHeaderFooter;            
        };
        
        /* Tests whether the app drawer is open/visible.
         * @returns {Boolean} 
         */
        this.isDrawerOpen = function()
        {
            return appDrawer.hasClass("is-visible");            
        };
        
        /* Fired when drawer is opened.
         * @param {Function} callback  -- Function to be called when drawer is opened.
         * @returns {Undefined}  
         */
        this.onDrawerOpen = function(callback)
        {
            appDrawer.transitionEnd((function(event)
            {
                if(this.isDrawerOpen())
                {
                    callback(event);
                }
            }).bind(this));
        };
        
        /* Fired when drawer is closed.
         * @param {Function} callback  -- Function to be called when drawer is closed.
         * @returns {Undefined}  
         */
        this.onDrawerClosed = function(callback)
        {
            appDrawer.transitionEnd((function(event)
            {
                if(!this.isDrawerOpen())
                {
                    callback(event);
                }
            }).bind(this));
        };
        
        /*
         * Input event callback function to be called upon window resize.
         * Called only after all material markups have been completed.
         * @param {Function(event)} callback
         * @returns {undefined}
         */
        this.onWindowResize = function(callback)
        {
            windowResizeFunc = callback;
        };
        
        /* Toggle app nav drawer open or close.
         * @returns {Undefined} 
         */
        this.toggleDrawer = function()
        {
            layOut.MaterialLayout.toggleDrawer();
        };
        
        this.spinBackDrawerButton = function()
        {
            if(drawerButton)
            {
                if(!drawerButton.hasClass("eclipse-rotate-drawer-button"))
                {
                    drawerButton.addClass("eclipse-rotate-drawer-button");
                    
                    drawerButton.clickOne(function()
                    {
                        layOut.MaterialLayout.toggleDrawer();
                        
                        console.log("Drawer open prevented.");
                        
                        drawerButton.removeClass("eclipse-rotate-drawer-button");
                        drawerButton.transitionEndOne(function()
                        {
                            drawerButton.children("i").html("menu");
                        }); 
                    });

                    drawerButton.transitionEndOne(function()
                    {
                        drawerButton.children("i").html("arrow_forward");
                    });
                }
                else
                {
                    drawerButton.removeClass("eclipse-rotate-drawer-button");
                    drawerButton.transitionEndOne(function()
                    {
                        drawerButton.clickOff();
                        drawerButton.children("i").html("menu");
                    });
                }
            }
        };
        
        this.unSpinDrawerButton = function()
        {
            if(drawerButton.hasClass("eclipse-rotate-drawer-button"))
            {
                drawerButton.removeClass("eclipse-rotate-drawer-button");
                drawerButton.transitionEndOne(function()
                {
                    drawerButton.clickOff();
                    drawerButton.children("i").html("menu");
                });
            }            
        };
        
        this.isDrawerButtonSpun = function()
        {
            if(drawerButton.hasClass("eclipse-rotate-drawer-button"))
            {
                return true;
            } 
            
            return false;
        };
    
    }
    
    get getSomePages()
    {
        return this.getPages();
    }
};


/* Create a dialog box
 * @param {String} title -- The title of the Dialog Box.
 * @param {String} description -- Description field of dialog box. 
 * @param {String} okText -- Text for OK button
 * @param {String} cancelText -- Text for close button   
 * @type Object
 */
class DialogBox
{
    constructor(/* String */ title, /* String */ description, /* String */ okText, /* String */ closeText)
    {
        var dialog = $('#diag');
        var okButton = $("#ok_button");
        var closeButton = $("#close_button");
        var diagTitle = $("#diag_title");
        var diagDescription = $("#diag_description");
        var okCallBack = null;
        var closeCallBack = null;
        
        componentHandler.upgradeElement(dialog[0]);
        
        if (!dialog[0].showModal)
        {
            dialogPolyfill.registerDialog(dialog[0]);
        }
        
        resetState();
                
        if(title)
        {
            diagTitle.html(title);
        }
        if(description)
        {
            diagDescription.html(description);
        }
        if(okText)
        {
            okButton.html(okText);
        }
        if(closeText)
        {
            closeButton.html(closeText);
        }
        
        function close()
        {
            try
            {
                dialog[0].close();

                // Dialog.close() Bug fix see: https://github.com/google/material-design-lite/issues/4328
                // TODO: Remove with MDL 2.x.x
                // document.querySelector('.mdl-layout__content').style.overflowY = 'auto';
                // document.querySelector('.mdl-layout__content').style.overflowY = '';
                document.querySelector('.mdl-list').style.overflowY = 'auto';
                document.querySelector('.mdl-list').style.overflowY = '';

                okButton.clickOff();
                closeButton.clickOff();
            }
            catch(error)
            {
                console.log("Dialog box already closed.");
            }
        }
        
        function resetState()
        {
            dialog.css("background-color", "white");
            diagTitle.html("Error");
            diagDescription.html("An error occured.");
            okButton.html("OK");
            closeButton.html("Close");
            
            okButton.show();
            closeButton.show();
        }
        
        okButton.click(function(event)
        {
            console.log("OK close called.");
            close();
            if(okCallBack)
            {
                return okCallBack(event);
            }
        });
        
        closeButton.click(function(event)
        {
            console.log("CLOSE close called.");
            close();
            if(closeCallBack)
            {
                return closeCallBack(event);
            }
        });
        
        this.close = function()
        {
            close();
        };
        
        this.hideOKButton = function()
        {
            okButton.hide();
        };
        
        this.hideCloseButton = function()
        {
            closeButton.hide();
        };
        
        this.show = function()
        {
            dialog[0].show();
        };
        
        this.showModal = function()
        {
            dialog[0].showModal();
        };
        
        this.setTitleText = function(/* String */ text)
        {
            diagTitle.html(text);
        };
        
        this.setDescriptionText = function(/* String */ text)
        {
           diagDescription.html(text); 
        };
        
        this.setOKCallBack = function(callback)
        {
            okCallBack = callback;
        };
        
        this.setOKText = function(/* String */ text)
        {
            okButton.html(text);
        };
        
        this.setCloseCallBack = function(callback)
        {
            closeCallBack = callback;            
        };
        
        this.setCloseText = function (/* String */ text)
        {
           closeButton.html(text); 
        };
    }
};

