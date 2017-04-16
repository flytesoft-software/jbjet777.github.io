/*
 * shadowAnimator.js
 * Author: Joshua Berlin
 * Creates a javaScript class to produce map points 
 * of the Moon's (ant)umbral shadow on the Earth's surface.
 * Last Edit: 02-10-2017
 * 
 */

"use strict";

class ShadowAnimator
{
    constructor()
    {
        var ANIMATE_SCALE = 300;  // Animation scale factor. x Times of realtime.
         
        var mEclipse = null;
        var penumbraThread = null;
        var umbraThread = null;
        var moonThread = null;
        var callBackFunc = null;
        var moonCallBackFunc = null;
        var animating = false;
        var animateTime = 0;
        var penumbraStartTime = 0;
        var penumbraEndTime = 0;
        var umbraStartTime = 0;
        var umbraEndTime = 0;
        var lastPenumbraAnimateTime = 0;
        var deltaTime = 0;
        var shadowCount = 0;
        var umbraShadow = null;
        var penumbraShadow = null;
        var centralEclipse = false;
        var dateOffset = 0;
        var realTime = false;
        var currentCoords = {};
        
        
        function getJDEclipse(time)
        {
            var month = time.getUTCMonth() + 1;
            var day = time.getUTCDate();
            var year = time.getUTCFullYear();
            var hours = time.getUTCHours();
            var minutes = time.getUTCMinutes();
            var seconds = time.getUTCSeconds();

            if (month <= 2)
            {
                year -= 1;
                month += 12;
            }

            var A = Math.floor(year / 100);
            var B = 2 - A + Math.floor(A / 4);
            var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;

            JD += hours / 24.0;
            JD += minutes / (24.0 * 60.0);
            JD += seconds / (24.0 * 60.0 * 60);
            
            JD += 1537.5; // TODO: Research why we are doing this.  Eclipse elements seem to use a differnt version of JD?

            return JD;
        }
        
        function animationPump()
        {
            if(realTime)
            {
                var currentDate = new Date();
                
                currentDate.setTime(currentDate.getTime() + dateOffset);
                
                animateTime = getJDEclipse(currentDate);
            }
            else
            {
                if(lastPenumbraAnimateTime > 0)
                {
                    var timeChange  = ((new Date().getTime()) -  lastPenumbraAnimateTime) / 86400000 * ANIMATE_SCALE;
                    deltaTime += timeChange;
                }

                animateTime = penumbraStartTime + deltaTime;

                if(animateTime > penumbraEndTime)
                {
                    animateTime = penumbraStartTime;
                    lastPenumbraAnimateTime = 0;
                    deltaTime = 0;
                }
                else
                {
                    lastPenumbraAnimateTime = new Date().getTime();
                }
            }
            
            if(centralEclipse)
            {
                if(animateTime >= umbraStartTime &&
                        animateTime <= umbraEndTime)
                {
                    pumpUmbraShadow(animateTime);
                }
                else
                {
                    shadowCount++;  // Umbra shadow not necessary, don't wait for it.
                    umbraShadow = null;
                }
            }
            else
            {
                shadowCount++;  // Umbra shadow not necessary, don't wait for it.
                umbraShadow = null;
            }
            pumpPenumbraShadow(animateTime);
            pumpMoonPosition(animateTime);
        }
        
        function onMoonPosition(msg)
        {
            var moonPos = JSON.parse(msg.data.moon_pos);
            var sunPos = JSON.parse(msg.data.sun_pos);
            
            if(moonCallBackFunc)
            {
                moonCallBackFunc({
                    moon_pos: moonPos,
                    sun_pos: sunPos
                });
            }
                        
            console.log("MOON POSITION UPDATE.");
        }
        
        function onPenumbraShadow(msg)
        {
            penumbraShadow = JSON.parse(msg.data.pen_shadow);
            shadowCount++;
            if(shadowCount === 2)
            {
                shadowCount = 0;
                if(callBackFunc)
                {
                    callBackFunc({  pen_shadow: penumbraShadow, 
                                    umb_shadow: umbraShadow,
                                    date: mEclipse.toDate(animateTime)});
                }
                animationPump();
            }            
        }
        
        function onUmbraShadow(msg)
        {
            umbraShadow = JSON.parse(msg.data.umb_shadow);
            shadowCount++;
            if(shadowCount === 2)  // If penumbra shadow is already done, then must do callback since both are ready to go.
            {
                shadowCount = 0;
                if(callBackFunc)
                {
                    callBackFunc({  pen_shadow: penumbraShadow, 
                                    umb_shadow: umbraShadow,
                                    date: mEclipse.toDate(animateTime)});
                }                
                animationPump();
            }            
        }
        
        function resetTimes()
        {
            animateTime = deltaTime = lastPenumbraAnimateTime = penumbraStartTime = penumbraEndTime = umbraStartTime = umbraEndTime = 0;
        }
        
        /*
         * Process umbra shadow for specific time in JD.
         * @param {Number} jdTime
         * @returns {undefined}
         */
        function pumpUmbraShadow(jdTime)
        {
            umbraThread.postMessage({   'cmd': 'shadow',
                                        'time': jdTime.toString()});
        }
        
        /*
         * Process Suna and Moon positions for specific time in JD.
         * @param {Number} jdTime
         * @returns {undefined}
         */
        function pumpMoonPosition(jdTime)
        {
            var date = mEclipse.toDate(jdTime);
            var actualJD = jdTime - 1537.5;
            moonThread.postMessage({   'cmd': 'real',
                                        'jd': actualJD.toString(),
                                        'time': date.getTime().toString()});
        }
        
        /*
         * Process penumbra shadow for specific time in JD.
         * @param {Number} jdTime
         * @returns {undefined}
         */
        function pumpPenumbraShadow(jdTime)
        {
            penumbraThread.postMessage({    'cmd': 'shadow',
                                            'time': jdTime.toString()});
        }
        
        /*
         * Sends a message to Moon thread to get Sun/Moon position for specified date/time.
         * @param {Date} date
         * @returns {undefined}
         */
        this.getMoonPosition = function(date, location, callBack)
        {
            var alt = 0;
            if(location.altitude)
            {
                alt = location.altitude;
            }
            var coords = {latitude: location.latitude,
                            longitude: location.longitude,
                            altitude: alt};
                        
            moonCallBackFunc = callBack;
            
            if(!moonThread)
            {
                moonThread = new Worker("moonWorker.js");
                moonThread.onmessage = onMoonPosition;
            }
            
            var julianDay = getJDEclipse(date) - 1537.5;
            
            moonThread.postMessage({ 'cmd': 'location',
                                            'coords': JSON.stringify(coords)});
            moonThread.postMessage({   'cmd': 'real',
                                        'jd': julianDay.toString(),
                                        'time': date.getTime().toString()});
        };
        
        /*
         * Returns if animation is currently occurring.
         * @returns {Boolean}
         */
        this.isAnimating = function()
        {
            return animating;
        };
        
        /*
         * Resets the animator object.
         * @returns {undefined}
         */
        this.reset = function()
        {
            mEclipse = null;
            callBackFunc = null;
            this.stop(); 
        };
        
        /*
         * Set the eclipse to animate.
         */
        this.setEclipse = function(eclipse)
        {
            mEclipse = eclipse;
        };
        
        /*
         * Start shadow animation.
         * @param {Function} callback -- Callback function when shadows are complete.
         * @param {Object} options -- Options {realtime: Boolean | dateOffset: Number}
         * @returns {undefined}
         */
        this.start = function(callback, mCallBack, options)
        {
            this.stop();
            
            if(options)
            {
                if(options.realTime)
                {
                    realTime = true;
                    if(options.dateOffset)
                    {
                        dateOffset = options.dateOffset;
                    }
                }
            }
            
            if(mEclipse)
            {
                animating = true;
                centralEclipse = mEclipse.isTotalOrAnnular();
                
                callBackFunc = callback;
                moonCallBackFunc = mCallBack;
                
                if(!moonThread)
                {
                    moonThread = new Worker("moonWorker.js");
                }
                moonThread.onmessage = onMoonPosition;
                moonThread.postMessage({ 'cmd': 'eclipse',
                                            'eclipse': JSON.stringify(mEclipse)});
                moonThread.postMessage({ 'cmd': 'location',
                                            'coords': JSON.stringify(currentCoords)});                        
                
                penumbraThread = new Worker("animateWorker.js");
                penumbraThread.onmessage = onPenumbraShadow;
                penumbraStartTime = mEclipse.getPenumbraStartTimeJD();
                penumbraEndTime = mEclipse.getPenumbraEndTimeJD();
                penumbraThread.postMessage({ 'cmd': 'eclipse',
                                            'eclipse': JSON.stringify(mEclipse)});
                                        
                if(centralEclipse)
                {
                    umbraThread = new Worker("umbraWorker.js");
                    umbraThread.onmessage = onUmbraShadow;
                    umbraStartTime = mEclipse.getUmbraStartTimeJD();
                    umbraEndTime = mEclipse.getUmbraEndTimeJD();
                    umbraThread.postMessage({ 'cmd': 'eclipse',
                                                'eclipse': JSON.stringify(mEclipse)});
                }
                
                animationPump();
            }
            else
            {
                throw new Error("Must set eclipse before starting animation.");
            }
        };
        
        /*
         * Set the current coordinates for Sun / Moon position.
         * @param {Object} coords -- Current coordinates
         * @returns {undefined}
         */
        this.setCoords = function(coords)
        {
            currentCoords.latitude = coords.latitude;
            currentCoords.longitude = coords.longitude;
            if(coords.altitude)
            {
                currentCoords.altitude = coords.altitude;
            }
            else
            {
                currentCoords.altitude = 0;
            }
        };
        
        /*
         * Stop eclipse animation.
         */
        this.stop = function()
        {
           animating = false;
           resetTimes();
           if(penumbraThread)
           {
               penumbraThread.terminate();
               penumbraThread = null;
           }
           if(umbraThread)
           {
               umbraThread.terminate();
               umbraThread = null;
           }
           umbraShadow = null;
           penumbraShadow = null;
           shadowCount = 0;
           centralEclipse = false;
           realTime = false;
           dateOffset = 0;
        };
    }
}

