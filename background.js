console.log("Background script running");

chrome.webRequest.onCompleted.addListener(
  details => {
    console.log(details);
    chrome.tabs.sendMessage(details.tabId, { message: "XHR Complete" });
  },
  {
    urls: [
      "https://github.com/users/*", // Contrib. chart
      "https://github.com/*?_pjax=%23js-pjax-container" // Tab change (on site)
    ],
    types: ["xmlhttprequest"]
  }
);
