// ==UserScript==
// @name         Bittrex History Bar
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://international.bittrex.com/Market/Index?MarketName=*-*
// @grant        none
// ==/UserScript==

function createHistorySummary() {
    var place = document.getElementById('marketHistoryTable2');
    var html = `
  <div id='historySummary'>
    <strong data-bind="text: history.summaryHistory"></strong>
    <div style="text-align:center; color: white; overflow: hidden;">
      <div id='history-summary-buy'  style="background-color: #228B22; white-space: nowrap; float: left; transition: width 0.3s; width: 25%;">0.00%</div>
      <div id='history-summary-sell' style="background-color: #DC143C; white-space: nowrap; overflow: hidden;">0.00%</div>
    </div>
  </div>
`;
    place.insertAdjacentHTML('afterend', html);
}

/* Calculate avrage price and adds the XXX and BTC volume*/
function mergeOrders(orders) {
    var summary = {
        price: 0,
        unitXXX: 0,
        unitBTC: 0
    };
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        summary.price += order.price;
        summary.unitXXX += order.unitXXX;
        summary.unitBTC += order.unitBTC;
    }
    summary.price /= orders.length;
    return summary;
}

/*Parse the history table, return buy and sell orders*/
function parseMarketHistoryTable() {
    var table = document.getElementById('marketHistoryTable2');
    var buyOrders = [];
    var sellOrders = [];
    for (var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var order = {
            price: parseFloat(row.cells[2].innerText.trim()),
            unitXXX: parseFloat(row.cells[3].innerText.trim()),
            unitBTC: parseFloat(row.cells[4].innerText.trim()),
        };
        var dir = row.cells[1].innerText.trim();
        dir == 'BUY' ? buyOrders.push(order) : sellOrders.push(order);
    }
    return {buyOrders, sellOrders};
}

function updateHistorySummary(buySummary, sellSummary) {
    var c = bittrex.market.marketCurrencyName;
    var base = bittrex.market.baseCurrencyName

    var buy = buySummary.unitXXX.toFixed(0) + ' ' + c + ' (' + buySummary.unitBTC.toFixed(2) + ' ' + base + ')';
    var buyHistorySummary = document.getElementById('history-summary-buy');
    buyHistorySummary.innerText = buy;

    var sell = sellSummary.unitXXX.toFixed(2) + ' ' + c + ' (' + sellSummary.unitBTC.toFixed(2) + ' ' + base + ')';
    var sellHistorySummary = document.getElementById('history-summary-sell');
    sellHistorySummary.innerText = sell;

    var ratio = buySummary.unitXXX/(sellSummary.unitXXX+buySummary.unitXXX)*100;
    buyHistorySummary.style.width = ratio + '%'
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

function loop() {
    var {buyOrders, sellOrders} = parseMarketHistoryTable();
    var buySummary = mergeOrders(buyOrders);
    var sellSummary = mergeOrders(sellOrders);
    updateHistorySummary(buySummary, sellSummary);
}

(function() {
    'use strict';
    createHistorySummary();
    watch(document.getElementById('marketHistoryTable2'), loop)
})();
