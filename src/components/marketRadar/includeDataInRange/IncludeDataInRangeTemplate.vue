<template>
  <div class="data-subsection">
    <div class="data-subsection--label">
      <div class="data-subsection--label--copy">Include Data In</div>
      <div class="data-subsection--label--controls">
        <button
          class="btn btn-xs btn-default"
          name="geoSearch"
          data-toggle="dropdown"
          aria-expanded="false">
          {{ selectedGeoSearchOption }} <span class="caret"/>
        </button>
        <ul class="dropdown-menu dropdown-menu-right">
          <li>
            <a
              v-for="geoOption in geoSearchOptions"
              :key="`geo-search-option-${geoOption}`"
              tabindex="-1"
              href="javascript:void(0)"
              @click="selectRestriction(geoOption)">
              <span>
                {{ geoOption }}
                <template v-if="selectedGeoSearchOption === geoOption">
                  <span
                    class="label label-info">
                    Included
                  </span>
                  <span
                    v-if="geoOption === 'Viewport' && geoSearch.viewports.length"
                    class="label label-info">
                    {{ geoSearch.viewports.length }}
                  </span>
                  <span
                    v-if="geoOption === 'Draw manually' && geoSearch.shapes.length"
                    class="label label-info">
                    {{ geoSearch.shapes.length }}
                  </span>
                  <span
                    v-if="geoOption === 'Radius' && geoSearch.radius > 0"
                    class="label label-info">
                    {{ geoSearch.radius }}km
                  </span>
                  <span
                    v-if="geoOption === 'Travel Time'"
                    class="label label-info">
                    {{ geoSearch.transports[0].by }} - {{ geoSearch.transports[0].time }}
                  </span>
                </template>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="data-subsection--content">
      <div class="form-group">
        <template v-if="selectedGeoSearchOption === 'Radius'">
          <div :class="['input-group', { 'has-error': errors.has('marketRadarForm.radius') }]">
            <input
              v-validate="{ required: true, min_value: 1, max_value: 10 }"
              v-number-input
              id="radius"
              v-model="radius"
              autocomplete="off"
              name="radius"
              placeholder="Radius"
              class="form-control input-sm"
              data-vv-scope="marketRadarForm">
            <span class="input-group-addon">km</span>
          </div>
          <div
            v-show="errors.has('marketRadarForm.radius')"
            notranslate
            class="help-block"
            style="font-style: normal;color: #d26a5c;">
            {{ errors.first('marketRadarForm.radius') }}
          </div>
          <div
            class="help-block">
            Enter search radius - max 10km
          </div>
        </template>

        <span
          v-tooltip.top="selectedGeoSearchOption"
          v-show="isAreaOptionSelected && geoSearch.area"
          class="multiselect__tag margin-t-10"
          @click="removeAreaRestriction">
          {{ getGeoAreaFullName() }}
          <i
            aria-hidden="true"
            tabindex="1"
            class="multiselect__tag-icon"/>
        </span>

        <!-- <div
          v-if="selectedGeoSearchOption == 'Viewport'"
          class="input-group"
          style="width: 100%">
          <div
            v-if="viewPort"
            class="section-label">
            <div
              v-if="!viewPortNameEdit"
              class="label-copy">
              <span v-if="viewPort.name">{{ viewPort.name }}</span>
              <span v-else>Viewport</span>
            </div>
            <div
              v-else
              class="label-copy margin-r-5">
              <input
                id="viewportName"
                v-model="viewPort.name"
                class="input-sm form-control"
                @keydown.enter.prevent="viewPorts.unshift(viewPort); addViewPortToTheMap(viewPort); viewPort = {}; viewPortNameEdit = false;">
            </div>
            <div class="section-controls">
              <button
                v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                v-if="!viewPortNameEdit"
                :disabled="!viewPort.polygon"
                type="button"
                class="btn btn-sm btn-default"
                @click="viewPortNameEdit=true">
                <i class="fa fa-pencil"/>
              </button>
              <button
                v-else
                type="button"
                class="btn btn-sm btn-default"
                @click="viewPortNameEdit=false">Set</button>
            </div>
          </div>
          <div
            v-if="viewPort"
            class="section-content">
            <button
              :disabled="!viewPort.polygon"
              type="button"
              class="btn btn-block btn-sm btn-default margin-b-10"
              @click="viewPorts.unshift(viewPort); addViewPortToTheMap(viewPort); viewPort = {}; viewPortNameEdit = false;"
            >
              Add to List
            </button>
            <span v-if="viewPorts.length">
              <span
                v-for="(viewPort, index) in viewPorts"
                :key="viewPort.id"
                :style="stc(viewPort.color)"
                class="multiselect__tag margin-t-10"
                @click="$emit('removeShapeFromMap', viewPort.id); viewPorts.splice(index, 1); removeFromShapes(viewPort.id)">
                <span>
                  {{ viewPort.name }}
                </span>
                <i
                  aria-hidden="true"
                  tabindex="1"
                  class="multiselect__tag-icon"
                />
              </span>
            </span>
          </div>
        </div> -->

        <!-- <div
          v-if="selectedGeoSearchOption == 'Draw manually'"
          class="input-group"
          style="width: 100%">
          <div class="section-label">
            <div
              v-if="!viewPortNameEdit"
              class="label-copy">
              <span v-if="currentShape.name">{{ currentShape.name }}</span>
              <span v-else>Polygon name</span>
            </div>
            <div
              v-else
              class="label-copy margin-r-5">
              <input
                id="shapeName"
                v-model="currentShape.name"
                class="input-sm form-control"
                @keydown.enter.prevent="addShapeToList(currentShape);currentShape = {};viewPortNameEdit = false;reactiveDraw('draw_polygon')">
            </div>
            <div class="section-controls">
              <div v-if="!viewPortNameEdit">
                <button
                  v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                  :disabled="!currentShape.id"
                  type="button"
                  class="btn btn-sm btn-default"
                  @click="viewPortNameEdit=true">
                  <i class="fa fa-pencil"/>
                </button>
              </div>
              <div v-else>
                <button
                  type="button"
                  class="btn btn-sm btn-default"
                  @click="viewPortNameEdit=false">Set
                </button>
                <button
                  v-tooltip.top="{ content: 'Remove polygon', delay: { show: 700, hide: 100 }}"
                  type="button"
                  class="btn btn-sm btn-default"
                  @click="viewPortNameEdit=false; $emit('removeShapeFromMap', currentShape.id);currentShape = {};reactiveDraw('draw_polygon')"><i class="fa fa-trash"/></button>
              </div>
            </div>
          </div>
          <div class="section-content">
            <button
              :disabled="!currentShape.id || !currentShape.name"
              type="button"
              class="btn btn-block btn-sm btn-default margin-b-10"
              @click="addShapeToList(currentShape);currentShape = {};viewPortNameEdit = false;reactiveDraw('draw_polygon')"
            >
              Add to List
            </button>

            <span v-if="searchModel.shapes.length">
              <span
                v-for="(shape, index) in searchModel.shapes"
                :key="shape.key"
                :style="stc(shape.color)"
                class="multiselect__tag margin-t-10"
                @click="$emit('removeShapeFromMap', shape.key); searchModel.shapes.splice(index, 1)">
                <span>
                  {{ shape.name }}
                </span>
                <i
                  aria-hidden="true"
                  tabindex="1"
                  class="multiselect__tag-icon"
                />
              </span>
            </span>
          </div>
        </div>
        <div
          v-if="selectedGeoSearchOption == 'Travel Time'"
          class="input-group"
          style="width: 100%">
          <div class="section-content">
            <div
              v-for="(point, index) in points"
              :key="point.id"
              class="marker-select-group">
              <div class="options-section">
                <div
                  :style="stc(point.color)"
                  class="marker-section">
                  <span
                    :style="stc(point.color)"
                    class="badge">{{ index + 1 }}</span>
                </div>
                <div class="dropdown">
                  <button
                    id="dropdownMenu2"
                    class="btn btn-block btn-sm btn-default dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true">
                    <span
                      v-if="selectedPoints.indexOf(point.id) > -1"
                      class="option">
                      <span v-html="getIcon(by)"/>
                      <span>{{ travelTypes[point.id] }}</span>
                    </span>
                    <span
                      v-else
                      class="option">Transportation</span>
                    <span class="caret"/>
                  </button>
                  <ul
                    class="dropdown-menu fancy-shadow"
                    aria-labelledby="dropdownMenu2">
                    <li @click="selectType('Walk', point.id, '#FF6A42', 'walk')"><a href="#"><i class="fa fa-male"/> Walk</a></li>
                    <li @click="selectType('Bike', point.id, '#FF6A42', 'bike')"><a href="#"><i class="fa fa-bicycle"/> Bike</a></li>
                    <li @click="selectType('Car', point.id, '#FF6A42', 'car')"><a href="#"><i class="fa fa-car"/> Car</a></li>
                    <li @click="selectType('Transit', point.id, '#FF6A42', 'transit')"><a href="#"><i class="fa fa-train"/> Transit</a></li>
                  </ul>
                </div>
                <div class="dropdown">
                  <button
                    id="dropdownMenu3"
                    class="btn btn-block btn-sm btn-default dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true">
                    <span
                      v-if="travelTimesValues.indexOf(point.id) > -1"
                      class="option">{{ travelTimes[point.id] }} min</span>
                    <span
                      v-else
                      class="option">Time</span>
                    <span class="caret"/>
                  </button>
                  <ul
                    class="dropdown-menu fancy-shadow"
                    aria-labelledby="dropdownMenu3">
                    <li @click="selectTravelTime(10, point.id, '#FF6A42')"><a href="#">10 min</a></li>
                    <li @click="selectTravelTime(15, point.id, '#FF6A42')"><a href="#">15 min</a></li>
                    <li @click="selectTravelTime(30, point.id, '#FF6A42')"><a href="#">30 min</a></li>
                    <li @click="selectTravelTime(45, point.id, '#FF6A42')"><a href="#">45 min</a></li>
                    <li @click="selectTravelTime(60, point.id, '#FF6A42')"><a href="#">60 min</a></li>
                  </ul>
                </div>
              </div>
              <div
                v-if="by == 'transit' || by == 'car'"
                class="options-section">
                <div class="flex-row">
                  <div class="col-50">
                    <label
                      class="css-input switch switch-sm switch-primary"
                      style="transform: translateY(1px); margin: 6px 0 0;">
                      <input
                        v-model="rushHour"
                        type="checkbox"><span/> Rush Hour
                    </label>
                  </div>
                  <div
                    v-if="by == 'transit'"
                    class="col-50"
                  >
                    <label>Start time</label>
                    <div>
                      <input
                        v-time24-match
                        v-model="rushHourStartTime"
                        :class="{'has-error': rushHourStartTimeError}"
                        class="input-sm form-control start-input"
                        placeholder="HH:MM"
                        @keydown.enter.prevent="updateTimeForTimeTravel">
                    </div>
                  </div>
                </div>
              </div>
              <div class="controls"/>
              <span v-if="lastCalcObject.pointId">
                <span
                  :style="stc('#FF6A42')"
                  class="multiselect__tag margin-t-10"
                  @click="$emit('removeShapeFromMap', lastCalcObject.pointId); lastCalcObject = {}">
                  <span>
                    {{ lastCalcObject.by }}, {{ lastCalcObject.time }}min <span v-if="rushHour && lastCalcObject.by !='Bike'"> - with Rush hour</span>
                  </span>
                  <i
                    aria-hidden="true"
                    tabindex="1"
                    class="multiselect__tag-icon"
                  />
                </span>
              </span>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>
