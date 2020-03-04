<template>
  <div>
    <div class="data-section no-border">
      <div class="section-label">
        <div class="label-copy">Restricted Area</div>
        <div class="section-controls">
          <div class="dropdown">
            <button
              id="dropdownMenu1"
              class="btn btn-sm btn-default dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true">
              {{ interactWith[locationType] }}
              <span class="caret"/>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-right fancy-shadow"
              aria-labelledby="dropdownMenu1">
              <li><a
                href="#"
                @click="setType(0, 'Address')">Zip/Locality</a></li>
              <li>
                <a
                  href="#"
                  @click="setType(30, 'po_communes')">Commune</a>
              </li>
              <li>
                <a
                  href="#"
                  @click="setType(20, 'po_districts')">District</a>
              </li>
              <li>
                <a
                  href="#"
                  @click="setType(10, 'po_cantons')">Canton</a>
              </li>
              <li>
                <a
                  href="#"
                  @click="setType(15, 'po_market_regions')">Market Region</a>
              </li>
              <li>
                <a
                  href="#"
                  @click="setType(18, 'po_ms_regions')">Ms Region</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="section-content">
        <div class="input-group margin-b-10">
          <span class="input-group-addon input-icon"><i class="fa fa-map-marker"/></span>
          <autocomplete
            ref="autocomplete_geo"
            :setData="addArea"
            :onSearch="getSearchSuggestions"
            :itemHighlighted="'highlightedName'"
            class="">
            <template
              slot="products"
              slot-scope="{ item }">
              <span class="suggestion_type">{{ get_icon(item.suggestionType) }}</span>
            </template>
          </autocomplete>
        </div>
      </div>
    </div>
    <div
      v-show="object.geoRestriction"
      class="data-section stand-out">
      <div
        v-show="object.geoRestriction.addressParts || object.geoRestriction.shapes"
        class="section-content">
        <span
          v-for="(a, index) in object.geoRestriction.addressParts"
          :style="stc(a.color)"
          :key="index"
          class="multiselect__tag">
          <!--<i aria-hidden="true" tabindex="2" class="fa fa-edit add_km" v-on:click="add_km_to_geo_object(index)"></i>-->
          <var @click="removeAddressItem(index)">{{ a.name }} [ {{ get_icon(a.type) }} ]</var>
          <var
            v-show="a.extend_by"
            class="km_hover"
            @click="remove_km_from_geo_object(index)">+ {{ a.extend_by }}km</var>
          <i
            aria-hidden="true"
            tabindex="1"
            class="multiselect__tag-icon"
            @click="removeAddressItem(index)"/>
        </span>
        <span
          v-for="(a, index) in object.geoRestriction.shapes"
          :style="stc(a.color)"
          :key="a.name"
          class="multiselect__tag"
          @click="removeShape(a.id ? a.id : a.name, index)"><span>{{ a.name }}</span>
          <i
            aria-hidden="true"
            tabindex="1"
            class="multiselect__tag-icon"/>
        </span>
      </div>
      <div class="padding-b-10 toggle-template">
        <span>
          <a
            v-show="!showSearchAreas && (object.geoRestriction.addressParts || object.geoRestriction.shapes)"
            type="button"
            class="btn btn-sm btn-default"
            @click="openMapAndDraw"><span>Show map</span></a>
          <a
            v-show="showSearchAreas && (object.geoRestriction.addressParts || object.geoRestriction.shapes)"
            type="button"
            class="btn btn-sm btn-default"
            @click="closeAreasCLick"><span>Close map</span></a>
        </span>
        <span>
          <span v-show="!object.geoRestriction.addressParts && !object.geoRestriction.shapes && showSearchAreas">
            <a
              type="button"
              class="btn btn-sm btn-default"
              @click="closeAreasCLick"><span>Close map</span></a>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
