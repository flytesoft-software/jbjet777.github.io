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
        var START_DELAY = 300;
        
        var layOut = document.querySelector('.mdl-layout');;
        var mainPage = $("main");
        var header = $("header");
        var footer = $("footer");
        var mapButtons = $("#map-buttons");
        var privPages = $("section");    
        var privTabs = $("header a");
        var appDrawer = $(".mdl-layout__drawer");
        
        var spinner = $(".mdl-spinner");
                
        var drawerToggleCalled = false;
        var screenWidth = geContentWidth();
        var pageCount = getPageCount();
        var pageIndex = getCurrentPageIndex();
        var swipeOccurring = false;
        var swipeOff = false;
        
        var disabledPages = [];
        
        var nav = navigator;
        
        addCustomScroller();
        bindEvents();
        delayedStart();
        
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
        
        function delayedStart()
        {
            // TODO: FIXME: This is a hacky fix, want to know when entire DOM has been MDL upgraded.
            window.setTimeout(function()
            {
                showHeaderFooter();
            }, START_DELAY);
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
            var target =  $(this).attr("href").slice(1);
                        
            for(var idx = 0; idx < privPages.toArray().length; idx++)
            {
                if(privPages[idx].id === target)
                {
                    break;
                }
            }
            
            if(idx === privPages.toArray().length)
            {
                idx = 0;
            }
                       
            pageIndex = idx;
            checkIfDisabled();
            console.log("Click fired.  Index: " + pageIndex);
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
            $( window ).resize(onResize);
            swipeOn();
            privTabs.click(onTabClick);
            appDrawer.swipe(onDrawerSipe);
        }
        
        function onDrawerSipe(event)
        {
            if(event.swipeType === "left")
            {
                layOut.MaterialLayout.toggleDrawer();
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
                            console.log("RIGHT half way!");
                            swipeOccurring = true;

                            var currentPage = $(privPages[pageIndex]).children("div.page-content");
                            var nextPage = $(privPages[pageIndex - 1]).children("div.page-content");

                            currentPage.addClass("eclipse-content-swipe-out-right");

                            currentPage.animationEndOne(function (event)
                            {
                                console.log("First animation ended.");
                                currentPage.removeClass("eclipse-content-swipe-out-right");
                                nextPage.addClass("eclipse-content-swipe-in-right");
                                privTabs[pageIndex - 1].click();
                                nextPage.animationEndOne(function (event)
                                {
                                    console.log("Second animation ended.");
                                    nextPage.removeClass("eclipse-content-swipe-in-right");
                                    mainPage.swipe(onSwipe);
                                    checkIfDisabled();
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
                        console.log("LEFT half way!");
                        swipeOccurring = true;
                        
                        var currentPage = $(privPages[pageIndex]).children("div.page-content");
                        var nextPage = $(privPages[pageIndex + 1]).children("div.page-content");
                        
                        currentPage.addClass("eclipse-content-swipe-out-left");
                        
                        currentPage.animationEndOne(function(event)
                        {
                            console.log("First animation ended.");
                            currentPage.removeClass("eclipse-content-swipe-out-left");
                            nextPage.addClass("eclipse-content-swipe-in-left");
                            privTabs[pageIndex + 1].click();
                            nextPage.animationEndOne(function(event)
                            {                            
                                console.log("Second animation ended.");
                                nextPage.removeClass("eclipse-content-swipe-in-left");
                                mainPage.swipe(onSwipe);
                                checkIfDisabled();
                            });
                        });
                    }
                }
            }
        }
        
        function onToggleClick(event)
        {
            console.log("Toggle click fired.");
            if(header.hasClass("eclipse-header-transition"))
            {
                removeHeaderFooter();
            }
            else
            {
                showHeaderFooter();
            }            
        }
        
        function onTouchEnd()
        {
            console.log("Touch ended.");
            privPages.css({ position: '' }); // Delete position value if it was used during swipe event.
            drawerToggleCalled = false;
            swipeOccurring = false;
        }
        
        function onResize()
        {
            console.log("Resize called");
            screenWidth = geContentWidth();
        }
    
        function geContentWidth()
        {
            return $(window).width();
        }
        
        function showHeaderFooter()
        {
            header.addClass("eclipse-header-transition");  
            header.removeClass("header-shrink");
            
            footer.addClass("eclipse-footer-transition");
            footer.removeClass("header-shrink");
            
            mapButtons.addClass("eclipse-map-button-placement-transition");
        }
        
        function removeHeaderFooter()
        {
            header.removeClass("eclipse-header-transition");
            header.addClass("header-shrink");
            
            footer.removeClass("eclipse-footer-transition");
            footer.addClass("header-shrink");
            
            mapButtons.removeClass("eclipse-map-button-placement-transition");
        }
        
        this.onHeaderChange = function(func)
        {
            header.transitionEnd(function(event)
            {
                func(event);
            });
            
            footer.transitionEnd(function(event)
            {
                func(event);
            });
        };
        
        this.getHeaderHeight = function()
        {
            return header.height();
        };
        
        this.getFooterHeight = function()
        {
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
        
        this.enableHideHeader = function(pages)
        {
            this.disableHideHeader();
            
            if(typeof(pages) === "undefined")
            {
                privPages.longPress(onToggleClick);
            }
            else if(typeof(pages) === "number")
            {
                $(privPages[pages]).longPress(onToggleClick);
            }
            else if(typeof(pages) === "object")
            {
                if(Array.isArray(pages))
                {
                    pages.forEach(function(item)
                    {
                        if(typeof(item) === "number")
                        {
                            $(privPages[item]).longPress(onToggleClick);
                        }
                    });
                }
                else
                {
                    privPages.longPress(onToggleClick);
                }
            }
            else
            {
                privPages.longPress(onToggleClick);
            }
        };
        
        this.disableHideHeader = function()
        {
            privPages.longPressOff();
        };
        
        this.getPageIndex = function()
        {
            return getCurrentPageIndex();
        };
        
        this.onPageChange = function(func)
        {
            mainPage.animationEnd(function(event)
            {
                event.currentPageIdx = getCurrentPageIndex();
                func(event);
            });
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
        
        /* Toggle app nav drawer open or close.
         * @returns {Undefined} 
         */
        this.toggleDrawer = function()
        {
            layOut.MaterialLayout.toggleDrawer();
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
            dialog[0].close();
            
            // Dialog.close() Bug fix see: https://github.com/google/material-design-lite/issues/4328
            // TODO: Remove with MDL 2.x.x
            document.querySelector('.mdl-layout__content').style.overflowX = 'auto';
            document.querySelector('.mdl-layout__content').style.overflowX = '';
            
            okButton.clickOff();
            closeButton.clickOff();
        }
        
        function resetState()
        {
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
        
        this.hideOKButton = function()
        {
            okButton.hide();
        };
        
        this.hideCloseButton = function()
        {
            closeButton.hide();
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

