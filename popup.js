console.log("Popup");

document.addEventListener("DOMContentLoaded", () => {
  const themeWrappers = document.querySelectorAll(".theme-wrapper");

  /**
   * Initial load
   */

  let savedTheme;

  chrome.storage.local.get("theme", result => {
    console.log(`Saved theme : ${result.theme}`);
    savedTheme = result.theme;

    // Add selected class to theme-wrapper
    updateWrappers(savedTheme);
  });

  themeWrappers.forEach(themeWrapper => {
    themeWrapper.addEventListener("click", _ => {
      const theme = themeWrapper.className.split(" ")[1];

      updateWrappers(theme);

      // Add theme to localStorage
      chrome.storage.local.set({ theme }, () => {
        console.log(`Saved theme : ${theme}`);
      });
    });
  });

  const updateWrappers = theme => {
    themeWrappers.forEach(themeWrapper => {
      if (themeWrapper.classList.contains(theme)) {
        themeWrapper.classList.add("selected");
      } else {
        themeWrapper.classList.remove("selected");
      }
    });
  };
});
