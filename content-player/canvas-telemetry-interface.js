"use strict";

var send = function send(object, apiName) {
  return window.parent.handleAction('send', [object, apiName]);
};

window.telemetry = function () {
  return {
    send: send
  };
}();

console.log('telemetry loaded', window.telemetry);