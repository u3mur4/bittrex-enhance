// ==UserScript==
// @name         Bittrex Swap BTC and USD Market
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Kenshou Uemura
// @match        https://bittrex.com/home/markets
// @grant        none
// ==/UserScript==

function swapDiv(event,elem){
    elem.parentNode.insertBefore(elem,elem.parentNode.firstChild);
}

(function() {
    'use strict';
    var markets = document.getElementsByClassName('market-info-content')[0].children
    swapDiv(markets[0], markets[1])
})();
