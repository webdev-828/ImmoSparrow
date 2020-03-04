<template>
  <div class="tab-pane active">
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ active: activeTabL2 === 'price' }"
        @click="setActiveTab('price', 2, true)">
        <span>Price</span>
      </li>
      <li
        :class="{ active: activeTabL2 === 'object' }"
        @click="setActiveTab('object', 2, true)">
        <span>Object</span>
      </li>
      <li
        :class="{ active: activeTabL2 === 'market' }"
        @click="setActiveTab('market', 2, true)">
        <span>Market</span>
      </li>
    </ul>

    <price-analytics-tab v-show="activeTabL2 === 'price'"/>
    <object-analytics-tab v-show="activeTabL2 === 'object'"/>
    <market-analytics-tab v-show="activeTabL2 === 'market'"/>
  </div>
</template>
