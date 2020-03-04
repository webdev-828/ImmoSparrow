<template>
  <form
    v-if="agencyInfo"
    class="tabs-content padding-20"
    @submit.prevent="updateAgencyInfo"
    @keydown.enter.prevent="">
    <div class="form-group">
      <label>Profile Picture</label>
      <profileImgUploader
        :imgData="imgData"
        defaultAvatarLink="icons/Invest inactive.png"/>
    </div>
    <div class="row">
      <div class="col-xs-4">
        <div
          :class="{'has-error': errors.first('agency-name')}"
          class="form-group">
          <label for="agency-name">Name</label>
          <input
            v-validate="'required'"
            id="agency-name"
            v-model="agencyInfo.primaryInfo.name"
            class="form-control"
            name="agency-name"
            type="text">
          <div class="help-block" >
            {{ errors.first('agency-name') }}
          </div>
        </div>
      </div>
      <div class="col-xs-4">
        <Address
          :address="agencyInfo.address"
          :fullScreen="true"/>
      </div>
      <div
        v-if="agencyInfo.contactInfo"
        class="col-xs-4">
        <div
          :class="{'has-error': errors.first('phone')}"
          class="form-group margin-b-10">
          <label for="phone">Phone</label>
          <the-mask
            v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
            id="phone"
            v-model="agencyInfo.contactInfo.workPhone"
            class="form-control"
            name="phone"
            masked
            mask="+41 (0) ## ### ## ##"/>
          <div
            v-show="errors.has('phone')"
            class="help-block text-right animated fadeInDown">{{
            errors.first('phone') }}
          </div>
        </div>
        <div
          :class="{'has-error': errors.first('cell')}"
          class="form-group margin-b-10">
          <label for="cell">Cell</label>
          <the-mask
            v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
            id="cell"
            v-model="agencyInfo.contactInfo.mobilePhone"
            class="form-control"
            name="cell"
            masked
            mask="+41 (0) ## ### ## ##"/>
          <div
            v-show="errors.has('cell')"
            class="help-block text-right animated fadeInDown">{{
            errors.first('cell') }}
          </div>
        </div>
        <div class="form-group margin-b-10">
          <label for="skypename">Skype Name</label>
          <input
            id="skypename"
            v-model="agencyInfo.contactInfo.skypeName"
            class="form-control"
            type="text">
        </div>
        <div class="form-group margin-b-10">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="agencyInfo.contactInfo.websiteUrl"
            class="form-control"
            type="text">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-2 col-xs-offset-10 padding-t-10">
        <button
          type="submit"
          class="btn btn-block btn-success">Update</button>
      </div>
    </div>
  </form>
</template>
