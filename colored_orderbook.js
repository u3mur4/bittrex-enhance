// ==UserScript==
// @name         Bittrex Colored Orderbook
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Kenshou Uemura
// @match        https://bittrex.com/Market/Index?MarketName=*-*
// @grant        none
// ==/UserScript==

function applyColor(id, colors) {
    var table = document.getElementById(id);
    for (var i = 1; i < table.rows.length; i++) {
        table.rows[i].style.color = colors[i-1];
    }
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function convertToColors(weight, colors) {
    return weight.map((x) => {
        for (var i = 0; i < colors.length; i++) {
            if (between(x, colors[i].min, colors[i].max)) {
                return colors[i].value;
            }
        }
        return '';
    });
}

function convertToWeight(a) {
    let max = Math.max(...a);
    return a.map(function(x) { return x / max; });
}

function parseOrderBook(id) {
    var table = document.getElementById(id);
    var total_column_index = table.tHead.getElementsByClassName('total')[0].cellIndex
    var bids = [];
    for (var i = 1; i < table.rows.length; i++) {
        bids.push(parseFloat(table.rows[i].cells[total_column_index].innerText));
    }
    return bids;
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
var bottomColor = getCookie('bittrex-theme') == 'light-theme' ? '#3333338f' : '#636363fb'

function modifyBuyOrderbook() {
    var orderBook = parseOrderBook('buyOrdersTable');
    var weight = convertToWeight(orderBook);
    var colors = convertToColors(weight, [
        // top 10% price
        {min:0.90, max:1.00, value:'#468847'},
        // bottom 5% price
        {min:0.00, max:0.05, value:bottomColor}
    ]);

    applyColor('buyOrdersTable', colors);
}

function modifySellOrderbook() {
    var orderBook = parseOrderBook('sellOrdersTable');
    var weight = convertToWeight(orderBook);
    var colors = convertToColors(weight, [
        {min:0.90, max:1.00, value:'#b94a48'},
        {min:0.00, max:0.05, value:bottomColor}
    ]);

    applyColor('sellOrdersTable', colors);
}

function watch( targetElement, triggerFunction ){
  /// store the original html to compare with later
  var html = targetElement.innerHTML;
  /// start our constant checking function
  setInterval(function(){
    /// compare the previous html with the current
    if ( html != targetElement.innerHTML ) {
      /// trigger our function when a change occurs
      triggerFunction();
      /// update html so that this doesn't keep triggering
      html = targetElement.innerHTML;
    }
  },500);
}

(function() {
    'use strict';
    watch(document.getElementById('buyOrdersTable'), modifyBuyOrderbook)
    watch(document.getElementById('sellOrdersTable'), modifySellOrderbook)
})();
