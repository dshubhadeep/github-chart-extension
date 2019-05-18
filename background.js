console.log("Background script running");

chrome.webRequest.onCompleted.addListener(
  ({ tabId }) => {
    chrome.tabs.sendMessage(tabId, { message: "XHR Complete" });
  },
  {
    urls: [
      "https://github.com/users/*", // Contrib. chart
      "https://github.com/*?_pjax=%23js-pjax-container" // Tab change (on site)
    ],
    types: ["xmlhttprequest"]
  }
);
