import { Component } from 'vue-property-decorator';
import template from './template.vue';
import BaseComponent from '../../base';
import { EmployeeRole } from '@immosparrow/cockpit-api-v2';
@Component({
  mixins: [template],
})
export default class Navigation extends BaseComponent {
  menucollapsed: boolean = true;
  notificationIn: boolean = false;
  incomingNotification() {
    this.notificationIn = true;
    setTimeout(this.bellRing, 1000);
  }
  bellRing() {
    this.notificationIn = false;
  }

  get isAdmin () {
    return this.empCtx && this.empCtx.employee.role === EmployeeRole.Admin;
  }
}
