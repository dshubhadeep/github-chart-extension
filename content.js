console.log("Github extension running");

const DEFAULT_GRAPH = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"];

const HALLOWEEN_GRAPH = ["#ebedf0", "#fdf436", "#ffc700", "#ff9100", "#06001c"];

const BLUE_GRAPH = ["#ebedf0", "#c0ddf9", "#73b3f3", "#3886e1", "#17459e"];

const getAllDaysRect = columns => {
  let dayRects = [];

  columns.forEach(column => {
    dayRects = [...dayRects, ...column.children];
  });

  return dayRects;
};

const updateGraph = chosen => {
  const graph = document.querySelector(".js-calendar-graph-svg > g");

  if (graph !== null) {
    const legend = document.querySelectorAll(".legend li");
    const columns = [...graph.children].filter(child => child.nodeName === "g");

    const days = getAllDaysRect(columns);

    days.forEach(day => {
      const idx = DEFAULT_GRAPH.indexOf(day.getAttribute("fill"));
      const newColor = chosen[idx];

      day.setAttribute("fill", newColor);
    });

    legend.forEach((li, idx) => {
      li.style.backgroundColor = chosen[idx];
    });
  }
};

/**
 * Initial load
 */
updateGraph(HALLOWEEN_GRAPH);

chrome.runtime.onMessage.addListener((message, req, res) => {
  console.log("Github Ext:", message);
});
