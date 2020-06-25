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

  Vue.component('add-theme-form', {
    template: `
    <form id="form-container" @submit.prevent="onSubmit">
        <input type="text" class="form-input" v-model="inputThemeName" placeholder="Theme name">
        <input type="text" class="form-input" v-model="inputThemePalette"
          placeholder="https://coolors.co/cc8b86-f9eae1-7d4f50-d1be9c-aa998f">
        <p style="color: #718096;padding: 0 0.5rem;" v-if="errorMsg">{{ errorMsg }}</p>

        <div style="display: flex; justify-content: center;margin: 0.5rem" v-if="palettePreview.length > 0">
          <div style="width: 32px;height: 32px;margin: 8px 4px; border-radius: 4px;" :style="{backgroundColor: color}"
            v-for="(color,index) in palettePreview" :key="index" :title="color">
          </div>
        </div>

        <input type="submit" class="btn btn-primary" style="margin: 4px auto;" value="Save">
      </form>
    `,
    data: function () {
      return {
        inputThemeName: '',
        inputThemePalette: '',
        palettePreview: Array(5).fill('#fff'),
        errorMsg: ''
      }
    },
    methods: {
      onSubmit: function () {
        // TODO Validation

        this.$emit('add-theme', {
          [this.inputThemeName]: formatPalette(this.palettePreview)
        })
      }
    },
    watch: {
      inputThemePalette: function (val) {
        try {
          const url = new URL(val);
          this.errorMsg = '';
          this.palettePreview = url.pathname.slice(1).split("-").map(e => `#${e}`);
        } catch (e) {
          this.errorMsg = e.message;
        }
      }
    }
  })

  new Vue({
    el: '#container',
    data: function () {
      return {
        showTheme: true,
        // theme list data
        themeList: [],
        slicedList: [],
        currentPage: 1,
        totalPages: 0,
        itemPerPage: 2,
        savedTheme: null
      }
    },
    created: function () {
      chrome.storage.local.get("themes", ({ themes }) => {
        if (themes) {
          themes = JSON.parse(themes);
          this.themeList = convertMapToList(themes);
          this.totalPages = Math.ceil(this.themeList.length / this.itemPerPage);

          console.log(`Theme list size : ${this.themeList.length}, total pages : ${this.totalPages}`);

          // Fetch saved theme
          chrome.storage.local.get("theme", ({ theme }) => {
            this.savedTheme = theme;
            const savedIndex = this.themeList.map(e => e.name).indexOf(theme);
            this.currentPage = Math.floor(savedIndex / this.itemPerPage) + 1;
            this.slicedList = this.themeList.slice(
              this.itemPerPage * (this.currentPage - 1),
              this.itemPerPage * this.currentPage
            );

            console.log(`Saved theme : ${theme}, index : ${savedIndex}, page no : ${Math.floor(savedIndex / this.itemPerPage) + 1}`);
          });
        }
      });
    },
    methods: {
      toggleTheme: function () {
        this.showTheme = !this.showTheme;
      },
      onPageChange: function (direction) {
        this.currentPage = direction === 'next'
          ? Math.min(this.totalPages, this.currentPage + 1)
          : Math.max(1, this.currentPage - 1);

        this.slicedList = this.themeList.slice(
          this.itemPerPage * (this.currentPage - 1),
          this.itemPerPage * this.currentPage
        );

        console.log(`Direction : ${direction}, current page : ${this.currentPage}`);
      },
      onThemeSelect: function (themeName) {
        // Add theme to localStorage
        chrome.storage.local.set({ theme: themeName }, () => {
          this.savedTheme = themeName;
          console.log(`Saved theme to storage : ${themeName}`);
        });
      },
      onSubmit: function (newTheme) {
        chrome.storage.local.get("themes", ({ themes }) => {

          if (themes) {
            const updatedThemes = { ...JSON.parse(themes), ...newTheme };

            chrome.storage.local.set({ themes: JSON.stringify(updatedThemes) }, () => {
              console.log("Themes saved");
              // trigger render for theme list
              this.themeList = convertMapToList(updatedThemes);
              this.totalPages = Math.ceil(this.themeList.length / this.itemPerPage);
              this.currentPage = 1;
              this.slicedList = this.themeList.slice(0, this.itemPerPage);
              this.showTheme = true;
            });
          }

        });
      }
    }
  });

});

/**
* @param {object} themesMap 
*/
function convertMapToList(themesMap) {
  return Object.keys(themesMap)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(key => ({ name: key, palette: themesMap[key] }));
}

/**
* Will format palette such that it has only 5 colors
* If more are present, it will take only first 5 colors
* If less, then it will fill array with white color
* @param {string[]} palette 
*/
function formatPalette(palette) {
  const { length } = palette;

  if (length == 5) return palette;

  return length > 5
    ? palette.slice(0, 5)
    : [...palette, Array(5 - length).fill('#fff')];
}