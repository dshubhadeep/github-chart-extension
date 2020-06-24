document.addEventListener("DOMContentLoaded", () => {

  Vue.component('page-change-btn', {
    props: {
      isDisabled: Boolean,
      path: String
    },
    template: `
      <div class="page-btn-wrapper">
          <div class="page-btn" @click="$emit('page-change')" :class="{disabled: isDisabled}">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 320 512" height="24px">
                  <path fill="#06f" :d="path" />
              </svg>
          </div>
      </div>`
  });

  Vue.component('theme-list', {
    props: {
      themeList: Array,
      savedTheme: String
    },
    template: `
      <div style="margin: auto">
          <div class="palette" v-for="theme in themeList" :key="theme.name" @click="$emit('select-theme', theme.name)">
              <div class="palette-colors">
                  <div class="color" v-for="color in theme.palette" :key="color" :style="{backgroundColor: color}">
                  </div>
              </div>
              <div class="palette-info">
                  <p>
                      {{ theme.name }}
                      <span class="selected" v-if="theme.name == savedTheme">SEL</span>
                  </p>
              </div>
          </div>
      </div>`
  });

  new Vue({
    el: '#container',
    data: function () {
      return {
        // theme list data
        themeList: [],
        slicedList: [],
        currentPage: 0,
        totalPages: 0,
        itemPerPage: 2,
        savedTheme: null
      }
    },
    created: function () {
      chrome.storage.local.get("themes", ({ themes }) => {
        if (themes) {
          this.themeList = convertMapToList(JSON.parse(themes));
          this.slicedList = this.themeList.slice(0, this.itemPerPage);
          this.totalPages = Math.floor(this.themeList.length / this.itemPerPage);

          console.log(`Theme list size : ${this.themeList.length}, total pages : ${this.totalPages + 1}`);

          // Fetch saved theme
          chrome.storage.local.get("theme", ({ theme }) => {
            console.log("SAVED THEME", theme);
            this.savedTheme = theme;
          });
        }
      });
    },
    methods: {
      onPageChange: function (direction) {
        this.currentPage = direction === 'next'
          ? Math.min(this.totalPages, this.currentPage + 1)
          : Math.max(0, this.currentPage - 1);

        this.slicedList = this.themeList.slice(
          this.itemPerPage * this.currentPage,
          this.itemPerPage * (this.currentPage + 1)
        );

        console.log(`Direction : ${direction}, current page : ${this.currentPage}`);
      },
      onThemeSelect: function (themeName) {
        // Add theme to localStorage
        chrome.storage.local.set({ theme: themeName }, () => {
          this.savedTheme = themeName;
          console.log(`Saved theme to storage : ${themeName}`);
        });
      }
    }
  });

});

/**
* @param {Object} themesMap 
*/
function convertMapToList(themesMap) {
  return Object.keys(themesMap)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(key => ({ name: key, palette: themesMap[key] }));
}