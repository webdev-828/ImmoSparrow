<template>
  <form
    id="pricePredictorTrans"
    data-vv-scope="pricePredictorTrans"
    @submit.prevent="sendData">
    <div class="form-group">
      <div class="tabs-input">
        <div class="input-tab">
          <label class="css-input css-radio css-radio-primary">
            <input
              checked
              type="radio"
            ><span class="highlight-bar"/><span class="caption">Buy</span>
          </label>
        </div>
        <div class="input-tab">
          <label
            v-tooltip.top="{ content: 'Buy supported only', delay: { show: 700, hide: 100 }}"
            class="css-input css-radio css-radio-primary disabled">
            <input
              disabled="true"
              type="radio"><span class="highlight-bar"/><span class="caption">Rent</span>
          </label>
        </div>
      </div>
    </div>
    <custom-select
      v-if="!moreTabs['marketPricingInfo']"
      v-model="selectedPropertyType"
      :dataSet="propTypes"
      :approved.sync="approved.propertyType"
      formName="pricePredictorTrans"
      fieldName="propertyType"
      label="Property type"
      validate="required"
      @input="updateSelected" />
    <custom-input
      v-model="searchModel.builtYear"
      :validate="'required|min_value:1800'"
      :approved.sync="approved.builtYear"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="builtYear"
      label="Built year"
      @enter="activeRenovationSlider ? nextField('renovationYear', $event) : nextField('roomsNumber', $event);"
    />
    <custom-input
      v-model="searchModel.roomCount"
      :validate="{required: true, min_value: roomsSlider.min, max_value: roomsSlider.max }"
      :approved.sync="approved.roomsNumber"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="roomsNumber"
      label="Rooms"
      step5="true"
      @enter="goNext($event, 'roomCount', 'livingArea')"
    />
    <custom-input
      v-model="searchModelTransaction.livingArea"
      :validate="{required: true, min_value: livingSpaceSlider.min, max_value: livingSpaceSlider.max}"
      :approved.sync="approved.livingArea"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="livingArea"
      label="Living Area (net)<var notranslate>, m<sup>2</sup></var>"
      @enter="goNext($event, 'livingArea', selectedPropertyType.id === 100 ? 'propertyArea' : 'bathroomsCount')"
    />
    <!-- Slider #4 -->
    <custom-input
      v-if="selectedPropertyType.id === 100"
      v-model="searchModelTransaction.propertyArea"
      :validate="{required: true, min_value: propertySpaceSlider.min, max_value: propertySpaceSlider.max}"
      :approved.sync="approved.propertyArea"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="propertyArea"
      label="Property Area"
      @enter="goNext($event, 'propertyArea', 'cubature')"
    />
    <custom-input
      v-if="selectedPropertyType.id === 100"
      v-model="searchModelTransaction.cubature"
      :validate="{required: selectedPropertyType.id === 100, min_value: 1, max_value: 100000}"
      :approved.sync="approved.cubature"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="cubature"
      label="Cubature"
      @enter="goNext($event, 'cubature', 'bathroomsCount')"
    />
    <custom-input
      v-model="searchModelTransaction.bathroomsCount"
      :validate="{required: true, min_value: 1, max_value: 1000}"
      :approved.sync="approved.bathroomsCount"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="bathroomsCount"
      label="Bathrooms count"
      @enter="goNext($event, 'bathroomsCount', 'garageCount')"
    />
    <custom-input
      v-model="searchModelTransaction.garageCount"
      :validate="{required: true, min_value: 0, max_value: 1000}"
      :approved.sync="approved.garageCount"
      type="number"
      displayType="inline"
      formName="pricePredictorTrans"
      fieldName="garageCount"
      label="Garage count"
      @enter="selectedPropertyType.id === 100 ? goNext($event, 'garageCount', 'houseTypes') : goNext($event, 'garageCount', 'quality')"
    />
    <div
      v-if="selectedPropertyType.id === 100"
      :class="{'has-error': errors.has('pricePredictorTrans.houseTypes')}"
      class="form-group">
      <div class="slider-with-inputs">
        <div class="flex-label-group">
          <label for="amount">House types</label>
        </div>
        <div
          class="input-group tamed-input-group">
          <multiselect
            v-validate="{required: selectedPropertyType.id === 100}"
            :value="getValue(searchModelTransaction.houseType, convertEnumToArray('PricePredPropertyHouseType'))"
            :options="convertEnumToArray('PricePredPropertyHouseType')"
            :custom-label="propLimitLabel"
            :searchable="true"
            :show-labels="false"
            :allow-empty="false"
            :taggable="true"
            :clear-on-select="true"
            :close-on-select="false"
            :placeholder="localize.translate('Select one')"
            name="houseTypes"
            data-vv-scope="pricePredictorTrans"
            openDirection="bottom"
            track-by="id"
            label="name"
            class="max-height-none"
            @input="opt => searchModelTransaction.houseType = opt.id"
            @select="goNext(undefined, 'houseTypes', 'quality')"/>
          <span
            v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
            class="input-group-addon input-icon bg-white approve-switch">
            <label class="css-input switch switch-square switch-sm switch-success">
              <input
                v-model="approved.houseTypes"
                type="checkbox"
                @change="validateFiled('houseTypes')">
              <span class="icon-holder">
                <i class="fa fa-check-circle text-white first-icon"/>
                <i class="fa fa-warning text-warning second-icon"/>
              </span>
            </label>
          </span>
        </div>
        <div
          v-show="errors.has('pricePredictorTrans.houseTypes')"
          class="help-block">{{ errors.first('pricePredictorTrans.houseTypes') }}
        </div>
      </div>
    </div>

    <div
      :class="{'has-error': errors.has('pricePredictorTrans.quality')}"
      class="form-group">
      <div class="slider-with-inputs">
        <div class="flex-label-group">
          <label for="amount">Construction Quality</label>
        </div>
        <div
          class="input-group tamed-input-group">
          <multiselect
            v-validate="'required'"
            :value="getValue(searchModelTransaction.quality, convertEnumToArray('PricePredQualityType'))"
            :options="convertEnumToArray('PricePredQualityType')"
            :custom-label="propLimitLabel"
            :searchable="true"
            :show-labels="false"
            :allow-empty="false"
            :taggable="true"
            :clear-on-select="true"
            :close-on-select="false"
            :placeholder="localize.translate('Select one')"
            name="quality"
            data-vv-scope="pricePredictorTrans"
            openDirection="bottom"
            track-by="id"
            label="name"
            class="max-height-none"
            @input="opt => searchModelTransaction.quality = opt.id"
            @select="goNext(undefined, 'quality', 'condition')"/>
          <span
            v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
            class="input-group-addon input-icon bg-white approve-switch">
            <label class="css-input switch switch-square switch-sm switch-success">
              <input
                v-model="approved.quality"
                type="checkbox"
                @change="validateFiled('quality')">
              <span class="icon-holder">
                <i class="fa fa-check-circle text-white first-icon"/>
                <i class="fa fa-warning text-warning second-icon"/>
              </span>
            </label>
          </span>
        </div>
        <div
          v-show="errors.has('pricePredictorTrans.quality')"
          class="help-block">{{ errors.first('pricePredictorTrans.quality') }}
        </div>
      </div>
    </div>

    <div
      :class="{'has-error': errors.has('pricePredictorTrans.condition')}"
      class="form-group">
      <div class="slider-with-inputs">
        <div class="flex-label-group">
          <label for="amount">Building Condition</label>
        </div>
        <div
          class="input-group tamed-input-group">
          <multiselect
            v-validate="'required'"
            :value="getValue(searchModelTransaction.condition, convertEnumToArray('PricePredPropertyConditionType'))"
            :options="convertEnumToArray('PricePredPropertyConditionType')"
            :custom-label="propLimitLabel"
            :searchable="true"
            :show-labels="false"
            :allow-empty="false"
            :taggable="true"
            :clear-on-select="true"
            :close-on-select="false"
            :placeholder="localize.translate('Select one')"
            name="condition"
            data-vv-scope="pricePredictorTrans"
            openDirection="bottom"
            track-by="id"
            label="name"
            class="max-height-none"
            @input="opt => searchModelTransaction.condition = opt.id"
            @select="goNext(undefined, 'condition', 'microLocation')"/>
          <span
            v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
            class="input-group-addon input-icon bg-white approve-switch">
            <label class="css-input switch switch-square switch-sm switch-success">
              <input
                v-model="approved.condition"
                type="checkbox"
                @change="validateFiled('condition')">
              <span class="icon-holder">
                <i class="fa fa-check-circle text-white first-icon"/>
                <i class="fa fa-warning text-warning second-icon"/>
              </span>
            </label>
          </span>
        </div>
        <div
          v-show="errors.has('pricePredictorTrans.condition')"
          class="help-block">{{ errors.first('pricePredictorTrans.condition') }}
        </div>
      </div>
    </div>

    <div
      :class="{'has-error': errors.has('pricePredictorTrans.microLocation')}"
      class="form-group">
      <div class="slider-with-inputs">
        <div class="flex-label-group">
          <label for="amount">Micro location</label>
        </div>
        <div
          class="input-group tamed-input-group">
          <multiselect
            v-validate="'required'"
            :value="getValue(searchModelTransaction.microLocation, microLocationTypes)"
            :options="microLocationTypes"
            :custom-label="propLimitLabel"
            :searchable="true"
            :show-labels="false"
            :allow-empty="false"
            :taggable="true"
            :clear-on-select="true"
            :close-on-select="true"
            :placeholder="localize.translate('Select one')"
            data-vv-scope="pricePredictorTrans"
            name="microLocation"
            openDirection="top"
            track-by="id"
            label="name"
            class="show-label"
            @input="opt => searchModelTransaction.microLocation = opt.id"
            @select="goNext(undefined, 'microLocation', 'submitForm')"/>
          <span
            v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
            class="input-group-addon input-icon bg-white approve-switch">
            <label class="css-input switch switch-square switch-sm switch-success">
              <input
                v-model="approved.microLocation"
                type="checkbox"
                @change="validateFiled('microLocation')">
              <span class="icon-holder">
                <i class="fa fa-check-circle text-white first-icon"/>
                <i class="fa fa-warning text-warning second-icon"/>
              </span>
            </label>
          </span>
        </div>
        <div
          v-show="errors.has('pricePredictorTrans.microLocation')"
          class="help-block">{{
          errors.first('pricePredictorTrans.microLocation') }}
        </div>
      </div>
    </div>

    <div
      class="form-group">
      <div class="row">
        <div class="col-xs-12">
          <button
            :disabled="valuesApproved || $validator.errors.items.length > 0 || (buttonIsLoading && searchMap)"
            class="btn btn-default width100percent margin-b-5"
            type="submit"
            name="submitForm"
            @click="searchMap = true">
            <i
              v-if="buttonIsLoading"
              class="fa fa-circle-o-notch fa-spin"/>
            <i
              v-else
              class="fa fa-calculator"/> Calculate
          </button>
          <div class="font-s12 text-muted">
            Approve the fields manualy to enable calculation
          </div>
        </div>
      </div>
    </div>

  </form>
</template>
