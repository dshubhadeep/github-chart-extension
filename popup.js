console.log("Popup");

document.addEventListener("DOMContentLoaded", function() {
  console.log("loaded");
  const header = document.getElementById("header");
  console.log(header);
  header.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      console.log(tab);
      chrome.tabs.sendMessage(tab.id, { text: "Clicked" });
    });
  });
});
