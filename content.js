console.log("Github extension running");

// TODO Allow users to add custom themes
const themes = {
  default: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
  blue: ["#ebedf0", "#c0ddf9", "#73b3f3", "#3886e1", "#17459e"],
  halloween: ["#ebedf0", "#fdf436", "#ffc700", "#ff9100", "#06001c"]
};

const getAllDaysRect = columns => {
  let dayRects = [];

  columns.forEach(column => {
    dayRects = [...dayRects, ...column.children];
  });

  return dayRects;
};

const updateGraph = (previous, current) => {
  const graph = document.querySelector(".js-calendar-graph-svg > g");

  const oldTheme = themes[previous];
  const newTheme = themes[current];

  if (graph !== null) {
    const legend = document.querySelectorAll(".legend li");
    const columns = [...graph.children].filter(child => child.nodeName === "g");

    const days = getAllDaysRect(columns);

    days.forEach(day => {
      const idx = oldTheme.indexOf(day.getAttribute("fill"));
      const newColor = newTheme[idx];

      day.setAttribute("fill", newColor);
    });

    legend.forEach((li, idx) => {
      li.style.backgroundColor = newTheme[idx];
    });
  }
};

/**
 * Initial load
 */
chrome.storage.local.get("theme", results => {
  if (Object.keys(results).length != 0) {
    const newTheme = results["theme"];
    updateGraph("default", newTheme);
  } else {
    // For first time users, theme is set to default
    chrome.storage.local.set({ theme: "default" }, _ => {
      console.log("Theme set in storage");
    });
  }
});

chrome.runtime.onMessage.addListener((message, req, res) => {
  console.log("Github Ext:", message);
});

/**
 * Updates graph when user selects new theme
 * Observes local storage
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
  const { oldValue, newValue } = changes["theme"];
  if (oldValue) updateGraph(oldValue, newValue);
});
