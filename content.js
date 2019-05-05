console.log("Github extension running");

const HALLOWEEN_GRAPH = {
  "#ebedf0": "#ebedf0",
  "#c6e48b": "#fdf436",
  "#7bc96f": "#ffc700",
  "#239a3b": "#ff9100",
  "#196127": "#06001c"
};

const BLUE_GRAPH = {
  "#ebedf0": "#ebedf0",
  "#c6e48b": "#c0ddf9",
  "#7bc96f": "#73b3f3",
  "#239a3b": "#3886e1",
  "#196127": "#17459e"
};

const updateGraph = _ => {
  const graph = document.querySelector(".js-calendar-graph-svg > g");

  if (graph !== null) {
    const legend = document.querySelectorAll(".legend li");
    const columns = [...graph.children].filter(child => child.nodeName === "g");

    columns.forEach(column => {
      const days = [...column.children];

      days.forEach(day => {
        const newColor = HALLOWEEN_GRAPH[day.getAttribute("fill")];

        day.setAttribute("fill", newColor);
      });
    });

    const colors = Object.values(HALLOWEEN_GRAPH);

    legend.forEach((li, idx) => {
      li.style.backgroundColor = colors[idx];
    });
  }
};

updateGraph();
