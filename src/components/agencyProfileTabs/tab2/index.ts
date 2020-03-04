import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../../base';

@Component({
  name: 'Tab2',
  mixins: [template],
})

export default class Tab2 extends Base {
  editDoc: boolean = false;
  documentTemplates: any = [
    { image: true, title: 'House presentation for brokers', docType: 'Powerpoint', templateType: 'AgencySlides', lastChange: '2 Feb 2020', valid: true },
    { image: false, title: 'Apartment showroom on 5 slides', docType: 'Powerpoint', templateType: 'FullSlides', lastChange: '12 Feb 2020', valid: false },
    { image: false, title: 'Agency presentation on 15 p', docType: 'Word', templateType: 'FullDocumentation', lastChange: '15 Feb 2020', valid: true },
    { image: true, title: 'Price prediction doc with 10 images', docType: 'Powerpoint', templateType: 'FullSlides', lastChange: '19 Feb 2020', valid: true },
  ];
  templateTabs: object = {
    marketradar: true,
    email: false,
  };
  show(tab: string) {
    for (const i in this.templateTabs) {
      if (i === tab) {
        this.templateTabs[i] = true;
      } else {
        this.templateTabs[i] = false;
      }
    }
  }
}
