<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/poi.png">
        </div>
        <div class="label-copy">Points of interest</div>
      </div>
      <div class="section-content"/>
    </div>
    <div class="data-section stand-out no-z">
      <div class="section-label">
        <div class="label-copy">Categories</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <div class="input-group tamed-input-group margin-b-10">
            <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
            <multiselect
              v-model="selectedRootCategory"
              :placeholder="'Gastronomy'"
              :options="rootPoiCategories"
              :group-select="false"
              :multiple="false"
              :limit="1"
              :allow-empty="false"
              :limit-text="limitText"
              :taggable="true"
              :show-labels="false"
              :clear-on-select="true"
              :close-on-select="true"
              label="nameEn"
              class="multiselect-sm"
              name="property type"
              track-by="id"
              openDirection="bottom"
            />
          </div>
        </div>
        <div class="form-group">
          <div class="input-group tamed-input-group margin-b-10">
            <span class="input-group-addon input-icon"><i class="fa fa-tags"/></span>
            <multiselect
              v-model="selectedPoiSubcategory"
              :placeholder="'Type'"
              :options="poiSubCategories"
              :group-select="false"
              :multiple="false"
              :limit="1"
              :allow-empty="false"
              :limit-text="limitText"
              :taggable="true"
              :show-labels="false"
              :clear-on-select="true"
              :close-on-select="true"
              label="nameEn"
              class="multiselect-sm"
              name="property type"
              track-by="id"
              openDirection="bottom"
            />
          </div>
          <div>
            <span
              v-for="category in selectedCategories"
              :key="category.id"
              class="group-green">
              <span class="multiselect__tag"><span>{{ category.nameEn }}</span>
                <i
                  class="multiselect__tag-icon"
                  @click="removeCategory(category)"
                />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">View by</div>
        <div class="section-controls">
          <div class="btn-group">
            <button
              :class="{'active' : poiViews['traveltime']}"
              type="button"
              class="btn btn-sm btn-default dropdown-toggle"
              @click="poiTabs('traveltime')">
              Travel Time
            </button>
            <button
              :class="{'active' : poiViews['radius']}"
              type="button"
              class="btn btn-sm btn-default dropdown-toggle"
              @click="poiTabs('radius')">
              Radius
            </button>
            <button
              :class="{'active' : poiViews['manualDraw']}"
              type="button"
              class="btn btn-sm btn-default dropdown-toggle"
              @click="poiTabs('manualDraw')">
              Manual Draw
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="poiViews['traveltime']"
        class="section-content">
        <div class="marker-select-group">
          <div class="options-section">
            <div class="dropdown">
              <button
                id="dropdownMenu2"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                class="btn btn-block btn-sm btn-default dropdown-toggle">
                <span class="option">Transportation</span> <span class="caret"/>
              </button>
              <ul
                aria-labelledby="dropdownMenu2"
                class="dropdown-menu fancy-shadow">
                <li><a href="#"><i class="fa fa-male"/> Walk</a></li>
                <li><a href="#"><i class="fa fa-bicycle"/> Bike</a></li>
                <li><a href="#"><i class="fa fa-car"/> Car</a></li>
                <li><a href="#"><i class="fa fa-train"/> Transit</a></li>
              </ul>
            </div>
            <div class="dropdown open">
              <button
                id="dropdownMenu3"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
                class="btn btn-block btn-sm btn-default dropdown-toggle">
                <span class="option">Time</span> <span class="caret"/>
              </button>
              <ul
                aria-labelledby="dropdownMenu3"
                class="dropdown-menu fancy-shadow">
                <li><a href="#">10 min</a></li>
                <li><a href="#">15 min</a></li>
                <li><a href="#">30 min</a></li>
                <li><a href="#">45 min</a></li>
                <li><a href="#">60 min</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="poiViews['radius']"
        class="section-content">
        <div class="input-group">
          <input
            id="radius"
            placeholder="Radius"
            type="number"
            name="radius"
            class="form-control input-sm"
            aria-required="false"
            aria-invalid="false">
          <span class="input-group-addon">km</span>
        </div>
      </div>
      <div
        v-if="poiViews['manualDraw']"
        class="section-content">
        <p class="font-s13">Please draw a manual sector on the map.</p>
      </div>
    </div>
  </div>
</template>
