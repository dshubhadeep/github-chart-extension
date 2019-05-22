console.log("Popup");

document.addEventListener("DOMContentLoaded", () => {
  const paletteWrapper = document.querySelector(".palette-wrapper");
  const addThemeButton = document.getElementById("add_theme_button");
  const themeForm = document.querySelector(".theme-form");

  /**
   * Initial load
   */

  let savedTheme;

  /**
   * Render all themes at start
   */
  chrome.storage.local.get("themes", results => {
    if (results["themes"]) {
      const themesMap = JSON.parse(results["themes"]);
      const themes = Object.keys(themesMap);

      themes.forEach(theme => {
        console.log(`Rendered ${theme}`);
        renderList(theme, themesMap[theme]);
      });

      const themeWrappers = document.querySelectorAll(".theme-wrapper");

      chrome.storage.local.get("theme", result => {
        console.log(`Saved theme : ${result.theme}`);
        savedTheme = result.theme;

        // Add selected class to theme-wrapper
        updateWrappers(savedTheme, themeWrappers);
      });

      themeWrappers.forEach(themeWrapper => {
        themeWrapper.addEventListener("click", _ => {
          const theme = themeWrapper.className.split(" ")[1];

          updateWrappers(theme, themeWrappers);

          // Add theme to localStorage
          chrome.storage.local.set({ theme }, () => {
            console.log(`Saved theme : ${theme}`);
          });
        });
      });
    }
  });

  /**
   * Add class to selected theme
   * @param {string} theme
   * @param {NodeList} themeWrappers
   */
  const updateWrappers = (theme, themeWrappers) => {
    themeWrappers.forEach(themeWrapper => {
      if (themeWrapper.classList.contains(theme)) {
        themeWrapper.classList.add("selected");
      } else {
        themeWrapper.classList.remove("selected");
      }
    });
  };

  /**
   * Add theme-wrapper to list
   * @param {string} themeName
   * @param {Array[]} colors
   */
  const renderList = (themeName, colors) => {
    const rendered_html = `
    <div class="theme-wrapper ${themeName}">
      <h3>${themeName}</h3>
      <div class="theme-palette">
        <div class="color" style="background-color: ${colors[0]};"></div>
        <div class="color" style="background-color: ${colors[1]};"></div>
        <div class="color" style="background-color: ${colors[2]};"></div>
        <div class="color" style="background-color: ${colors[3]};"></div>
        <div class="color" style="background-color: ${colors[4]};"></div>
      </div>
    </div>`;

    paletteWrapper.innerHTML += rendered_html;
  };

  const addTheme = _ => {
    const inputs = Array.from(document.querySelectorAll("input"), input =>
      input.value.toLowerCase()
    );

    const [themeName, ...colors] = inputs;

    // TODO Form validation
    const hexRegex = /^#([a-f0-9]{6})$/g;

    chrome.storage.local.get("themes", results => {
      const savedThemes = JSON.parse(results["themes"]);
      savedThemes[themeName] = colors;
      console.log(savedThemes);

      chrome.storage.local.set({ themes: JSON.stringify(savedThemes) }, _ => {
        console.log("Themes updated");
        renderList(themeName, colors);

        paletteWrapper.classList.toggle("hidden");
        themeForm.classList.toggle("hidden");
      });
    });
  };

  addThemeButton.addEventListener("click", addTheme);
});
