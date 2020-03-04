<template>
  <div>
    <div style="position: relative;">
      <ul class="flex-tabs list-unstyled icon-tabs larger separated neighborhoodTabs">
        <li
          v-tooltip.top="{ content: 'Overview', delay: { show: 700, hide: 100 }}"
          v-if="betaFeature"
          :class="{active: activeTabL2 === 'overview'}"
          @click="setActiveTab('overview', 2, true)"
        >
          <span><span class="beta-feature feature-on-text"><span class="icon-neighborhood"/></span></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Noise', delay: { show: 700, hide: 100 }}"
          :class="{active: activeTabL2 === 'noise', disabled: !entranceRatings || !entranceRatings.noise}"
          @click="setActiveTab('noise', 2, true)"
        >
          <span><span class="icon-noise"/></span>
        </li>
        <li
          v-tooltip.top="{ content: 'View', delay: { show: 700, hide: 100 }}"
          :class="{active: activeTabL2 === 'view', disabled: !entranceRatings || !entranceRatings.view}"
          @click="setActiveTab('view', 2, true)"
        >
          <span><span class="icon-view"/></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Shopping', delay: { show: 700, hide: 100 }}"
          v-show="betaFeature"
          :class="{active: activeTabL2 === 'shopping', disabled: !entranceRatings || !entranceRatings.servicePois}"
          @click="setActiveTab('shopping', 2, true)"
        >
          <span><span class="beta-feature feature-on-text"><span class="icon-shopping"/></span></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Immissions', delay: { show: 700, hide: 100 }}"
          v-show="betaFeature"
          :class="{active: activeTabL2 === 'immissions', disabled: !entranceRatings || !entranceRatings.immissionPois}"
          @click="setActiveTab('immissions', 2, true)"
        >
          <span><span class="beta-feature feature-on-text"><span class="icon-immissions"/></span></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Education', delay: { show: 700, hide: 100 }}"
          v-show="betaFeature"
          :class="{active: activeTabL2 === 'education', disabled: !entranceRatings || !entranceRatings.educationPois}"
          @click="setActiveTab('education', 2, true)"
        >
          <span><span class="beta-feature feature-on-text"><span class="icon-education"/></span></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Connectivity', delay: { show: 700, hide: 100 }}"
          v-show="alphaFeature"
          :class="{active: activeTabL2 === 'connectivity', disabled: !entranceRatings || !entranceRatings.connectivityPois}"
          @click="setActiveTab('connectivity', 2, true)"
        >
          <span><span class="alpha-feature feature-on-text"><span class="icon-connectivity"/></span></span>
        </li>
        <li
          v-tooltip.top="{ content: 'POI', delay: { show: 700, hide: 100 }}"
          v-show="alphaFeature"
          :class="{active: activeTabL2 === 'poi'}"
          @click="setActiveTab('poi', 2, true)"
        >
          <span><span class="alpha-feature feature-on-text"><span class="icon-poi"/></span></span>
        </li>
      </ul>
    </div>
    <div>
      <div>
        <overview v-if="activeTabL2 === 'overview'"/>
        <noise v-if="activeTabL2 === 'noise'"/>
        <neighborhood-view v-if="activeTabL2 === 'view'"/>
        <shopping v-if="activeTabL2 === 'shopping'"/>
        <immissions v-if="activeTabL2 === 'immissions'"/>
        <education v-if="activeTabL2 === 'education'"/>
        <connectivity v-if="activeTabL2 === 'connectivity'"/>
        <poi v-if="activeTabL2 === 'poi'"/>
      </div>
    </div>
  </div>
</template>
