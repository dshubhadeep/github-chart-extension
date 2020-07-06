let calendarGraph;
let contributionsBox;

let yearTotal = 0;
let averageCount = 0;
let maxCount = 0;
let countTotal = 0;
let streakLongest = 0;
let streakCurrent = 0
let bestDay = null;
let firstDay = null;
let lastDay = null;
let datesTotal = null;
let datesLongest = null;
let datesCurrent = null;
let dateBest = null;

let toggleSetting = 'cubes';
let theme = 'default';
let savedThemes = null;

const dateOptions = { month: 'short', day: 'numeric' };


const resetValues = () => {
    console.log("[ISO] resetting values...");

    yearTotal = 0;
    averageCount = 0;
    maxCount = 0;
    streakLongest = 0;
    streakCurrent = 0;
    bestDay = null;
    firstDay = null;
    lastDay = null;
    datesLongest = null;
    datesCurrent = null;
}

const getSettings = () => {
    return new Promise(resolve => {
        chrome.storage.local.get(['toggleSetting', 'themes', 'theme'], res => {
            toggleSetting = res.toggleSetting ? res.toggleSetting : 'cubes';
            theme = res.theme ? res.theme : 'default';
            savedThemes = JSON.parse(res.themes);
            console.log(`[ISO] Toggle setting : ${toggleSetting}`);
            console.log(`[ISO] Themes : ${savedThemes}`);
            console.log(`[ISO] Theme : ${theme}`);
            resolve('Settings loaded');
        });
    });
}

const initUI = () => {
    console.log('[ISO] Initializing UI');

    const contributionsWrapper = document.createElement('div');
    contributionsWrapper.className = 'ic-contributions-wrapper position-relative';
    calendarGraph.before(contributionsWrapper);

    const canvas = document.createElement('canvas');
    canvas.id = 'isometric-contributions';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.style.width = '100%';
    contributionsWrapper.append(canvas);

    const insertLocation = contributionsBox.querySelector('h2').parentElement;

    const btnGroup = document.createElement('div');
    btnGroup.id = 'iso-btn-group';
    btnGroup.className = 'BtnGroup mt-1 ml-3 position-relative top-0 float-right';

    const twoDimBtn = document.createElement('button');
    twoDimBtn.innerHTML = '2D';
    twoDimBtn.className = 'ic-toggle-option squares btn BtnGroup-item btn-sm py-0 px-1';
    twoDimBtn.dataset.icOption = 'squares';
    twoDimBtn.addEventListener('click', handleViewToggle);
    if (toggleSetting === 'squares') {
        twoDimBtn.classList.add('selected');
    }

    const threeDimBtn = document.createElement('button');
    threeDimBtn.innerHTML = '3D';
    threeDimBtn.className = 'ic-toggle-option cubes btn BtnGroup-item btn-sm py-0 px-1';
    threeDimBtn.dataset.icOption = 'cubes';
    threeDimBtn.addEventListener('click', handleViewToggle);
    if (toggleSetting === 'cubes') {
        threeDimBtn.classList.add('selected');
    }

    insertLocation.prepend(btnGroup);
    btnGroup.append(twoDimBtn);
    btnGroup.append(threeDimBtn);

    setContainerViewType(toggleSetting);
}

const handleViewToggle = event => {
    setContainerViewType(event.target.dataset.icOption);

    document.querySelectorAll('.ic-toggle-option').forEach(toggle => {
        toggle.classList.remove('selected');
    })
    event.target.classList.add('selected');

    persistSetting('toggleSetting', event.target.dataset.icOption);
    toggleSetting = event.target.dataset.icOption;

    // Apply user preference
    document.querySelector(`.ic-toggle-option.${toggleSetting}`).classList.add('selected');
    contributionsBox.classList.add(`ic-${toggleSetting}`);
}

const persistSetting = (key, value) => {
    chrome.storage.local.set({ [key]: value });
}

const setContainerViewType = type => {
    if (type === 'squares') {
        contributionsBox.classList.remove('ic-cubes')
        contributionsBox.classList.add('ic-squares')
    } else {
        contributionsBox.classList.remove('ic-squares')
        contributionsBox.classList.add('ic-cubes')
    }
}

const loadStats = () => {
    console.log('[ISO] Loading stats');

    let temporaryStreak = 0;
    let temporaryStreakStart = null;
    let longestStreakStart = null;
    let longestStreakEnd = null;
    let currentStreakStart = null;
    let currentStreakEnd = null;

    const days = document.querySelectorAll('.js-calendar-graph rect.day');

    days.forEach(d => {
        const currentDayCount = parseInt(d.dataset.count, 10);
        yearTotal += currentDayCount;

        if (days[0] === d) firstDay = d.dataset.date;

        if (days[days.length - 1] === d) lastDay = d.dataset.date;

        // Check for best day
        if (currentDayCount > maxCount) {
            bestDay = d.dataset.date;
            maxCount = currentDayCount;
        }

        // Check for longest streak
        if (currentDayCount > 0) {
            if (temporaryStreak === 0)
                temporaryStreakStart = d.dataset.date;

            temporaryStreak++;

            if (temporaryStreak >= streakLongest) {
                longestStreakStart = temporaryStreakStart;
                longestStreakEnd = d.dataset.date;
                streakLongest = temporaryStreak;
            }
        } else {
            temporaryStreak = 0;
            temporaryStreakStart = null;
        }

    });

    console.log(`Year total : ${yearTotal}, best day : ${bestDay}`);

    // Check for current streak
    const daysArray = [...days].reverse();

    currentStreakEnd = daysArray[0].dataset.date;

    for (let i = 0; i < daysArray.length; i++) {
        const currentDayCount = parseInt(daysArray[i].dataset.count, 10);

        // If there's no activity today, continue on to yesterday
        if (i === 0 && currentDayCount === 0) {
            currentStreakEnd = daysArray[1].dataset.date;
            continue;
        }

        if (currentDayCount > 0) {
            streakCurrent++;
            currentStreakStart = daysArray[i].dataset.date;
        } else {
            break;
        }
    }

    if (streakCurrent > 0) {
        currentStreakStart = formatDateString(currentStreakStart, dateOptions);
        currentStreakEnd = formatDateString(currentStreakEnd, dateOptions);
        datesCurrent = `${currentStreakStart} → ${currentStreakEnd}`;
        console.log(`[ISO] dateCurrent : ${datesCurrent}`);
    } else {
        datesCurrent = 'No current streak'
    }

    // Year total
    countTotal = yearTotal.toLocaleString();
    const dateFirst = formatDateString(firstDay, dateOptions);
    const dateLast = formatDateString(lastDay, dateOptions);
    datesTotal = `${dateFirst} → ${dateLast}`;
    console.log(`[ISO] datesTotal : ${datesTotal}`);

    // Average contributions per day
    const dayDifference = datesDayDifference(firstDay, lastDay);
    averageCount = (yearTotal / dayDifference).toPrecision(2);
    console.log(`[ISO] Average count : ${averageCount}`);

    // Best day
    dateBest = formatDateString(bestDay, dateOptions);
    if (!dateBest) {
        dateBest = 'No activity found';
    }

    // Longest streak
    if (streakLongest > 0) {
        longestStreakStart = formatDateString(longestStreakStart, dateOptions);
        longestStreakEnd = formatDateString(longestStreakEnd, dateOptions);
        datesLongest = `${longestStreakStart} → ${longestStreakEnd}`;
        console.log(`[ISO] Longest streak : ${datesLongest}`);
    } else {
        datesLongest = 'No longest streak';
    }
}

const datesDayDifference = (dateString1, dateString2) => {
    let diffDays = null;
    let date1 = null;
    let date2 = null;

    if (dateString1) {
        const [year, month, day] = dateString1.split('-');
        date1 = new Date(year, month - 1, day, 0, 0, 0);
    }

    if (dateString2) {
        const [year, month, day] = dateString2.split('-');
        date2 = new Date(year, month - 1, day, 0, 0, 0);
    }

    if (dateString1 && dateString2) {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    return diffDays;
}

const formatDateString = (dateString, options) => {
    let date = null;

    if (dateString) {
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day, 0, 0, 0).toLocaleDateString('en-US', options);
    }

    return date;
}

const renderStats = () => {
    const textColor = savedThemes[theme][3];
    const styleText = `color : ${textColor} !important`;

    const topMarkup = `
    <div class="position-absolute top-0 right-0 mt-3 mr-5">
      <h5 class="mb-1">Contributions</h5>
      <div class="d-flex flex-justify-between rounded-2 border px-1 px-md-2" style="background-color:rgba(255, 255, 255, 0.8);">
        <div class="p-2">
          <span class="d-block f2 text-bold lh-condensed" style="${styleText}">${countTotal}</span>
          <span class="d-block text-small text-bold">Total</span>
          <span class="d-none d-sm-block text-small text-gray-light">${datesTotal}</span>
        </div>
        <div class="p-2">
          <span class="d-block f2 text-bold lh-condensed" style="${styleText}">${maxCount}</span>
          <span class="d-block text-small text-bold">Best day</span>
          <span class="d-none d-sm-block text-small text-gray-light">${dateBest}</span>
        </div>
      </div>
      <p class="mt-1 text-right text-small">
        Average: <span class="text-bold" style="${styleText}">${averageCount}</span> <span class="text-gray-light">/ day</span>
        </p>
    </div>
  `;

    const bottomMarkup = `
    <div class="position-absolute bottom-0 left-0 ml-5 mb-6">
      <h5 class="mb-1">Streaks</h5>
      <div class="d-flex flex-justify-between rounded-2 border px-1 px-md-2" style="background-color:rgba(255, 255, 255, 0.8);">
        <div class="p-2">
          <span class="d-block f2 text-bold lh-condensed" style="${styleText}">${streakLongest} <span class="f4">days</span></span>
          <span class="d-block text-small text-bold">Longest</span>
          <span class="d-none d-sm-block text-small text-gray-light">${datesLongest}</span>
        </div>
        <div class="p-2">
          <span class="d-block f2 text-bold lh-condensed" style="${styleText}">${streakCurrent} <span class="f4">days</span></span>
          <span class="d-block text-small text-bold">Current</span>
          <span class="d-none d-sm-block text-small text-gray-light">${datesCurrent}</span>
        </div>
      </div>
    </div>
  `;

    const icStatsBlockTop = document.createElement('div');
    icStatsBlockTop.innerHTML = topMarkup;
    document.querySelector('.ic-contributions-wrapper').append(icStatsBlockTop);

    const icStatsBlockBottom = document.createElement('div');
    icStatsBlockBottom.innerHTML = bottomMarkup;
    document.querySelector('.ic-contributions-wrapper').append(icStatsBlockBottom);
}

const renderIsometricChart = () => {
    const SIZE = 16;
    const MAX_HEIGHT = 100;
    const firstRect = document.querySelectorAll('.js-calendar-graph-svg g > g')[1];
    const canvas = document.querySelector('#isometric-contributions');
    const GH_OFFSET = parseInt(firstRect.getAttribute('transform').match(/(\d+)/)[0], 10) - 1;
    const point = new obelisk.Point(130, 90);
    const pixelView = new obelisk.PixelView(canvas, point);
    const weeks = document.querySelectorAll('.js-calendar-graph-svg g > g');

    const COLOR_SET = new Set();

    weeks.forEach(w => {
        const x = parseInt(((w.getAttribute('transform')).match(/(\d+)/))[0], 10) / (GH_OFFSET + 1);

        w.querySelectorAll('rect').forEach(r => {
            const y = parseInt(r.getAttribute('y'), 10) / GH_OFFSET;
            const fill = r.getAttribute('fill');
            COLOR_SET.add(fill);
            const contribCount = parseInt(r.dataset.count, 10);
            let cubeHeight = 3;

            if (maxCount > 0) {
                cubeHeight += parseInt(MAX_HEIGHT / maxCount * contribCount, 10);
            }

            const dimension = new obelisk.CubeDimension(SIZE, SIZE, cubeHeight);
            const color = getSquareColor(fill);
            const cube = new obelisk.Cube(dimension, color, false);
            const p3d = new obelisk.Point3D(SIZE * x, SIZE * y, 0);
            pixelView.renderObject(cube, p3d);
        });
    });

    console.log("COLOR SET", COLOR_SET);
}

const getSquareColor = fill => {
    return new obelisk.CubeColor().getByHorizontalColor(parseInt('0x' + fill.replace('#', ''), 16));
}

const generateIsometricChart = () => {
    calendarGraph = document.querySelector('.js-calendar-graph');
    contributionsBox = document.querySelector('.js-yearly-contributions');

    resetValues();
    initUI();
    loadStats();
    renderStats();
    renderIsometricChart();
}



/**
 * Listens for any XHR and updates graph accordingly
 */
chrome.runtime.onMessage.addListener(({ message }, req, res) => {
    if (message == "XHR Complete") {
        chrome.storage.local.get("theme", ({ theme }) => {
            console.log("[ISO] message received");
            setTimeout(() => {
                if (document.querySelector('.js-calendar-graph')) {
                    console.log("[ISO] On load")

                    const settingsPromise = getSettings();
                    settingsPromise.then(generateIsometricChart);
                }
            }, 500);
        });
    }
});

/**
 * Updates graph when user selects new theme
 * Observes local storage
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes["theme"]) {
        setTimeout(() => {
            theme = changes["theme"].newValue;
            renderStats();
            renderIsometricChart();
        }, 500);
    }
});