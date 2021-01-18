"use strict";

if (!window.genieservice) {
  var getCurrentUser = function getCurrentUser() {
    console.log("Inside getCurrentUser");
    return window.parent.handleAction('getCurrentUser');
  };

  var getAllUserProfile = function getAllUserProfile(profileRequest) {
    return window.parent.handleAction('getAllUserProfile', [profileRequest]);
  };

  var setUser = function setUser(userId) {
    return window.parent.handleAction('setUser', [userId]);
  };

  var getContent = function getContent(contentId) {
    return window.parent.handleAction('getContent', [contentId]);
  };

  var getRelatedContent = function getRelatedContent() {
    return window.parent.handleAction('getRelatedContent');
  };

  var getRelevantContent = function getRelevantContent(req) {
    return window.parent.handleAction('getRelevantContent', [req]);
  };

  var getContentList = function getContentList(filter) {
    return window.parent.handleAction('getContentList', [filter]);
  };

  var sendFeedback = function sendFeedback(args) {
    return window.parent.handleAction('sendFeedback', [args]);
  };

  var languageSearch = function languageSearch(filter) {
    return window.parent.handleAction('languageSearch', [filter]);
  };

  var endGenieCanvas = function endGenieCanvas() {
    return window.parent.handleAction('endGenieCanvas');
  };

  var endContent = function endContent() {
    return window.parent.handleAction('endContent');
  };

  var launchContent = function launchContent() {
    return window.parent.handleAction('launchContent');
  };

  var sendTelemetry = function sendTelemetry(data) {
    return new Promise(function (resolve, reject) {
      resolve(data);
    });
  };

  var checkMaxLimit = function checkMaxLimit(request) {
    return window.parent.handleAction('checkMaxLimit', [request]);
  };

  var showExitConfirmPopup = function showExitConfirmPopup() {
    return window.parent.handleAction('showExitConfirmPopup');
  }

  window.genieservice = function () {
    return {
      getCurrentUser: getCurrentUser,
      getAllUserProfile: getAllUserProfile,
      setUser: setUser,
      getContent: getContent,
      getRelevantContent: getRelevantContent,
      getRelatedContent: getRelatedContent,
      getContentList: getContentList,
      sendFeedback: sendFeedback,
      endGenieCanvas: endGenieCanvas,
      endContent: endContent,
      launchContent: launchContent,
      sendTelemetry: sendTelemetry,
      checkMaxLimit: checkMaxLimit,
      showExitConfirmPopup: showExitConfirmPopup
    };
  }();

  console.log("GenieService Loaded");
}