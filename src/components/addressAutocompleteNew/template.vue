<template>
  <div class="autocomplete">
    <form>
      <input
        ref="searchInput"
        v-model="searchText"
        :disabled="!isMapLoaded"
        :placeholder="localize.translate(placeholder) || localize.translate('Zip, City, Commune ...')"
        :min="autocompleteMinTextLimit"
        :max="199"
        name="search"
        type="text"
        autocomplete="off"
        class="form-control"
        @keyup="debounceSearch"
        @focus="showResults"
        @keydown.enter.prevent="selectItem(null)"
        @blur="clear(true)">
    </form>

    <svg
      v-show="loadingData"
      width="25"
      height="25"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      class="lds-rolling">
      <circle
        cx="50"
        cy="50"
        fill="none"
        ng-attr-stroke="#ccc"
        ng-attr-stroke-width="1"
        ng-attr-r="35"
        ng-attr-stroke-dasharray="1"
        stroke="#e2e1e0"
        stroke-width="10"
        r="35"
        stroke-dasharray="164.93361431346415 56.97787143782138"
        transform="rotate(12 50 50)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="linear"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
          dur="1s"
          begin="0s"
          repeatCount="indefinite"/>
      </circle>
    </svg>

    <template v-if="!loadingData">
      <i
        v-if="!isOpen && results.length"
        class="fa fa-angle-down down"
        aria-hidden="true"
        @click="showResults"/>
      <i
        v-if="searchText"
        class="fa fa-remove search_icon remove"
        @click="clear"/>
      <i
        v-else
        class="fa fa-search search_icon"/>
    </template>

    <div
      v-show="isOpen && results.length"
      class="autocomplete__box">
      <ul class="padding-t-0">
        <li
          v-for="(item, index) in results"
          :key="`search-result-${index}`"
          @mousedown="selectItem(item)">
          <span
            name="type"
            class="itm">
            <span
              notranslate
              v-html="item.highlightedName || item.name"/>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
