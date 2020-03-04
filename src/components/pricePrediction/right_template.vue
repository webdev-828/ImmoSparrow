<template>
  <div @click="neighborhoodPopover = false">
    <modal
      v-show="$store.getters['searchModule/statusDBModal']"
      :onCloseModal="closeDBModal"
      :bigModal="true">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="closeDBModal()"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Decibel scale</template>
      <template slot="text">
        <div class="form-group margin-b-10 padding-b-10">
          <img
            :src="getGraph($store.getters['authStatesModule/lang'])"
            style="width: 100%;">
        </div>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="closeDBModal()">Close</button>
      </template>
    </modal>
    <aside
      v-move
      id="sidebar-object-fixed"
      class="active sidebar-shadow">
      <button
        class="btn btn-default side-overlay--button"
        type="button"
        @click="toggleSideBar()">
        <i class="arrow"/>
      </button>

      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div >
                <i class="fa fa-building-o margin-r-5"/>
                <!--{{ val(predicted, item => item.address.street, "")  }} {{ val(predicted, item => item.address.streetNumber, "")  }}, {{ val(predicted, item => item.address.zip, "")  }} {{ val(predicted, item => item.address.locality, "")  }}-->
                <span
                  notranslate
                  v-html="addressName"/>
              </div>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-default"
              @click="remove_address_item()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <ul class="flex-tabs list-unstyled">
          <li
            :class="{active: tabs['overview'], disabled: (!showBuilding)}"
            @click="toggle('overview', true)" >
            <span>Overview</span>
          </li>
          <li
            v-if="predicted"
            :class="{active: tabs['pricePredictionPrice'], disabled: !predicted.data}"
            @click="predicted.data ? toggle('pricePredictionPrice', true): ''">
            <span>Price</span>
          </li>
          <li
            v-else
            :class="{active: tabs['pricePredictionPrice'], disabled: 'true'}">
            <span>Price</span>
          </li>
          <li
            v-if="ppNeighborhood"
            :class="{active: tabs['neighborhood'], disabled: hasEnvInfo}"
            @click="toggle('neighborhood', true)">
            <span>Neighborhood</span>
          </li>
          <li
            v-else
            :class="{ 'active' : tabs['neighborhood']}"
            @click.stop="neighborhoodPopover = !neighborhoodPopover">
            <span>Neighborhood</span>
          </li>
          <v-popover
            :open="neighborhoodPopover"
            placement="bottom"
            trigger="manual">
            <template
              v-if="empCtx"
              slot="popover">
              <popover
                :bundle="'pricePredictor'"
                :feature="'neighbourhood'" />
            </template>
          </v-popover>
        </ul>
        <div
          v-show="$store.getters['searchStatesModule/addressLoading'] || $store.getters['searchStatesModule/ppCalculating']"
          class="search-spinner"
          style="padding-top: 240px !important;">
          <i class="fa fa-circle-o-notch fa-spin"/>
        </div>
        <div
          v-bar
          class="detail-content">
          <div class="tab-content">
            <div
              :class="{active: tabs['overview']}"
              class="tab-pane">
              <div v-if="buildingOnAddress && buildingOnAddress.id">
                <overview
                  v-if="showBuilding"
                  :indexEnterence="indexEnterence"
                  :buildingOnAddress="buildingOnAddress"
                  :addressFromAd="addressFromAd"
                  :entrenceId="entrenceId" />
              </div>
              <!-- Section -->
              <div
                v-else
                class="data-section stand-out">
                <div class="section-content padding-t-20">
                  <div
                    role="alert"
                    class="alert alert-danger font-s13">
                    <strong>No Building data can be found.</strong> Price calculation will refer to location and distirct values.
                  </div>
                </div>
              </div>
              <!-- End Section -->
            </div>
            <div
              :class="{active: tabs['neighborhood']}"
              class="tab-pane">
              <neighborhood :environmentInfo="environmentInfo"/>
            </div>
            <div
              :class="{active: tabs['pricePredictionPrice']}"
              class="tab-pane">
              <price :prediction="predicted"/>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
