console.log("Background script running");

chrome.webRequest.onCompleted.addListener(
  ({ tabId }) => {
    chrome.tabs.sendMessage(tabId, { message: "XHR Complete" });
  },
  { urls: ["https://github.com/users/*"], types: ["xmlhttprequest"] }
);
