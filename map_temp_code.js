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
        var START_DELAY = 100;
        
        var layOut = document.querySelector('.mdl-layout');;
        var mainPage = $("main");
        var header = $("header");
        var footer = $("footer");
        var drawerToggleCalled = false;
        var screenWidth = geContentWidth();
        var pageCount = getPageCount();
        var pageIndex = getCurrentPageIndex();
        var swipeOccurring = false;
        var swipeOff = false;
               
        var privPages = $("section");    
        var privTabs = $("header a");
        
        var disabledPages = [];
        
        bindEvents();
        delayedStart();
        
        function delayedStart()
        {
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
        }
    
        function onSwipe(event)
        {
            // console.log("Screen: " + screenWidth + " Swiping: " + event.swipeType + " startX: " + event.startX + " startY: " + event.startY + " Current: " + event.swipeX + ", " + event.swipeY);
            
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
            $(privPages).removeAttr("style");
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
        }
        
        function removeHeaderFooter()
        {
            header.removeClass("eclipse-header-transition");
            header.addClass("header-shrink");
            
            footer.removeClass("eclipse-footer-transition");
            footer.addClass("header-shrink");
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
            return header.outerHeight(true);
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
    
    }
    
    get getSomePages()
    {
        return this.getPages();
    }
};

$(function()
{
    var MAP_PAGE_IDX = 1;
    var material = new MaterialAddons;
    
    var pages = material.getPages();
    var jMap = $("#map");
    var map = L.map('map');
    
    material.disableSwipe(1);
    material.enableHideHeader(1);
    
    var headerHeight = material.getHeaderHeight();
    var footerHeight = material.getFooterHeight();
    var screenHeight = $(window).height();
    var mapHeight = screenHeight - headerHeight - footerHeight;
    
    jMap.height(mapHeight);
    
    material.onPageChange(function(event)
    {
        if(MAP_PAGE_IDX === event.currentPageIdx)
        {
            map.invalidateSize();
            console.log("Map size change on page: " + event.currentPageIdx);
        }
    });
    
    material.onHeaderChange(function(even)
    {
        console.log("Header change.");
        headerHeight = material.getHeaderHeight();
        footerHeight = material.getFooterHeight();
        mapHeight = screenHeight - headerHeight - footerHeight;
        jMap.height(mapHeight);
        map.invalidateSize();
    });
    
    $(window).resize(function(event)
    {
        console.log("Window height change.");
        screenHeight = $(window).height();
        mapHeight = screenHeight - headerHeight - footerHeight;
        jMap.height(mapHeight); 
    });
    
    pages.each(function(index)
    {
        console.log("Page: " + this.id);
    });
    
    map.setView([34, -118], 4);
    
    
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

});


