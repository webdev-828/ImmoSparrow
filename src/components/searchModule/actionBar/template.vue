<template>
  <div :class="{'section-controls flex-controls': detailView, 'select-option': !detailView}">
    <template v-if="$route.name === 'Search' || $route.name === 'Details'">
      <div
        :class="{'open': createInboxDropdown}"
        class="btn-group badge-feature">
        <div
          v-if="filteredItemLeads.length"
          class="the-badge bg-modern"
          notranslate>{{ filteredItemLeads.length }}</div>
        <button
          v-tooltip="'Add to Inbox'"
          v-if="basicLeads"
          type="button"
          class="btn btn-block btn-sm btn-default dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          @click.stop="createInboxDropdown=!createInboxDropdown, createPipeDropdown=false">
          <i class="fa fa-download"/>
        </button>
        <v-popover
          v-else
          class="popover-action-bar"
          placement="top"
          @click.native.stop>
          <button
            v-tooltip="'Add to Inbox'"
            class="btn btn-block btn-sm btn-default dropdown-toggle">
            <i class="fa fa-download"/>
          </button>
          <template slot="popover">
            <popover
              :bundle="'leads'"
              :feature="'basic'" />
          </template>
        </v-popover>
        <ul
          :class="{'dropdown-menu-right': detailView}"
          class="dropdown-menu dropdown-menu-right fancy-shadow"
          style="min-width: 300px;"
          @click.stop>
          <li class="dropdown-header bg-gray-lighter margin-b-10">Select Inbox</li>
          <li
            class="padding-l-10 padding-r-10 margin-b-10"
            style="display: flex;">
            <select
              v-model="selectedInbox"
              class="form-control input-sm margin-r-5"
              @click.stop>
              <option
                v-for="lead in availableInboxes"
                :key="lead.id"
                :value="lead"
                notranslate>{{ lead.name }}</option>
            </select>
            <button
              :disabled="creatingNew"
              type="button"
              class="btn btn-sm btn-success"
              @click.stop="addToInbox()">
              <i
                v-if="creatingNew"
                class="fa fa-circle-o-notch fa-spin"/>
              Add
            </button>
          </li>
          <li class="dropdown-header bg-gray-lighter">Inboxes Selected</li>
          <li
            v-for="lead in filteredItemLeads"
            :key="lead.leadList.id"
            :value="lead.leadList.id"
            class="font-s13">
            <a
              href="#"
              notranslate>{{ lead.leadList.name }} <i
                class="fa fa-trash pull-right"
                @click.stop="removeInbox(lead)"/>
            </a>
          </li>
          <li
            role="separator"
            class="divider"/>
          <li class="padding-l-10 padding-r-10">
            <button
              :class="{'btn-danger': createInbox, 'btn-success': !createInbox}"
              type="button"
              class="btn btn-block btn-sm"
              @click.stop="createInbox=!createInbox">
              <span v-if="createInbox">Cancel</span>
              <span v-else>Create New</span>
            </button>
          </li>
          <li
            v-if="createInbox"
            class="padding-10"
            style="display: flex;">
            <input
              v-model="inboxName"
              class="form-control input-sm margin-r-5"
              placeholder="Inbox Name"
              @click.stop>
            <button
              type="button"
              class="btn btn-sm btn-success"
              @click.stop="create()">Save</button>
          </li>
        </ul>
      </div>
      <div
        v-show="betaFeature"
        :class="{'open': createPipeDropdown}"
        class="btn-group badge-feature beta-feature feature-on-block">
        <div
          v-if="val(item, item => item.pipelineEntries.length)"
          class="the-badge bg-modern"
          notranslate>{{ item.pipelineEntries.length }}</div>
        <button
          v-tooltip="'Add to Pipe'"
          v-if="basicPipe"
          type="button"
          class="btn btn-block btn-sm btn-default dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          @click.stop="createPipeDropdown=!createPipeDropdown, createInboxDropdown=false">
          <i class="fa fa-columns"/>
        </button>
        <v-popover
          v-else
          class="popover-action-bar"
          placement="top"
          @click.native.stop>
          <button
            v-tooltip="'Add to Pipe'"
            class="btn btn-block btn-sm btn-default dropdown-toggle">
            <i class="fa fa-columns"/>
          </button>
          <template slot="popover">
            <popover
              :bundle="'pipeline'"
              :feature="'basic'" />
          </template>
        </v-popover>
        <ul
          class="dropdown-menu dropdown-menu-right fancy-shadow"
          style="min-width: 300px;"
          @click.stop>
          <li class="dropdown-header bg-gray-lighter margin-b-10">Select Pipeline</li>
          <li
            class="padding-l-10 padding-r-10 margin-b-10"
            style="display: flex;">
            <select
              v-model="selectedPipeline"
              class="form-control input-sm margin-r-5"
              @click.stop>
              <option
                v-for="pipe in availablePipelines"
                :key="pipe.id"
                :value="pipe">{{ pipe.name }}</option>
            </select>
            <button
              :disabled="creatingNew || !selectedPipeline"
              type="button"
              class="btn btn-sm btn-success"
              @click.stop="addToPipeline()">
              <i
                v-if="creatingNew"
                class="fa fa-circle-o-notch fa-spin"/>
              Add</button>
          </li>
          <li class="dropdown-header bg-gray-lighter">Pipelines Selected</li>
          <li
            v-for="(pipe, index) in item.pipelineEntries"
            :key="index"
            :value="pipe.pipeline.id"
            class="font-s13">
            <a
              href="#"
              @click="openInPipe(pipe.pipeline.id, pipe.id)">{{ pipe.pipeline.name }} </a>
          </li>
          <li
            role="separator"
            class="divider"/>
          <li class="padding-l-10 padding-r-10">
            <button
              :class="{'btn-danger': createPipe, 'btn-success': !createPipe}"
              type="button"
              class="btn btn-block btn-sm"
              @click.stop="createPipe=!createPipe">
              <span v-if="createPipe">Cancel</span>
              <span v-else>Create New</span>
            </button>
          </li>
          <pipe-details
            v-if="createPipe"
            @closePipeDetails="addDealInList = false"
            @reloadPipelines="reloadPipelines" />
        </ul>
      </div>
      <button
        v-tooltip="'Add to Favorite'"
        class="btn btn-sm btn-default"
        type="button"
        @click.stop="addToFavorites(item)">
        <i
          v-if="addingToFav"
          class="fa fa-circle-o-notch fa-spin"/>
        <i
          v-else
          :class="{'fa-star-o': !checkIfBookmarked, 'fa-star text-warning': checkIfBookmarked}"
          class="fa"/>
      </button>
    </template>
    <!--<router-link
      v-tooltip="'Analyse in Market Radar'"
      v-show="alphaFeature"
      :to="`/market-radar-address/` + item.id"
      :exact="true"
      class="btn btn-sm btn-default alpha-feature feature-on-block">
      <img
        width="14"
        src="../../../../static/img/icons/mr-dark.png">
    </router-link>-->
    <button
      v-tooltip="'Analyse in Market Radar'"
      v-if="basicMR"
      v-show="showMR && alphaFeature"
      :disabled="!item.address.entranceAddressId"
      class="btn btn-sm btn-default alpha-feature feature-on-block"
      type="button"
      @click.stop="openInMR()">
      <img
        width="14"
        src="../../../../static/img/icons/mr-dark.png">
    </button>
    <v-popover
      v-else
      class="popover-action-bar"
      placement="top"
      @click.native.stop>
      <button
        v-tooltip="'Analyse in Market Radar'"
        v-show="showMR && alphaFeature"
        class="btn btn-block btn-sm btn-default alpha-feature feature-on-block">
        <img
          width="14"
          src="../../../../static/img/icons/mr-dark.png">
      </button>
      <template slot="popover">
        <popover
          :bundle="'marketRadar'"
          :feature="'basic'" />
      </template>
    </v-popover>
    <button
      v-tooltip="'Analyse in Price Predictor'"
      v-if="basicPP"
      :disabled="!item.address.entranceAddressId"
      class="btn btn-sm btn-default"
      type="button"
      @click.stop="openInPP()">
      <img
        width="14"
        src="../../../../static/img/icons/price_prediction.png">
    </button>
    <v-popover
      v-else
      class="popover-action-bar"
      placement="top"
      @click.native.stop>
      <button
        v-tooltip="'Analyse in Price Predictor'"
        class="btn btn-block btn-sm btn-default">
        <img
          width="14"
          src="../../../../static/img/icons/price_prediction.png">
      </button>
      <template slot="popover">
        <popover
          :bundle="'pricePredictor'"
          :feature="'basic'" />
      </template>
    </v-popover>
    <button
      v-tooltip="'Share link'"
      class="btn btn-sm btn-default"
      type="button"
      @click.stop="openShareAd()">
      <i class="fa fa-share-square-o"/>
    </button>
  </div>
</template>
