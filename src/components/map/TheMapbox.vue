<template>
  <div class="map-wrapper" >
    <map-box
      :map-options="{style: 'mapbox://styles/ascarix/cjoe973rf8rf82rmi5fcykj8w?metadata=true',
                     center: [8.542803, 47.371425],
                     zoom: 16,
                     pitch: 0,
                     bearing: 0,
                     container: 'map', preserveDrawingBuffer: true}"
      :nav-control="{show: false}"
      access-token="pk.eyJ1IjoiYXNjYXJpeCIsImEiOiJjajQ4OGV0bXEwNW5iMzJwY2RpYmpzam5mIn0.V1p4AFPhf7Rhf3qW0jeovg"
      data-keyboard="false"
      @map-init="mapInitialized"
      @map-load="loaded"/>
    <div
      v-show="mapLoaded"
      class="switch_style mapboxgl-ctrl-group mapboxgl-ctrl">
      <button
        v-tooltip.left="{ content: 'Zoom In', delay: { show: 700, hide: 100 }}"
        class="mapbox-gl-draw_ctrl-draw-btn"
        @click="zoom_in"><i class="fa fa-plus"/></button>
      <button
        v-tooltip.left="{ content: 'Zoom Out', delay: { show: 700, hide: 100 }}"
        class="mapbox-gl-draw_ctrl-draw-btn"
        @click="zoom_out"><i class="fa fa-minus"/></button>
      <button
        v-tooltip.left="{ content: '2D View', delay: { show: 700, hide: 100 }}"
        :class="{active: d2}"
        class="mapbox-gl-draw_ctrl-draw-btn"
        @click="set_style('av', true)">2D</button>
      <button
        v-tooltip.left="{ content: '3D View', delay: { show: 700, hide: 100 }}"
        :class="{active: d3}"
        class="mapbox-gl-draw_ctrl-draw-btn"
        @click="set_style('av3d', false)">3D</button>
      <button
        v-tooltip.left="{ content: 'Restricted Area', delay: { show: 700, hide: 100 }}"
        v-if="$router['history'].current.name === 'Search' || $router['history'].current.name === 'SearchById'"
        :disabled="!toDrawWorkspace.length"
        :class="{'disableBut': workspaceLoaded && !toDrawWorkspace.length,
                 'activeBut' : showWorkspace }"
        :title="workspaceLoaded && !toDrawWorkspace.length ? 'There is no Restricted Area to show' : 'Show Restricted Area'"
        :aria-label="workspaceLoaded && !toDrawWorkspace.length ? 'There is no Restricted Area to show' : 'Show Restricted Area'"
        class="mapbox-gl-draw_ctrl-draw-btn"
        type="button"
        @click="drawWorkSpace()">
        <div v-if="!workspaceLoaded && !toDrawWorkspace.length">
          <i class="fa fa-circle-o-notch fa-spin"/>
        </div>
        <div v-else-if="toDrawWorkspace === null">
          null
        </div>
        <div v-else>
          <img
            src="/static/img/icons/40.png"
            width="20">
        </div>
      </button>
      <button
        v-tooltip.left="{ content: 'Layers', delay: { show: 700, hide: 100 }}"
        v-show="alphaFeature"
        :class="{'active': layersPanelActive}"
        class="mapbox-gl-draw_ctrl-draw-btn alpha-feature feature-on-block"
        @click="layersPanelActive=!layersPanelActive"><i class="si si-layers"/></button>
      <button
        v-tooltip.left="{ content: 'Map/Satellite', delay: { show: 700, hide: 100 }}"
        :class="{active: satelliteView}"
        class="mapbox-gl-draw_ctrl-draw-btn">
        <img
          v-if="!satelliteView"
          src="../../../static/img/icons/sateliteView.png"
          style="width: 100%; height: 29px"
          @click="set_style('satellite', false)">
        <img
          v-if="satelliteView"
          src="../../../static/img/icons/mapView.png"
          style="width: 100%; height: 29px"
          @click="set_style('av', true)">
      </button>
      <button
        v-tooltip.left="{ content: 'North bearing', delay: { show: 700, hide: 100 }}"
        class="mapbox-gl-draw_ctrl-draw-btn"
        type="button"
        title="Reset bearing to north"
        aria-label="Reset bearing to north"
        @click="north()">
        <span class="mapboxgl-ctrl-compass-arrow" >
          <img
            :style="'transform: rotate(' + bearning + 'deg);'"
            src="/static/img/compass.svg"
            width="20">
        </span>
      </button>
      <button
        v-show="showDrawTools"
        id="circle"
        class="mapbox-gl-draw_ctrl-draw-btn draw_tools"
        @click="draw_shape('draw_radius')"><i class="fa fa-circle-o"/></button>
      <button
        v-show="showDrawTools"
        class="mapbox-gl-draw_ctrl-draw-btn draw_tools"
        @click="draw_shape('draw_polygon')"><i class="fa fa-pencil"/></button>
      <!--<button class="mapbox-gl-draw_ctrl-draw-btn" v-on:click="delete_draw()"><i class="fa fa-trash"></i></button>-->
      <div
        v-show="showDrawTools"
        class="mapboxgl-ctrl-group mapboxgl-ctrl draw_tools">
        <color-picker
          ref="colorpicker"
          :setColor="setColor"/>
      </div>
    </div>
    <div
      :class="{'opened': layersPanelActive}"
      class="layers-panel">
      <div
        v-if="layerPanelSelectedMode"
        class="legend-wrap">
        <div class="list-of-layers">
          <div class="layer-group">
            <div class="layer">
              <div
                class="layer-image"
                style="background-image: url(../../../static/img/layers/layer-noise.png);"/>
              <div class="layer-title">
                Day noise
              </div>
              <div class="control">
                <button
                  class="btn btn-block btn-xs btn-default"
                  type="button"
                  @click="layerPanelSelectedMode=!layerPanelSelectedMode">Reset</button>
              </div>
            </div>
          </div>
          <div class="legend-group">
            <div class="group-name">
              Noise
            </div>
            <div class="legend-item">
              <div
                class="color"
                style="background-color: #a48ad4;"/>
              <div class="title">Train</div>
            </div>
            <div class="legend-item">
              <div
                class="color"
                style="background-color: #ff6b6b;"/>
              <div class="title">Car</div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="layers-wrap">
        <!-- Search Block -->
        <div class="search-block form-group has-feedback">
          <input
            type="text"
            class="form-control input-sm"
            placeholder="Search Layer"
            aria-describedby="inputSuccess2Status">
          <span
            class="si si-magnifier form-control-feedback"
            aria-hidden="true"/>
        </div>
        <!-- / Search Block -->
        <!-- Layers List -->
        <div class="list-of-layers">
          <div class="layer-group">
            <div class="group-name with-switch">
              Noise
            </div>
            <div
              class="layer in-list"
              @click="layerPanelSelectedMode=!layerPanelSelectedMode">
              <div
                class="layer-image"
                style="background-image: url(../../../static/img/layers/layer-noise.png);"/>
              <div class="layer-title">
                Day noise
              </div>
            </div>
            <div
              class="layer in-list"
              @click="layerPanelSelectedMode=!layerPanelSelectedMode">
              <div
                class="layer-image"
                style="background-image: url(../../../static/img/layers/layer-noise.png);"/>
              <div class="layer-title">
                Night noise
              </div>
            </div>
          </div>
          <div class="layer-group">
            <div class="group-name with-switch">
              Other
            </div>
            <div
              class="layer in-list"
              @click="layerResidentioalZones=!layerResidentioalZones">
              <div
                class="layer-image"
                style="background-image: url(../../../static/img/layers/layer-resedential-zones.png);"/>
              <div class="layer-title">
                Residental Zones
              </div>
            </div>
          </div>
        </div>
        <!-- / Layers List -->
      </div>
      <button
        class="btn btn-xs btn-default btn-close"
        @click="layersPanelActive=!layersPanelActive"><i class="fa fa-close"/></button>
    </div>
    <modal
      v-show="showModal"
      ref="modal"
      :modalShow="showModal">

      <template slot="close">
        <button
          type="button"
          @click="showModal = false;"><i class="si si-close"/>
        </button>
      </template>
      <template slot="title">
        <h3 class="block-title">Please enter shape name</h3>
      </template>

      <template slot="text">
        <span><input
          v-model="shapeName"
          type="text"
          class="form-control"></span>
      </template>
      <template slot="slot_actions">

        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showModal = false;shapeName=''">Cancel
        </button>

        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="shapeNameEditFinished = true; showModal = false;"><i class="fa fa-check"/> Ok
        </button>
      </template>
    </modal>

  </div>

</template>
