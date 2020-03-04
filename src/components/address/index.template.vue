<template>
  <div>
    <div class="form-group margin-b-10">
      <label>Address</label>
      <autocomplete
        ref="autocomplete_profile"
        :setData="setStreet"
        :onSearch="getSearchSuggestions"
        :itemHighlighted="'highlightedName'">
        <template
          slot="products"
          slot-scope="{ item }">
          <span class="suggestion_autocomplete">{{ get_icon(item.suggestionType) }}</span>
        </template>
      </autocomplete>
    </div>
    <div :class="{'row': !fullScreen}">
      <div
        :class="{'col-xs-6': !fullScreen}"
        class="form-group margin-b-10">
        <label for="street">Street</label>
        <input
          id="street"
          v-model="address.street"
          class="form-control"
          type="text"
          name="street">
      </div>
      <div
        :class="{'col-xs-6': !fullScreen}"
        class="form-group margin-b-10">
        <label for="streetNumber">Street number</label>
        <input
          id="streetNumber"
          v-model="address.streetNumber"
          class="form-control"
          type="text"
          name="streetNumber">
      </div>
      <div
        :class="{'col-xs-3': !fullScreen, 'has-error': errors.has(`${formScope}.zip`)}"
        class="form-group margin-b-10">
        <label for="zip">Zip</label>
        <input
          v-validate="{ max: 20 }"
          v-number-input
          id="zip"
          v-model="address.zip"
          class="form-control"
          name="zip"
        >
        <div
          v-show="errors.has(`${formScope}.zip`)"
          class="help-block">{{ errors.first(`${formScope}.zip`) }}
        </div>
      </div>
      <div
        :class="{'col-xs-6': !fullScreen, 'has-error': errors.has(`${formScope}.city`)}"
        class="form-group margin-b-10">
        <label for="city">City</label>
        <input
          v-validate="{ max: 50 }"
          id="cityName"
          v-model="address.locality"
          :data-vv-scope="formScope"
          class="form-control"
          type="text"
          name="city">
        <div
          v-show="errors.has(`${formScope}.city`)"
          class="help-block">{{ errors.first(`${formScope}.city`) }}
        </div>
      </div>
      <div
        :class="{'col-xs-3': !fullScreen}"
        class="form-group margin-b-10">
        <label for="country">Country</label>
        <select
          id="country"
          v-model="address.countryCode"
          class="form-control"
          name="country"
          size="1">
          <option
            value=""
            disabled
            hidden/>
          <option
            v-for="(country, cnKey) in countries"
            :value="country.text"
            :key="cnKey">
            {{ country.text }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
