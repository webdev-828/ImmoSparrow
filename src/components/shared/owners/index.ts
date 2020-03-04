import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import {
    $building, PropertyOwnersInfoServiceStatus, IPropertyOwnerModel,
    $pubs, GetOwnersResultCode, PubModel, $publication,
} from '@immosparrow/cockpit-api-v2';
import { safeVal } from '@immosparrow/cockpit-lib-core';
import OwnerDetails from './ownerDetails';
import ProgressBar from 'vue-simple-progress';
import { mixins } from 'vue-class-component';
import BundleChecks from '@/mixins/bundleChecks';
@Component({
  name: 'Owners',
  mixins: [template],
  components: {
    OwnerDetails,
    ProgressBar,
  },
})

export default class Owners extends mixins(BundleChecks) {

  @Prop({ default: {} })
    item: any;

  @Prop({ default: '' })
    entrenceId: string;

  ownerSection: boolean = false;
  ownerInterval: any = false;
  ownerStatesInfo: any = {
    supported: [],
    notSupported: [],
    planned: [],
  };
  ownerInfoLoaded: boolean = false;
  showSupportedOwners: boolean = false;
  owners: IPropertyOwnerModel[] = [];
  ownerFlag: number = 0;
  gettingOwner: number = 0;

  val: Function = safeVal;

  @Watch('item', { immediate: true })
    searchOwners () {
    if (this.item) {
      this.checkOwners();
    }
  }

  get ownerStatus () {
    const status = this.val(this.item, (item: PubModel) => item.runtimeServices.propertyOwnersInfoService.serviceStatus, undefined);
    if (status !== undefined) {
      return PropertyOwnersInfoServiceStatus[status];
    }
    return undefined;
  }

  checkOwners () {
    this.owners = [];
    this.ownerFlag = 0;
    this.gettingOwner = 0;

    this.ownerSection = false;

    clearInterval(this.ownerFlag);
    if (this.searchOwnerInfo) {
      if (this.ownerStatus === 'Supported') {
        this.ownerSection = true;
      }
    }
    this.loadOwnerServiceInfo();
  }

  loadOwnerServiceInfo () {
    this.ownerStatesInfo.notSupported = [];
    this.ownerStatesInfo.supported = [];
    this.ownerStatesInfo.planned = [];
    this.ownerInfoLoaded = false;
    $pubs.getOwnersServiceInfo()
        .then((res) => {
          res.items.forEach((item) => {
            if (PropertyOwnersInfoServiceStatus[item.serviceStatus] === 'NotSupported') {
              this.ownerStatesInfo.notSupported.push(item.stateShort);
            }
            if (PropertyOwnersInfoServiceStatus[item.serviceStatus] === 'Supported') {
              this.ownerStatesInfo.supported.push(item.stateShort);
            }
            if (PropertyOwnersInfoServiceStatus[item.serviceStatus] === 'Planned') {
              this.ownerStatesInfo.planned.push(item.stateShort);
            }
          });
          this.ownerInfoLoaded = true;
        });
  }

  getOwnerInfo () {
    this.ownerFlag = 1;
    this.gettingOwner = 0;
    const self = this;
    let inc = 3;

    if (this.item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds) {
      inc = Math.round(100 / this.item.runtimeServices.propertyOwnersInfoService.averageExecutionTimeSeconds);
    }
    this.ownerInterval = setInterval(() => {
      self.gettingOwner = Math.min(self.gettingOwner + inc, 98);
    },                               1000);

    const request = this.entrenceId ? $building(this.item.id) : $publication(this.item.id);
    request.getOwners()
      .then((res) => {
        self.gettingOwner = 100;
        clearInterval(this.ownerInterval);
        setTimeout(() => {
          if (res.code === GetOwnersResultCode.Success) {
            this.owners = res.result;
            if (this.owners && this.owners.length) {
              this.ownerFlag = 2;
            } else {
              this.ownerFlag = 4;
            }
          } else {
            this.ownerFlag = 5;
          }
        },         500);
      })
      .catch((err) => {
        clearInterval(this.ownerInterval);
        this.ownerFlag = 3;
      });
  }

  @Watch('gettingOwner')
    wo () {
    if (this.gettingOwner > 90 && this.ownerFlag === 1) {
      clearInterval(this.ownerFlag);
    }
  }
  formatStates (states: string[]) {
    let formatted: string = '';
    states.forEach((s) => {
      if ((states.indexOf(s) === states.length - 1)) {
        formatted += s;
      } else {
        formatted += `${s}, `;
      }
    });
    return formatted;
  }
}
