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

var Counter = chrome.extension.getBackgroundPage().Counter;
var table = document.createElement("table");
var urls = chrome.extension.getBackgroundPage().countUrls;
var total = 0;
for (var i = 0; i < urls.length; i++) {
  var r = table.insertRow(-1);

  r.insertCell(-1).textContent = FormatDuration(Counter[urls[i]] * 1000);
  total += Counter[urls[i]];

  var a = document.createElement("a");
  a.textContent = urls[i];
  a.setAttribute("href", urls[i]);
  a.setAttribute("target", "_blank");
  r.insertCell(-1).appendChild(a);
}
document.querySelector('#urls').appendChild(table);

document.querySelector('#total').append( FormatDuration(total * 1000));

function clear_counter() {
  chrome.extension.getBackgroundPage().clearCounter();
}
document.querySelector('#clear').addEventListener('click', clear_counter);
