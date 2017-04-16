/*
 * moonWorker.js
 * Author: Joshua Berlin
 * Creates a javaScript thread to produce Moon animation
 * Last Edit: 03-31-2017
 * 
 */

"use strict";

class MoonWorker
{
    constructor()
    {
        importScripts("EclipseCalc.js");
        importScripts("planetpositions.js");
        importScripts("earth_vsop_d.js");
        
        var mEclipse = null;
        var coords = null;
        var julianDayMax = 0;
        
        var positions = new PlanetPositionsAC();
                    
        self.addEventListener('message', function (e)
        {
            // console.log("ANIMATER WORKER: Message recieved.");
            var data = e.data;
            switch (data.cmd)
            {
                case 'eclipse':
                    updateEclipse(data.eclipse);
                    break;
                case 'location':
                    updateLocation(data.coords);
                    break;
                case 'real':
                    getRealTimePositions(data.time, data.jd);
                    break;
                default:
                    console.log("MOON WORKER: Unkown command sent to worker.");
                    break;
            }
        }, false);
        
        function updateEclipse(msg)
        {
            mEclipse = new EclipseData(JSON.parse(msg));
            julianDayMax = Math.round(mEclipse.getMaxEclipseDateJD());
        }
        
        function updateLocation(msg)
        {
            coords = JSON.parse(msg);
        }
        
        function getRealTimePositions(date, jd)
        {
            var altitude = 0;
            var currentDate = new Date(parseFloat(date));
            var julianDay = 0;
            
            if(jd)
            {
                julianDay = parseFloat(jd);
            }
            
            positions.setDate(currentDate, julianDayMax, julianDay);
            if(coords.altitude)
            {
                altitude = coords.altitude;
            }
            
            var moonPos = positions.getMoonPosition(coords.latitude, coords.longitude, altitude);
            var sunPos = positions.getSunPosition(coords.latitude, coords.longitude, altitude);
            
            postMessage({'cmd': 'moon_position',
                    'moon_pos': JSON.stringify(moonPos),
                    'sun_pos': JSON.stringify(sunPos),
                    'date': currentDate.getTime().toString()});
        }
                
    }
 }

(function() 
{
    console.log("MOON WORKER: Initialized.");
    
    var moonWorker = new MoonWorker;
})();


