<template>
  <div
    v-if="loaded"
    id="gate">
    <template v-if="$route.name === 'Register' && !invitationMode">
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
                  <!-- Invitation -->
                  <h3 class="text-center margin-b-12">Invitation</h3>
                  <div
                    v-if="noInvitation"
                    class="form-group margin-b-12 text-center font-s13">
                    You need an invitation in order to register.<br>
                    <button
                      class="inline-button"
                      @click="goToPage('login')">
                      Proceed to login
                    </button>
                  </div>
                  <div
                    v-if="invitation.status === 4"
                    class="form-group margin-b-12 text-center font-s13">
                    You have already rejected this invitation.<br>
                    <button
                      class="inline-button"
                      @click="goToPage('login')">
                      Proceed to login
                    </button>
                  </div>
                  <div
                    v-if="invitation.status === 3"
                    class="form-group margin-b-12 text-center font-s13">
                    You have already accepted this invitation.<br>
                    <button
                      class="inline-button"
                      @click="goToPage('login')">
                      Proceed to login
                    </button>
                  </div>
                  <div
                    v-if="invitation.status === 5"
                    class="form-group margin-b-12 text-center font-s13">
                    This invitation has been canceled.<br>
                    <button
                      class="inline-button"
                      @click="goToPage('login')">
                      Proceed to login
                    </button>
                  </div>
                  <div v-if="invitation.status === 1">
                    <div v-if="step === 0">
                      <div
                        v-if="invitation.type !== 23"
                        class="form-group text-center font-s13">
                        You have recieved an {{ getInvType(invitation.type) }} invitation to
                        <var agencyName>{{ invitation.agencyName }}</var> agency from <var senderName>{{ invitation.request.senderName }}</var>
                      </div>
                      <div
                        v-else
                        class="form-group text-center font-s13">
                        You have recieved an invitation to register a new agency
                      </div>
                      <div class="form-group margin-b-12">
                        <button
                          :disabled="declining || accepting"
                          class="btn btn-sm btn-block btn-primary"
                          type="button"
                          @click="acceptInvitation()">
                          <i
                            v-if="accepting"
                            class="fa fa-circle-o-notch fa-spin"/> Accept
                        </button>
                      </div>
                      <div class="form-group margin-b-12">
                        <button
                          :disabled="declining || accepting"
                          class="btn btn-sm btn-block btn-default"
                          type="button"
                          @click="declineInvitation()">
                          <i
                            v-if="declining"
                            class="fa fa-circle-o-notch fa-spin"/> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- / Invitation -->
                </div>
                <version-footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="invitationMode"
      class="regErrMsg bg-primary text-white font-w600">
      Please login (with an existing account) or register to accept this invitation
    </div>
    <template v-if="loaded">
      <login
        v-show="invitationMode"
        :changeAllowTransition="changeAllowTransition"
        :invitationMode="invitationMode"
        :invitation="invitation"
        @register="register(...arguments)"
        @acceptInvitation="acceptInvitation()"/>
    </template>
  </div>
</template>
