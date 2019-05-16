console.log("Background script running");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const message = { status: "complete" };
    chrome.tabs.sendMessage(tabId, message);
    console.log("Sent message");
  }
});
