/*
 * Copyright 2013 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var History = {};
var Counter = {};
//var countUrls = ['www.youtube.com', 'kakuyomu.jp'];
var countUrls = [];

var callTest = function () {
  chrome.browserAction.setBadgeBackgroundColor({ 'color': "#FF0000" });
}

var clearCounter = function () {
  // console.log("clearCounter");
  for (url of countUrls) {
    Counter[url] = 0;
  }
};

var restoreCounter = function () {
  var url_text = localStorage["url_text"];
  var urls = url_text.split(/\r\n|\r|\n/);
  countUrls = [];
  for (url of urls) {
    if (url != "") {
      countUrls.push(url);
    }
  }
  clearCounter();
};

restoreCounter();
chrome.browserAction.setBadgeText({ 'text': '-' });
chrome.browserAction.setBadgeBackgroundColor({ 'color': "#777" });

function Update(t, tabId, url) {
  if (!url) {
    return;
  }
  // console.log(url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1]);
  // url = url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
  if (tabId in History) {
    if (url == History[tabId][0][1]) {
      return;
    }
  } else {
    History[tabId] = [];
  }
  History[tabId].unshift([t, url, 0]);

  var history_limit = parseInt(localStorage["history_size"]);
  if (!history_limit) {
    history_limit = 23;
  }
  while (History[tabId].length > history_limit) {
    History[tabId].pop();
  }

  //chrome.browserAction.setBadgeText({ 'tabId': tabId, 'text': '0:00' });
  chrome.browserAction.setPopup({ 'tabId': tabId, 'popup': "popup.html#tabId=" + tabId });
}

function HandleUpdate(tabId, changeInfo, tab) {
  Update(new Date(), tabId, changeInfo.url);
}

function HandleRemove(tabId, removeInfo) {
  delete History[tabId];
}

function HandleReplace(addedTabId, removedTabId) {
  var t = new Date();
  delete History[removedTabId];
  chrome.tabs.get(addedTabId, function (tab) {
    Update(t, addedTabId, tab.url);
  });
}


const intervalSec = 1;
function UpdateBadges() {

  chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true }, function (d) {
    if (d[0]) {
      var currentTabId = d[0].id;
      //console.log(d[0].url);
      var match = d[0].url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/);
      if (match) {
        var url = match[1];
        if (countUrls.includes(url)) {
          //console.log(url);
          //console.log(Counter[url]);
          if (url in Counter) {
            Counter[url] += intervalSec;
          } else {
            Counter[url] = 0;
          }
          var description = FormatDuration(Counter[url] * 1000); // sec to milli sec
          chrome.browserAction.setBadgeText({ 'tabId': parseInt(currentTabId), 'text': description });
        }
      }
      // if (currentTabId && History[currentTabId]) {
      //   var hist = History[currentTabId];
      //   hist[0][2] += intervalSec;
      //   var description = FormatDuration(hist[0][2] * 1000); // sec to milli sec
      //   chrome.browserAction.setBadgeText({ 'tabId': parseInt(currentTabId), 'text': description });
      // }
    }
  });

  // var now = new Date();
  // for (tabId in History) {
  //   var description = FormatDuration(now - History[tabId][0][0]);
  //   chrome.browserAction.setBadgeText({ 'tabId': parseInt(tabId), 'text': description});
  // }
}

setInterval(UpdateBadges, intervalSec * 1000);

chrome.tabs.onUpdated.addListener(HandleUpdate);
chrome.tabs.onRemoved.addListener(HandleRemove);
chrome.tabs.onReplaced.addListener(HandleReplace);
