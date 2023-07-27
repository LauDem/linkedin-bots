/* global chrome */
(function FnAction() {
  var fn = Okta.fn.action = {};
  fn.updateBadge = function (badgeConfig) {
    if (!badgeConfig) {
      return;
    }
    chrome.action.setBadgeText({text: badgeConfig.text});
    if(badgeConfig.color !== '') {
      chrome.action.setBadgeBackgroundColor(
        {color: badgeConfig.color});
    }
  };

  fn.getUserPinned = async function () {
    var result;
    try {
      var userSettings = await chrome.action.getUserSettings();
      result = userSettings.isOnToolbar;
    } catch (error) {
      result = { errorCode: error.message || error };
    }
    return result;
  };

  fn.openPopup = function(openPopupOptions) {
    chrome.action.openPopup(openPopupOptions);
  };

}());
