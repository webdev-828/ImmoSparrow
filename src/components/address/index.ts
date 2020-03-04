import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import template from './index.template.vue';
import Base from '../base';
import { $geo, GeoSuggestion, IModifiableAddress } from '@immosparrow/cockpit-api-v2';
import Debounce from 'debounce-decorator';
import { SingleCall } from '../call';
import { OptionModel } from '../../models';

@Component({
  name: 'Address',
  mixins: [template],
})

export default class Address extends Base {

  @Prop()
  address: IModifiableAddress;

  @Prop()
  formScope: String;

  @Prop({ default: false })
  fullScreen: boolean;

  street: GeoSuggestion = new GeoSuggestion();
  countries: OptionModel[] = [
    { value: 1, text: 'CH' },
  ];

  setStreet(data: GeoSuggestion) {
    this.street = data;

    this.$refs.autocomplete_profile.model = data.name;
    this.$refs.autocomplete_profile.options = [];

    if (this.street.uniqueIdentifier !== '') {
      $geo.getAddress(this.street.uniqueIdentifier)
        .then((res) => {
          this.address.street = res.street;
          this.address.locality = res.locality;
          this.address.zip = res.zip;
          this.address.streetNumber = res.streetNumber;
          this.address.countryCode = res.countryCode;
          this.$forceUpdate();
        }).catch((e) => {
        });
    }
  }

  @Debounce(250)
  async getSearchSuggestions () {
    const singleCall = new SingleCall<GeoSuggestion[]>($geo.findSuggestions);
    const text =  this.$parent.$refs['autocomplete_profile']['model'];
    if (text.length) {
      const results = await singleCall.invoke({
        text,
        includeGeom: true,
        suggestionTypes: [70],
        maxItemCount: 6,
      });
      this.autocompleteOptions = results;
      this.$parent.$refs['autocomplete_profile']['options'] = results;
    }
    this.$parent.$refs['autocomplete_profile']['loadingData'] = false;
  }
}
