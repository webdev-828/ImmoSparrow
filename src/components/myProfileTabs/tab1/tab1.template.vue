<template>
  <form
    @submit.prevent="updateUserData"
    @keydown.enter.prevent="">
    <div class="row">
      <div
        v-if="user.primaryInfo"
        class="col-xs-4">
        <div class="form-group">
          <label>Profile Picture</label>
          <profileImgUploader
            :imgData="imgData"
            defaultAvatarLink="avatars/avatar10.jpg"/>
        </div>
        <div
          :class="{'has-error': errors.first('first-name')}"
          class="form-group margin-b-10">
          <label for="firstName">First Name</label>
          <input
            v-validate="'required|alpha'"
            id="firstName"
            v-model="user.primaryInfo.firstName"
            class="form-control"
            type="text"
            name="first-name">
          <div class="help-block" >
            {{ errors.first('first-name') }}
          </div>
        </div>
        <div
          :class="{'has-error': errors.first('last-name')}"
          class="form-group margin-b-10">
          <label for="lastName">Last Name</label>
          <input
            v-validate="'required|alpha'"
            id="lastName"
            v-model="user.primaryInfo.lastName"
            class="form-control"
            type="text"
            name="last-name">
          <div class="help-block">
            {{ errors.first('last-name') }}
          </div>
        </div>
        <div
          :class="{'has-error': errors.first('email')}"
          class="form-group margin-b-10">
          <label for="email">Email</label>
          <input
            v-validate="'required|email'"
            id="email"
            v-model="user.email"
            class="form-control"
            type="email"
            name="email">
          <div class="help-block">
            {{ errors.first('email') }}
          </div>
        </div>
      </div>
      <div class="col-xs-4">
        <Address
          v-if="user.address"
          :address="user.address"
          :fullScreen="true" />
      </div>
      <div
        v-if="user.contactInfo"
        class="col-xs-4">
        <div
          :class="{'has-error': errors.first('phone')}"
          class="form-group margin-b-10">
          <label for="phone">Phone</label>
          <the-mask
            v-validate="{regex: /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/ }"
            id="phone"
            v-model="user.contactInfo.workPhone"
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
            v-model="user.contactInfo.mobilePhone"
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
            v-model="user.contactInfo.skypeName"
            class="form-control"
            type="text">
        </div>
        <div class="form-group margin-b-10">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="user.contactInfo.websiteUrl"
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
