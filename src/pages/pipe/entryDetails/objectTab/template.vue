<template>
  <div class="tab-pane active padding-b-20">
    <form
      id="objectInfoForm"
      data-vv-scope="objectInfoForm"
      @submit.prevent="updateObjectInfo('objectInfoForm')">
      <div
        v-if="item.entityModifiableInfo">
        <basic-info
          :item="item"
          @openDetailView="openDetailView"/>
        <!-- Basic Info -->
        <div class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click.stop="sectionBasic=!sectionBasic">
            <div class="label-copy">Basic Info</div>
            <div class="section-controls">
              <button class="btn btn-sm btn-default has-tooltip cursor-none">
                <i
                  :class="{'fa-angle-up': sectionBasic, 'fa-angle-down': !sectionBasic}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-if="sectionBasic"
            class="section-content">
            <!-- <div class="form-group row">
              <div class="col-xs-12">
                <label for="url">Title</label>
                <input
                  id="url"
                  v-model="item.name"
                  notranslate
                  type="text"
                  class="form-control">
              </div>
            </div> -->
            <div class="form-group row">
              <div class="col-xs-6">
                <div>
                  <label for="cityName">Street</label>
                  <input
                    id="street"
                    v-model="item.entityModifiableInfo.address.street"
                    notranslate
                    type="text"
                    name="street"
                    class="form-control">
                </div>
              </div>
              <div class="col-xs-6">
                <div>
                  <label for="cityName">Street Number</label>
                  <input
                    id="streetNumber"
                    v-model="item.entityModifiableInfo.address.streetNumber"
                    notranslate
                    type="text"
                    name="streetNumber"
                    class="form-control">
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.zip')}"
                class="col-xs-6">
                <div>
                  <label for="zip">ZIP</label>
                  <input
                    v-validate="{ max: 20 }"
                    v-number-input
                    id="zip"
                    v-model="item.entityModifiableInfo.address.zip"
                    notranslate
                    name="zip"
                    class="form-control">
                  <div
                    v-show="errors.has('objectInfoForm.zip')"
                    class="help-block">{{ errors.first('objectInfoForm.zip') }}
                  </div>
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.locality')}"
                class="col-xs-6">
                <div>
                  <label for="locality">Locality</label>
                  <input
                    v-validate="{ max: 50 }"
                    id="locality"
                    v-model="item.entityModifiableInfo.address.locality"
                    notranslate
                    type="text"
                    name="locality"
                    class="form-control">
                  <div
                    v-show="errors.has('objectInfoForm.locality')"
                    class="help-block">{{ errors.first('objectInfoForm.locality') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- / Basic Info -->
        <!-- Building -->
        <div class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click="sectionBuilding=!sectionBuilding">
            <div class="label-copy">Building</div>
            <div class="section-controls">
              <button class="btn btn-sm btn-default has-tooltip cursor-none">
                <i
                  :class="{'fa-angle-up': sectionBuilding, 'fa-angle-down': !sectionBuilding}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-show="sectionBuilding"
            class="section-content">
            <div class="form-group row">
              <div
                :class="{'has-error': errors.has('objectInfoForm.room number')}"
                class="col-xs-6">
                <label for="">Room/s</label>
                <input
                  v-number-input
                  v-validate="{min_value: 1, max_value: 14 }"
                  v-model="item.entityModifiableInfo.buildingInfo.roomCount"
                  :withStep5="true"
                  name="room number"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.room number')"
                  class="help-block">{{ errors.first('objectInfoForm.room number') }}
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.built year')}"
                class="col-xs-6">
                <label for="">Built Year</label>
                <input
                  v-number-input
                  v-validate="'min_value:1800|max_value:' + new Date().getFullYear()"
                  v-model="item.entityModifiableInfo.buildingInfo.builtYear"
                  name="built year"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.built year')"
                  class="help-block">{{ errors.first('objectInfoForm.built year') }}
                </div>
              </div>
            </div>
            <div class="form-group row">
              <div
                :class="{'has-error': errors.has('objectInfoForm.living area')}"
                class="col-xs-6">
                <label for="">Living Area</label>
                <input
                  v-number-input
                  v-validate="{min_value: 1, max_value: 100000 }"
                  v-model="item.entityModifiableInfo.buildingInfo.areaLiving"
                  name="living area"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.living area')"
                  class="help-block">{{ errors.first('objectInfoForm.living area') }}
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.renovation year')}"
                class="col-xs-6">
                <label for="">Renovation Year</label>
                <input
                  v-number-input
                  v-validate="'min_value:1800|max_value:' + new Date().getFullYear()"
                  v-model="item.entityModifiableInfo.buildingInfo.renovationYear"
                  name="renovation year"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.renovation year')"
                  class="help-block">{{ errors.first('objectInfoForm.renovation year') }}
                </div>
              </div>
            </div>
            <div class="form-group row">
              <div
                :class="{'has-error': errors.has('objectInfoForm.property area')}"
                class="col-xs-6">
                <label for="">Property Area</label>
                <input
                  v-number-input
                  v-validate="{min_value: 1, max_value: 100000 }"
                  v-model="item.entityModifiableInfo.buildingInfo.areaProperty"
                  name="property area"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  type="text"
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.property area')"
                  class="help-block">{{ errors.first('objectInfoForm.property area') }}
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.floor')}"
                class="col-xs-6">
                <label for="">Floor</label>
                <input
                  v-number-input
                  v-validate="{ max_value: 100 }"
                  v-model="item.entityModifiableInfo.buildingInfo.floorNumber"
                  name="floor"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  type="text"
                  class="form-control">
                <div
                  v-show="errors.has('objectInfoForm.floor')"
                  class="help-block">{{ errors.first('objectInfoForm.floor') }}
                </div>
              </div>
            </div>
            <div class="form-group row">
              <div
                :class="{'has-error': errors.has('objectInfoForm.usable area')}"
                class="col-xs-6">
                <label for="">Usable Area</label>
                <input
                  v-number-input
                  v-validate="{min_value: 1, max_value: 100000 }"
                  v-model="item.entityModifiableInfo.buildingInfo.areaUsable"
                  name="usable area"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  type="text"
                  class="form-control v-input-number">
                <div
                  v-show="errors.has('objectInfoForm.usable area')"
                  class="help-block">{{ errors.first('objectInfoForm.usable area') }}
                </div>
              </div>
              <div
                :class="{'has-error': errors.has('objectInfoForm.total floors')}"
                class="col-xs-6">
                <label for="">Total Floors</label>
                <input
                  v-number-input
                  v-validate="{max_value: 100 }"
                  v-model="item.entityModifiableInfo.buildingInfo.floorCount"
                  name="total floors"
                  data-vv-scope="objectInfoForm"
                  notranslate
                  class="form-control">
                <div
                  v-show="errors.has('objectInfoForm.total floors')"
                  class="help-block">{{ errors.first('objectInfoForm.total floors') }}
                </div>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-xs-6">
                <label for="">Availability</label>
                <input
                  id=""
                  v-model="item.entityModifiableInfo.buildingInfo.availabilityText"
                  notranslate
                  type="text"
                  class="form-control">
              </div>
            </div>
          </div>
        </div>
        <!-- / Building -->
        <!-- Property -->
        <div class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click.stop="sectionProperty=!sectionProperty">
            <div class="label-copy">Property</div>
            <div class="section-controls">
              <button
                class="btn btn-sm btn-default has-tooltip cursor-none">
                <i
                  :class="{'fa-angle-up': sectionProperty, 'fa-angle-down': !sectionProperty}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-if="sectionProperty"
            class="section-content">
            <div class="form-group row">
              <div class="col-xs-6">
                <label for="">EGID</label>
                <input
                  id=""
                  v-model="item.entityModifiableInfo.address.govId.egid"
                  notranslate
                  type="text"
                  class="form-control">
              </div>
              <div class="col-xs-6">
                <label for="">Parcel Nummer</label>
                <input
                  id=""
                  v-model="item.entityModifiableInfo.address.landId.parcelNumber"
                  notranslate
                  type="text"
                  class="form-control">
              </div>
            </div>
          </div>
        </div>
        <!-- / Property -->
        <!-- Cutom Section -->
        <div
          class="data-section stand-out">
          <div
            class="section-label cursor-show"
            @click="showCustomObjectInfo=!showCustomObjectInfo">
            <div class="label-copy">Custom Data</div>
            <div class="section-controls">
              <button
                :disabled="item.isDeleted"
                type="button"
                class="btn btn-sm btn-success"
                @click.stop="addObjectField=!addObjectField"><i class="fa fa-plus"/> Add Field</button>
              <button
                v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i
                  :class="{'fa-angle-up': showCustomObjectInfo, 'fa-angle-down': !showCustomObjectInfo}"
                  class="fa"/>
              </button>
            </div>
          </div>
          <div
            v-if="showCustomObjectInfo"
            class="section-content">
            <div
              v-if="val(item, item => item.entityModifiableInfo.buildingInfo.customFields)"
              class="row margin-b-10">
              <div
                v-for="(field, fieldKey) in item.entityModifiableInfo.buildingInfo.customFields"
                :key="fieldKey"
                class="col-xs-12">
                <label notranslate>{{ field.name }}</label>
                <div class="input-group">
                  <input
                    v-model="field.value"
                    notranslate
                    type="text"
                    class="form-control">
                  <span class="input-group-btn">
                    <button
                      class="btn btn-default"
                      type="button"
                      @click="deleteObjectField(field)"><i class="fa fa-close"/></button>
                  </span>
                </div>
              </div>
            </div>
            <div
              v-if="addObjectField"
              class="stand-plate bg-warning-light fancy-shadow">
              <div class="plate-title">Add Field</div>
              <form
                id="addObjectField"
                data-vv-scope="addObjectField"
                @submit.prevent="addNewObjectField('addObjectField')">
                <div class="plate-content">
                  <div
                    :class="{'has-error': errors.has('addObjectField.name')}"
                    class="form-group">
                    <label>Name</label>
                    <input
                      v-validate="{ required: true, max: 50 }"
                      v-model="objectField.name"
                      name="name"
                      data-vv-scope="addObjectField"
                      notranslate
                      type="text"
                      class="form-control input-sm">
                    <div
                      v-show="errors.has('addObjectField.name')"
                      class="help-block">{{ errors.first('addObjectField.name') }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Value</label>
                    <input
                      v-model="objectField.value"
                      notranslate
                      type="text"
                      class="form-control input-sm">
                  </div>
                </div>
                <div class="plate-controls">
                  <button
                    type="button"
                    class="btn btn-sm btn-default"
                    @click="cancelObjectField()">Cancel</button>
                  <button
                    type="submit"
                    class="btn btn-sm btn-success">Add new Field</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!-- / Cutom Section -->
        <!-- Buttons Section -->
        <div class="data-section">
          <div
            class="section-content padding-t-10">
            <div class="form-group">
              <button
                :disabled="updatingEntry || item.isDeleted"
                type="submit"
                class="btn btn-block btn-sm btn-success">
                <i
                  v-if="updatingEntry"
                  class="fa fa-circle-o-notch fa-spin"/> Update</button>
            </div>
          </div>
        </div>
        <!-- / Buttons Section -->
      </div>
    </form>
  </div>
</template>
