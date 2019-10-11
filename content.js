console.log("Github extension running");

// TODO Allow users to add custom themes
const themes = {
  teal: ["#ebedf0", "#7FFFD4", "#76EEC6", "#66CDAA", "#458B74"],
  leftPad: ["#2F2F2F", "#646464", "#A5A5A5", "#DDDDDD", "#F6F6F6"],
  dracula: ["#282a36", "#44475a", "#6272a4", "#bd93f9", "#ff79c6"],
  panda: ["#242526", "#34353B", "#6FC1FF", "#19f9d8", "#FF4B82"],
  sunny: ["#fff9ae", "#f8ed62", "#e9d700", "#dab600", "#a98600"],
  pink: ["#ebedf0", "#e48bdc", "#ca5bcc", "#a74aa8", "#61185f"],
  YlGnBu: ["#ebedf0", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
  default: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
  blue: ["#ebedf0", "#c0ddf9", "#73b3f3", "#3886e1", "#17459e"],
  halloween: ["#ebedf0", "#fdf436", "#ffc700", "#ff9100", "#06001c"],
  coool: ["#DBC2CF", "#9FA2B2", "#3C7A89", "#2E4756", "#16262E"]
  
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

  if (graph !== null) {
    chrome.storage.local.get("themes", result => {
      const saved_themes = JSON.parse(result["themes"]);
      const oldTheme = saved_themes[previous];
      const newTheme = saved_themes[current];

      const legend = document.querySelectorAll(".legend li");
      const columns = [...graph.children].filter(
        child => child.nodeName === "g"
      );

      const days = getAllDaysRect(columns);

      days.forEach(day => {
        const idx = oldTheme.indexOf(day.getAttribute("fill"));
        const newColor = newTheme[idx];

        day.setAttribute("fill", newColor);
      });

      legend.forEach((li, idx) => {
        li.style.backgroundColor = newTheme[idx];
      });
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
    chrome.storage.local.set(
      { theme: "default", themes: JSON.stringify(themes) },
      _ => {
        console.log("Theme set in storage");
      }
    );
  }
});

chrome.runtime.onMessage.addListener((message, req, res) => {
  console.log("Github Ext:", message);
  if (message.message == "XHR Complete") {
    chrome.storage.local.get("theme", results => {
      updateGraph("default", results["theme"]);
    });
  }
});

/**
 * Updates graph when user selects new theme
 * Observes local storage
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes["theme"]) {
    const { oldValue, newValue } = changes["theme"];
    if (oldValue) updateGraph(oldValue, newValue);
  }
});
