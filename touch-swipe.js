/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

jQuery.fn.extend(
{
    mdlUpgraded: function(callback)
    {
        return $(this).on("mdl-componentupgraded", callback);
    },
    
    animationEndOne: function(callback)
    {
        return $(this).one("animationend", callback);
    },
    
    animationEnd: function(callback)
    {
        return $(this).on("animationend", callback);
    },
    
    animationStart: function(callback)
    {
        return $(this).on("animationstart", callback);
    },
    
    clickOff: function(callback)
    {
        return $(this).off("click", callback);
    },
    
    clickOne: function(callback)
    {
        return $(this).one("click", callback);
    },
    
    longPress: function(callback)
    {
        var pressTimer = null;
        var fn = callback;
         var startX = 0,
            startY = 0,
            distX = 0,
            distY = 0,
            currentX = 0,
            currentY = 0;
        var MOVE_THRESHOLD = 20;
        
        $(this).on("touchend mouseup", function(event)
        {
            if(pressTimer)
            {
                window.clearTimeout(pressTimer);
                pressTimer = null;
            }
        });
        
        $(this).on("touchstart mousedown", function(event)
        {
            if(event.type === "mousedown")
            {
                startX = event.pageX;
                startY = event.pageY;
            }
            else
            {
                startX = event.changedTouches[0].pageX;
                startY = event.changedTouches[0].pageY;
            }
            
            // Cancel the longpress if there is movement.
            $(this).on("touchmove mousemove", function(event)
            {
                if(event.type === "mousemove")
                {
                    currentX = event.pageX;
                    currentY = event.pageY;
                }
                else
                {
                    currentX = event.changedTouches[0].pageX;
                    currentY = event.changedTouches[0].pageY;
                }
            
                distX = currentX - startX;
                distY = currentY - startY;
                
                if(Math.abs(distX) > MOVE_THRESHOLD || Math.abs(distY) > MOVE_THRESHOLD)
                {
                    $(this).off("touchmove mousemove");
                    
                    if(pressTimer)
                    {   
                        window.clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                }
            });
            
            $(this).one("touchend mouseup", function(event)
            {
                $(this).off("touchmove mousemove");
                if(pressTimer)
                {   
                    window.clearTimeout(pressTimer);
                    pressTimer = null;
                }
            });
            
            if(pressTimer)
            {
                window.clearTimeout(pressTimer);
                pressTimer = null;
            }
            pressTimer = window.setTimeout(function()
            {
                $(this).off("touchmove mousemove");
                console.log("Long press fired.");
                fn(event);
            }, 1000);
        });
    },
    
    longPressOff: function(callback)
    {
        $(this).off("touchmove mousemove");
        $(this).off("touchend mouseup", callback);
        return $(this).off("touchstart mousedown", callback);
    },
    
    transitionEndOne: function(callback)
    {
        return $(this).one("transitionend", callback);
    },
    
    transitionEnd: function(callback)
    {
        return $(this).on("transitionend", callback);
    },
    
    touchStart: function(callback) 
    {
        return $(this).on("touchstart mousedown", callback);
    },
  
    touchEnd: function(callback) 
    {
        return $(this).on("touchend mouseup", callback);
    },
    
    touchEndOff: function(callback) 
    {
        return $(this).off("touchend mouseup", callback);
    },
    
    touchEndOne: function(callback) 
    {
        return $(this).one("touchend mouseup", callback);
    },
    
    touchMove: function(callback) 
    {
        var fn = callback;
        $(this).on("touchmove", fn);
        $(this).mousedown(function(event)
        {
            if(event.which === 1)
            {
                $(this).mousemove(fn);
            }
        });
         
        $(this).mouseup(function(event)
        {
            $(this).off("mousemove");
        });        
        
        return $(this);
    },
    
    swipe: function(callback) 
    {
        var fn = callback;
        var startX = 0,
            startY = 0,
            distX = 0,
            distY = 0,
            currentX = 0,
            currentY = 0;
        var swipeType = "none";
        var SWIPE_THRESHOLD = 50;
    
        $(this).touchStart(function(event)
        {
            console.log("Touch is starting");
            if(event.type === "mousedown")
            {
                startX = event.pageX;
                startY = event.pageY;
            }
            else
            {
                startX = event.changedTouches[0].pageX;
                startY = event.changedTouches[0].pageY;
            }
        });
            
        $(this).touchMove(function(event)
        {
            if(event.type === "mousemove")
            {
                currentX = event.pageX;
                currentY = event.pageY;
            }
            else
            {
                currentX = event.changedTouches[0].pageX;
                currentY = event.changedTouches[0].pageY;
            }
            
            distX = currentX - startX;
            distY = currentY - startY;
            
            if(Math.abs(distY) > Math.abs(distX))
            {
                if(distY > 0)
                {
                    swipeType = "down";
                }
                else
                {
                    swipeType = "up";
                }
            }
            else
            {
                if(distX > 0)
                {
                    swipeType = "right";
                }
                else
                {
                    swipeType = "left";
                }
            }
            
            if(Math.abs(distY) > SWIPE_THRESHOLD || Math.abs(distX) > SWIPE_THRESHOLD)
            {
                event.swipeType = swipeType;
                event.distX = distX;
                event.distY = distY;
                event.swipeX = currentX;
                event.swipeY = currentY;
                event.startX = startX;
                event.startY = startY;
                fn(event);
            }
        });
        
        return $(this);
    },
    
    swipeOff: function(callback) 
    {
        return $(this).off("touchstart mousedown mouseup mousemove touchmove", callback);
    }
});

