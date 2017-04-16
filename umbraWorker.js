/*
 * umbraWorker.js
 * Author: Joshua Berlin
 * Creates a javaScript thread to produce (ant)umbral map points 
 * of the Moon's shadow on the Earth's surface.
 * Last Edit: 02-10-2017
 * 
 */

"use strict";

class UmbraWorker
{
    constructor()
    {
        importScripts("SolarElevation.js");
        importScripts("EclipseCalc.js");
        importScripts("arc.js");
        
        var mEclipse = null;
                     
        self.addEventListener('message', function (e)
        {
            // console.log("ANIMATER WORKER: Message recieved.");
            var data = e.data;
            switch (data.cmd)
            {
                case 'eclipse':
                    updateEclipse(data.eclipse);
                    break;
                case 'shadow':
                    drawShadow(data.time);
                    break;
                case 'real':
                    drawRealShadow(data.time);
                    break;
                default:
                    console.log("ANIMATE WORKER: Unkown command sent to worker.");
                    break;
            }
        }, false);
        
        function updateEclipse(msg)
        {
            mEclipse = new EclipseData(JSON.parse(msg));
        }
       
        function drawRealShadow(msg)    // TODO: Seperate out into different threads for more performance!
        {
            var eclipse = new EclipseData(JSON.parse(msg.eclipse));
            var dateOffset = parseInt(msg.dateOffset);
            var penumbraShadow = null;
            var umbraShadow = null;
            var penUmbraStartTime = eclipse.getPenumbraStartTime();
            var penUmbraEndTime = eclipse.getPenumbraEndTime();
            var isTotalorAnnular = false;
            var currentTime = null;

            if (eclipse.type === "Annular" ||
                    eclipse.type === "Total" ||
                    eclipse.type === "Hybrid")
            {
                isTotalorAnnular = true;
            }

            if (isTotalorAnnular)
            {
                var umbraStartTime = eclipse.getUmbraStartTime();
                var umbraEndTime = eclipse.getUmbraEndTime();
            }

            if (isNaN(dateOffset))
            {
                dateOffset = 0;
            }

            while (go)
            {
                currentTime = new Date();
                currentTime.setTime(currentTime.getTime() + dateOffset);

                if (currentTime >= penUmbraStartTime &&
                        currentTime <= penUmbraEndTime)
                {
                    penumbraShadow = eclipse.drawPenumbraShadow(currentTime);
                }

                if (isTotalorAnnular)
                {
                    if (currentTime.getTime() >= umbraStartTime &&
                            currentTime.getTime() <= umbraEndTime)
                    {
                        umbraShadow = eclipse.drawUmbraShadow(currentTime);
                    }
                }

                postMessage({'cmd': 'shadow_done',
                    'pen_shadow': JSON.stringify(penumbraShadow),
                    'umb_shadow': JSON.stringify(umbraShadow),
                    'date': currentTime.toUTCString()});
            }
            go = true;
        }
        
        function createArc(shadow)
        {
            if(shadow)
            {
                var bigShadow = [];
                for(var i = 1; i < shadow.length; i++)
                {
                    bigShadow.push(shadow[i - 1]);
                   
                    var generator = new arc.GreatCircle({x: shadow[i - 1].longitude, y: shadow[i - 1].latitude}, {x: shadow[i].longitude, y: shadow[i].latitude});
                    var line = generator.Arc(20, {offset: 10});
                    for(var x = 0; x < line.geometries.length; x++)
                    {
                        for(var y = 0; y <  line.geometries[x].coords.length; y++)
                        {
                            bigShadow.push(new Position(line.geometries[x].coords[y][1], line.geometries[x].coords[y][0]));                        
                        }
                    }
                }
                
                return bigShadow;
            }
            
            return null;           
        }

        function drawShadow(msg)    // TODO: Seperate out into different threads for more performance!
        {
            var animateTime = parseFloat(msg);
                        
            var umbraShadow = createArc(mEclipse.drawUmbraShadow(animateTime));
            
            postMessage({'cmd': 'shadow_done',
                         'umb_shadow': JSON.stringify(umbraShadow)});                         
            
        }
    }
}


(function() 
{
    console.log("UMBRA WORKER: Initialized.");
    
    var umbraWorker = new UmbraWorker;
})();


