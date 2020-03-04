<template>
  <div class="autocomplete">
    <form>
      <input
        v-validate="'noHTMLTag|max:199'"
        ref="search_element"
        :disabled="disabled"
        :placeholder="localize.translate(placeholder) || localize.translate('Zip, City, Commune ...')"
        v-model="model"
        name="search"
        type="text"
        autocomplete="off"
        class="form-control"
        @keyup="load_data"
        @focus="open_options"
        @keydown.enter.prevent="setData(itemSelected ? itemSelected:options[0], redo); options = []; model = '' "
        @blur="close_results">
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
    <i
      v-if="!loadingData && model!=''"
      class="fa fa-remove search_icon remove"
      @click="reset_model()"/>
    <i
      v-if="!loadingData && model==''"
      class="fa fa-search search_icon"/>
    <i
      v-if="!loadingData && options.length && isOpen == false"
      class="fa fa-angle-down down"
      aria-hidden="true"
      @click="show_results"/>

    <div
      v-show="isOpen && options.length"
      class="autocomplete__box">
      <ul>
        <slot name="otherItems"/>
        <li
          v-for="(item, index) in options"
          :key="index"
          :class="{'active-item': currentItem === index}"
          @mousedown="setData(item); options = []; model = ''">
          <div class="ty"><slot
            :item="item"
            name="front_icon"/></div>

          <span
            name="type"
            class="itm">

            <slot
              :item="item"
              name="history"/>
            <slot
              :item="item"
              name="bookmarks"/>
            <slot
              :item="item"
              name="documents"/>

            <span
              notranslate
              v-html="genVal(item, itemHighlighted)"/>
          </span>
          <div class="prh"><slot
            :item="item"
            class="products"
            name="products"/></div>
        </li>
      </ul>
    </div>
  </div>
</template>
