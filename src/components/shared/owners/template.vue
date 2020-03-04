<template>
  <div class="data-section stand-out">
    <div
      class="section-label cursor-show"
      @click="ownerSection=!ownerSection">
      <div class="label-copy">Owners</div>
      <div class="section-controls">
        <div
          v-if="ownerInfoLoaded && (ownerStatesInfo.supported.length || ownerStatesInfo.planned.length || ownerStatesInfo.notSupported.length)"
          class="dropdown dropdown-up"
          style="display: inline;">
          <button
            class="btn btn-sm btn-default button-dropdown"
            type="button">
            i
          </button>
          <ul class="dropdown-menu top-150 dropdown-menu-right fancy-shadow">
            <li v-if="ownerStatesInfo.supported.length">
              <div class="font-s12 padding-10">
                <span class="margin-r-5">Supported Cantons:</span>
                <strong notranslate>{{ formatStates(ownerStatesInfo.supported) }}</strong>
              </div>
            </li>
            <li v-if="ownerStatesInfo.planned.length">
              <div class="font-s12 padding-10">
                <span class="margin-r-5">Planned Cantons:</span>
                <strong notranslate>{{ formatStates(ownerStatesInfo.planned) }}</strong>
              </div>
            </li>
            <li v-if="ownerStatesInfo.notSupported.length">
              <div class="font-s12 padding-10">
                <span class="margin-r-5">Unsupported Cantons:</span>
                <strong notranslate>{{ formatStates(ownerStatesInfo.notSupported) }}</strong>
              </div>
            </li>
          </ul>
        </div>
        <button
          v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
          v-if="searchOwnerInfo"
          class="btn btn-sm btn-default cursor-none"
          type="button"><i
            :class="{'fa-angle-up' : ownerSection, 'fa-angle-down' : !ownerSection}"
            class="fa"/></button>
        <v-popover
          v-else
          class="popover-inline"
          placement="top">
          <button class="btn btn-sm btn-default">
            <i class="fa fa-angle-down"/>
          </button>
          <template
            v-if="empCtx"
            slot="popover">
            <popover
              :bundle="'search'"
              :feature="'ownerInfo'" />
          </template>
        </v-popover>
      </div>
    </div>
    <template v-if="ownerSection && searchOwnerInfo">
      <div
        v-if="ownerStatus === 'NotSupported'"
        class="sidebar-message-box no-borders">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Owner Request not possible for this address</div>
      </div>
      <div
        v-if="ownerStatus === 'Planned'"
        class="sidebar-message-box">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Owner Request not yet possible for this address</div>
      </div>
      <div
        v-if="ownerStatus === 'Supported' && ownerFlag !== 1 && ownerFlag !== 2 && ownerFlag !== 4 && ownerFlag !== 5"
        class="section-content no-borders">
        <div class="fluid-data-table flex-option">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                Request Owner Info (Avg. <var notranslate>{{ val(item, item => item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds, 30) }}</var> sec)
              </div>
              <div
                class="value">
                <button
                  class="btn btn-xs btn-success"
                  type="button"
                  @click="getOwnerInfo()">Request: <var notranslate>00:{{ val(item, item => item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds, 30) }}</var></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="ownerFlag === 1"
        class="section-content">
        <div class="fluid-data-table flex-option">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                Requesting Owner Info…
              </div>
              <div
                class="value">
                <progress-bar
                  :val="gettingOwner"
                  :text="gettingOwner + '%'"
                  bar-color="#0f9df0"
                  class="progress simpleProgress"
                  size="small"/>
              </div>
            </div>
          </div>
          <div
            v-if="val(item, item => item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div
                class="attribute">
                Average Requesting Time: <var notranslate>{{ val(item, item => item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds, 0) }}s</var>
              </div>
              <div
                class="value"/>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="ownerFlag === 3"
        class="sidebar-message-box no-borders">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Owner Request Failed</div>
      </div>
      <div
        v-if="ownerFlag === 4"
        class="sidebar-message-box no-borders">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">No available owners for this address</div>
      </div>
      <div
        v-if="ownerFlag === 5"
        class="sidebar-message-box no-borders">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Service not available at the moment. Try again soon.</div>
      </div>
      <div
        v-if="ownerFlag === 2 && owners.length"
        class="section-content">
        <owner-details
          v-for="(owner, owKey) in owners"
          :key="owKey"
          :owner="owner"/>
      </div>
    </template>
  </div>
</template>
