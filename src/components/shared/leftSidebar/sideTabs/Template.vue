<template>
  <div class="sidebar-sidetabs">
    <button
      v-tooltip.right="{ content: 'Toggle sidebar', delay: { show: 700, hide: 100 }}"
      class="back-button-extra btn btn-default pull-right side-overlay--button"
      type="button"
      @click="toggleSidebar">
      <i class="arrow"/>
    </button>
    <div
      v-if="isMapLoaded"
      class="pull-right side-overlay--button nav_h">
      <a
        v-tooltip.right="{ content: 'Search', delay: { show: 700, hide: 100 }}"
        :class="['btn', { 'active': activeTab.level1 === 'search' }]"
        @click="changeTab('search')">
        <span class="si si-magnifier"/>
      </a>
      <div
        v-for="(tab, index) in tabs"
        :key="`tab-${index}`">
        <template v-if="tab.visible">
          <a
            v-tooltip.right="{ content: formatName(tab.name), delay: { show: 700, hide: 100 }}"
            :class="['btn', { 'active': activeTab.level1 === tab.name }]"
            @click="changeTab(tab.name)">
            <span :class="['si', tab.icon]"/>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>
