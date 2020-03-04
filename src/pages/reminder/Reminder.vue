<template>
  <div id="gate">
    <main id="main-container">
      <div v-bar>
        <div>
          <div class="container">
            <div
              class="row"
              style="margin-top: 60px;">
              <div class="col-lg-4 col-lg-offset-4 col-sm-6 col-sm-offset-3">
                <div class="plate animated fadeIn margin-b-20">
                  <div class="text-center">
                    <img
                      src="../../../static/img/misc/immosparrow_little.png"
                      class="logo-img"
                      alt="ImmoSparrow"
                      title="ImmoSparrow" >
                    <div class="brand-line">Full transparency for your properties</div>
                  </div>
                  <form
                    class="animated fadeIn"
                    data-vv-scope="forgotPasswordForm"
                    @submit.stop.prevent="validateAndSubmit"
                    @keydown.enter.prevent="">
                    <h3 class="text-center margin-b-12">Password Reset</h3>
                    <!-- Email -->
                    <div
                      :class="{'has-error': errors.has('forgotPasswordForm.email') }"
                      class="form-group margin-b-12">
                      <label for="email">Email</label>
                      <input
                        v-validate="'required|email'"
                        id="email"
                        v-model="currentEmail"
                        class="form-control"
                        data-vv-scope="forgotPasswordForm"
                        type="text"
                        name="email">
                      <span
                        v-show="errors.has('forgotPasswordForm.email')"
                        class="help-block">
                        {{ errors.first('forgotPasswordForm.email') }}
                      </span>
                    </div>
                    <div
                      :class="{'has-error': errors.first('forgotPasswordForm.password')}"
                      class="form-group">
                      <label for="password">New password</label>
                      <input
                        v-validate="{ required: true, min: 8, max: 50, regex: passRegex }"
                        id="password"
                        v-model="newPassword"
                        class="form-control"
                        autocomplete="off"
                        data-vv-scope="forgotPasswordForm"
                        type="password"
                        name="password">
                      <span
                        v-show="errors.has('forgotPasswordForm.password')"
                        class="help-block">
                        {{ errors.first('forgotPasswordForm.password') }}
                      </span>
                    </div>
                    <div
                      :class="{'has-error': errors.first('forgotPasswordForm.password-confirm')}"
                      class="form-group">
                      <label for="confirmPass">Confirm new password</label>
                      <input
                        v-validate="'required|confirmed:password'"
                        id="confirmPass"
                        class="form-control"
                        autocomplete="off"
                        data-vv-scope="forgotPasswordForm"
                        type="password"
                        name="password-confirm">
                      <span
                        v-show="errors.has('forgotPasswordForm.password-confirm')"
                        class="help-block">
                        {{ errors.first('forgotPasswordForm.password-confirm') }}
                      </span>
                    </div>
                    <div class="form-group margin-b-12">
                      <button
                        :disabled="sending"
                        class="btn btn-sm btn-block btn-primary"
                        type="submit">
                        <span>
                          <i
                            v-if="sending"
                            class="fa fa-circle-o-notch fa-spin"/> Send</span>
                      </button>
                    </div>
                  </form>
                  <div class="font-s13 text-center font-s13">
                    Already have an account?<br>
                    <a
                      type="button"
                      class="mouse-pointer"
                      @click="$router.push({ name: 'Login' })">
                      Log In
                    </a>
                  </div>
                </div>
                <version-footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
