<template>
  <div id="gate">
    <div v-bar>
      <div>
        <div class="container">
          <div
            class="row"
            style="margin-top: 60px;">
            <div class="col-lg-4 col-lg-offset-4 col-sm-6 col-sm-offset-3">
              <div
                :class="{ 'has-error' : loginError }"
                class="plate animated fadeIn margin-b-20">
                <div class="text-center">
                  <img
                    src="../../../static/img/misc/immosparrow_little.png"
                    class="logo-img"
                    alt="ImmoSparrow"
                    title="ImmoSparrow" >
                  <div class="brand-line">Full transparency for your properties</div>
                </div>
                <!-- Log In -->
                <form
                  v-show="!register"
                  class="animated fadeIn"
                  data-vv-scope="loginForm"
                  @submit.prevent="login">
                  <h3 class="text-center margin-b-12">Log In</h3>
                  <!-- Email -->
                  <div
                    :class="{ 'has-error' : errors.has('loginForm.login-username') }"
                    class="form-group margin-b-12">
                    <label for="login-username">Email</label>
                    <input
                      v-validate="'required|email'"
                      id="login-username"
                      v-model="loginInfo.email"
                      class="form-control"
                      data-vv-scope="loginForm"
                      type="text"
                      name="login-username">
                    <span
                      v-show="errors.has('loginForm.login-username')"
                      class="help-block">{{ errors.first('loginForm.login-username') }}</span>
                  </div>
                  <!-- / Email -->
                  <!-- Password -->
                  <div
                    :class="{ 'has-error' : errors.has('loginForm.login-password') }"
                    class="form-group margin-b-12">
                    <label for="login-password">Password</label>
                    <input
                      v-validate="'required'"
                      id="login-password"
                      v-model="loginInfo.password"
                      class="form-control"
                      data-vv-scope="loginForm"
                      autocomplete="login-password"
                      type="password"
                      name="login-password">
                    <span
                      v-show="errors.has('loginForm.login-password')"
                      class="help-block">{{ errors.first('loginForm.login-password') }}</span>
                    <span
                      v-if="loginError && !errors.has('loginForm.login-password') && !errors.has('loginForm.login-username')"
                      class="help-block">Username and/or Password not valid.</span>
                  </div>
                  <!-- / Password -->
                  <div class="form-group row font-s13 margin-b-20">
                    <div class="col-xs-6">
                      <label class="css-input switch switch-sm switch-primary">
                        <input
                          id="login-remember-me"
                          v-model="loginInfo.persistent"
                          type="checkbox"
                          data-vv-scope="loginForm"
                          name="login-remember-me"><span/> Remember Me
                      </label>
                    </div>
                    <div class="col-xs-6">
                      <div class="text-right push-5-t">
                        <router-link to="/reminder">
                          Forgot Password?
                        </router-link>
                      </div>
                    </div>
                  </div>
                  <div class="plate-cap">
                    <div class="cap-message">
                      Optimized for <i class="fa fa-chrome"/> Google Chrome only
                    </div>
                  </div>
                  <div class="form-group margin-b-12">
                    <button
                      :disabled="loading"
                      class="btn btn-sm btn-block btn-primary"
                      type="submit">
                      <i
                        v-if="loading"
                        class="fa fa-circle-o-notch fa-spin"/>
                      <span> Log In</span>
                    </button>
                  </div>
                  <div class="font-s13 text-center font-s13">
                    Don't have an account?<br>
                    <a
                      v-if="$route.name === 'Register'"
                      type="button"
                      class="mouse-pointer"
                      @click="register = true">
                      Register now
                    </a>
                    <a
                      v-else
                      type="button"
                      class="mouse-pointer"
                      @click="$router.push({ name: 'Register' })">
                      Register now
                    </a>
                  </div>
                </form>
                <!-- / Log In -->
                <!-- Registration -->
                <form
                  v-show="register"
                  class="animated fadeIn"
                  data-vv-scope="registerForm"
                  @submit.prevent="registerUser">
                  <h3 class="text-center margin-b-12">Registration</h3>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.register-username') }"
                    class="form-group margin-b-12">
                    <label for="register-username">Email</label>
                    <input
                      v-validate="'required|email'"
                      id="register-username"
                      v-model="registerInfo.email"
                      class="form-control"
                      data-vv-scope="registerForm"
                      type="text"
                      name="register-username">
                    <span
                      v-show="errors.has('registerForm.register-username')"
                      class="help-block">{{ errors.first('registerForm.register-username') }}</span>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.register-firstName') }"
                    class="form-group margin-b-12">
                    <label for="register-firstName">First name</label>
                    <input
                      v-validate="'required'"
                      id="register-firstName"
                      v-model="registerInfo.firstName"
                      class="form-control"
                      data-vv-scope="registerForm"
                      type="text"
                      name="register-firstName">
                    <span
                      v-show="errors.has('registerForm.register-firstName')"
                      class="help-block">{{ errors.first('registerForm.register-firstName') }}</span>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.register-lastName') }"
                    class="form-group margin-b-12">
                    <label for="register-lastName">Last name</label>
                    <input
                      v-validate="'required'"
                      id="register-lastName"
                      v-model="registerInfo.lastName"
                      class="form-control"
                      data-vv-scope="registerForm"
                      type="text"
                      name="register-lastName">
                    <span
                      v-show="errors.has('registerForm.register-lastName')"
                      class="help-block">{{ errors.first('registerForm.register-lastName') }}</span>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.password') }"
                    class="form-group margin-b-12">
                    <label for="password">Password</label>
                    <input
                      v-validate="{ required: true, min: 8, regex: passRegex }"
                      id="password"
                      ref="register-password"
                      v-model="registerInfo.password"
                      class="form-control"
                      data-vv-scope="registerForm"
                      autocomplete="password"
                      type="password"
                      name="password">
                    <span
                      v-show="errors.has('registerForm.password')"
                      class="help-block">{{ errors.first('registerForm.password') }}</span>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.confirm-password') }"
                    class="form-group margin-b-12">
                    <label for="confirm-password">Confirm password</label>
                    <input
                      v-validate="'required|confirmed:password'"
                      id="confirm-password"
                      v-model="registerInfo.confirmPassword"
                      class="form-control"
                      data-vv-scope="registerForm"
                      autocomplete="confirm-password"
                      type="password"
                      name="confirm-password">
                    <span
                      v-show="errors.has('registerForm.confirm-password')"
                      class="help-block">{{ errors.first('registerForm.confirm-password') }}</span>
                  </div>
                  <div
                    :class="{ 'has-error' : errors.has('registerForm.Terms & Conditions') }"
                    class="form-group font-s13 margin-b-20">
                    <label class="css-input switch switch-sm switch-primary">
                      <input
                        v-validate="'required:true'"
                        id="login-remember-me"
                        v-model="acceptTerms"
                        type="checkbox"
                        data-vv-scope="registerForm"
                        name="Terms & Conditions"><span/> I accept the <a
                          href="../../../static/img/agb.pdf"
                          target="_blank">Terms & Conditions</a>
                      <span
                        v-show="errors.has('registerForm.Terms & Conditions')"
                        class="help-block">{{ errors.first('registerForm.Terms & Conditions') }}</span>
                    </label>
                  </div>
                  <div class="form-group margin-b-12">
                    <button
                      :disabled="loading"
                      class="btn btn-sm btn-block btn-primary"
                      type="submit">
                      <i
                        v-if="loading"
                        class="fa fa-circle-o-notch fa-spin"/>
                      <span> Register</span>
                    </button>
                  </div>
                  <div class="font-s13 text-center font-s13">
                    Already have an account?<br>
                    <a
                      type="button"
                      class="mouse-pointer"
                      @click="register = false">
                      Login now
                    </a>
                  </div>
                </form>
                <!-- / Registration -->
              </div>
              <version-footer />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showDuplicateEmail && register"
      class="duplicateMail bg-danger text-white font-w600">
      Another user with the same email exists.
      <a
        type="button"
        class="mouse-pointer"
        @click="register = false; showDuplicateEmail = false;">
        Proceed to login
      </a> instead?
    </div>
  </div>
</template>
