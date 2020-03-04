import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './Signup.vue';
import { $newObj, AgencyPrimaryInfo,
  $anonymousUser, ModifiableAddress,
  IAgencyRegRequestAgencyInfo,
  EmployeePrimaryInfo,
  EmployeeContactInfo,
  RequestAgencyRegistrationResult,
  IAgencyRegRequestEmployeeInfo } from '@immosparrow/cockpit-api-v2';
import validation from './data/validation';
import * as auth from '../../store/modules/authStatesModule';
import store from '../../store';
@Component({
  mixins: [template],
})
export default class Signup extends Vue {

  agency: IAgencyRegRequestAgencyInfo = {
    primaryInfo: $newObj(AgencyPrimaryInfo),
    address: $newObj(ModifiableAddress),
  };

  employee: IAgencyRegRequestEmployeeInfo = {
    primaryInfo: $newObj(EmployeePrimaryInfo),
    contactInfo: $newObj(EmployeeContactInfo),
    address: $newObj(ModifiableAddress),
  };
  secretId: string = '';
  loading: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = 'AccessKey is invalid. Please try another one.';
  localize: any = window['Localize'];

  mounted() {
    this.$validator.dictionary.merge(validation);
  }
  created () {
    this.secretId = this.$route.query.accessKey.toString();
  }

  submit() {
    const self = this;
    this.$validator.validateAll().then((result) => {
      if (result) {
        this.loading = true;

        $anonymousUser.requestAgencyRegistration(
          this.secretId,
          this.employee.contactInfo.email,
          {
            agency: this.agency,
            employee: this.employee,
          },
        )
          .then((res) => {
            const result = res;
            setTimeout(() => {
              switch (result) {
                case RequestAgencyRegistrationResult.Success:
                  this.showSuccess = true;
                  break;
                case RequestAgencyRegistrationResult.InvalidAccessKey:
                  this.errorMessage = 'AccessKey is invalid. Please try another one.';
                  this.showError = true;
                  break;
                case RequestAgencyRegistrationResult.AccessKeyAlreadyUsed:
                  this.errorMessage = 'AccessKey is already used. Please try another one.';
                  this.showError = true;
                  break;
              }
              self.loading = false;
            },         1000);
          })
          .catch((err) => {
            if (err.status === 500) {
              this.errorMessage = 'Internal Server Error. Please try again later.';
            }
            this.showError = true;
          });
      }
    });
  }
}
