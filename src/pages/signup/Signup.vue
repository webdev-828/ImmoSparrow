<template>
  <div v-bar>
    <div>
      <div
        class="container">
        <div
          class="row">
          <div
            class="col-lg-6 col-lg-offset-3 col-sm-8 col-sm-offset-2">
            <div
              v-if="!showSuccess && !showError"
              class="plate animated fadeIn margin-b-20">
              <div class="text-center">
                <img
                  src="../../../static/img/misc/immosparrow_little.png"
                  class="logo-img"
                  alt="ImmoSparrow"
                  title="ImmoSparrow" >
                <div class="brand-line">Full transparency for your properties</div>
              </div>
              <h3
                class="text-center margin-b-12">
                Sign up
              </h3>
              <form
                class=""
                @submit.prevent="submit">
                <p
                  class="title">
                  Company
                </p>
                <div class="row">
                  <div
                    :class="{'has-error': errors.first('company-name')}"
                    class="form-group margin-b-10 col-xs-12">
                    <label for="company-name">Company Name</label>
                    <input
                      v-validate="'required'"
                      id="company-name"
                      v-model="agency.primaryInfo.name"
                      class="form-control"
                      type="text"
                      name="company-name">
                    <div class="help-block">
                      {{ errors.first('company-name') }}
                    </div>
                  </div>
                </div>
                <!-- <div class="row">
                  <div
                    :class="{'has-error': errors.first('street')}"
                    class="form-group margin-b-10 col-xs-6">
                    <label for="street">Street</label>
                    <input
                      v-validate="'required'"
                      id="street"
                      v-model="agency.address.street"
                      class="form-control"
                      type="text"
                      name="street">
                    <div class="help-block">
                      {{ errors.first('street') }}
                    </div>
                  </div>
                  <div class="form-group margin-b-10 col-xs-6">
                    <label for="street-number">Street number</label>
                    <input
                      id="street-number"
                      v-model="agency.address.streetNumber"
                      class="form-control"
                      type="text"
                      name="street-number">
                  </div>
                </div>
                <div class="row">
                  <div
                    :class="{'has-error': errors.first('zip')}"
                    class="form-group margin-b-10 col-xs-6">
                    <label for="zip">ZIP</label>
                    <input
                      v-validate="'required'"
                      id="zip"
                      v-model="agency.address.zip"
                      class="form-control"
                      type="text"
                      name="zip">
                    <div class="help-block">
                      {{ errors.first('zip') }}
                    </div>
                  </div>
                  <div
                    :class="{'has-error': errors.first('city')}"
                    class="form-group margin-b-10 col-xs-6">
                    <label for="city">City</label>
                    <input
                      v-validate="'required'"
                      id="city"
                      v-model="agency.address.city"
                      class="form-control"
                      type="text"
                      name="city">
                    <div class="help-block">
                      {{ errors.first('city') }}
                    </div>
                  </div>
                </div> -->
                <p
                  class="title">
                  Employee
                </p>
                <div class="row">
                  <div
                    :class="{'has-error': errors.first('first-name')}"
                    class="form-group margin-b-10 col-xs-6">
                    <label for="first-name">First name</label>
                    <input
                      v-validate="'required'"
                      id="first-name"
                      v-model="employee.primaryInfo.firstName"
                      class="form-control"
                      type="text"
                      name="first-name">
                    <div class="help-block">
                      {{ errors.first('first-name') }}
                    </div>
                  </div>
                  <div
                    :class="{'has-error': errors.first('last-name')}"
                    class="form-group margin-b-10 col-xs-6">
                    <label for="last-name">Last name</label>
                    <input
                      v-validate="'required'"
                      id="last-name"
                      v-model="employee.primaryInfo.lastName"
                      class="form-control"
                      type="text"
                      name="last-name">
                    <div class="help-block">
                      {{ errors.first('last-name') }}
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div
                    :class="{'has-error': errors.first('email')}"
                    class="form-group margin-b-10 col-xs-12">
                    <label for="email">Email</label>
                    <input
                      v-validate="'required|email'"
                      id="email"
                      v-model="employee.contactInfo.email"
                      class="form-control"
                      type="text"
                      name="email">
                    <div class="help-block">
                      {{ errors.first('email') }}
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div
                    class="form-group margin-b-10 col-xs-12 margin-t-15">
                    <button
                      :disabled="loading"
                      type="submit"
                      class="btn btn-sm btn-block btn-primary">
                      <i
                        v-if="loading"
                        class="fa fa-circle-o-notch fa-spin"/>
                      <span>Sign up</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div
              v-if="showSuccess"
              class="plate animated fadeIn margin-b-20">
              <div class="text-center">
                <img
                  src="../../../static/img/misc/immosparrow_little.png"
                  class="logo-img"
                  alt="ImmoSparrow"
                  title="ImmoSparrow" >
                <div class="brand-line">Full transparency for your properties</div>
              </div>
              <div
                class="text-success text-center padding-t-10"
                style="font-size: 42px;">
                <i class="fa fa-check-circle"/>
              </div>
              <h3
                class="text-center margin-b-12">
                Sign Up Success
              </h3>
              <div class="form-group margin-b-12 text-center font-s13">
                Invite was sent to your email address. Please check your inbox.
              </div>
            </div>
            <div
              v-if="showError"
              class="plate animated fadeIn margin-b-20">
              <div class="text-center">
                <img
                  src="../../../static/img/misc/immosparrow_little.png"
                  class="logo-img"
                  alt="ImmoSparrow"
                  title="ImmoSparrow" >
                <div class="brand-line">Full transparency for your properties</div>
              </div>
              <div
                class="text-danger text-center padding-t-10"
                style="font-size: 42px;">
                <i class="fa fa-times-circle"/>
              </div>
              <h3
                class="text-center margin-b-12">
                Sign Up Failed
              </h3>
              <div class="form-group margin-b-12 text-center font-s13">
                {{ errorMessage }}<br>
                <!-- <button class="btn btn-link">
                  Try again
                </button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
