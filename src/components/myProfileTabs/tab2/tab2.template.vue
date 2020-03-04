<template>
  <div class="row">
    <form
      class="col-xs-4"
      @submit.prevent="updatePassword"
      @keydown.enter.prevent="">
      <div
        :class="{'has-error': errors.first('current-password')}"
        class="form-group">
        <label for="currentPassword">Current password</label>
        <input
          v-validate="'required'"
          id="currentPassword"
          v-model="currentPassword"
          autocomplete="off"
          class="form-control"
          type="password"
          name="current-password">
        <div class="help-block">
          {{ errors.first('current-password') }}
        </div>
      </div>
      <div
        :class="{'has-error': errors.first('password')}"
        class="form-group">
        <label for="password">New password</label>
        <input
          v-validate="{ required: true, min: 8, regex: passRegex }"
          id="password"
          v-model="newPassword"
          class="form-control"
          autocomplete="off"
          type="password"
          name="password">
        <div class="help-block">
          {{ errors.first('password') }}
        </div>
      </div>
      <div
        :class="{'has-error': errors.first('password-confirm')}"
        class="form-group">
        <label for="confirmPass">Confirm new password</label>
        <input
          v-validate="'required|confirmed:password'"
          id="confirmPass"
          class="form-control"
          autocomplete="off"
          type="password"
          name="password-confirm">
        <div class="help-block">
          {{ errors.first('password-confirm') }}
        </div>
      </div>
      <div class="controls-section">
        <button
          type="submit"
          class="btn btn-success">Update</button>
      </div>
    </form>
  </div>
</template>
