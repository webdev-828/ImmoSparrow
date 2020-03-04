import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class PhoneMixin extends Vue {
  parsePhone(number?: string) {
    let newNumber = '';
    const defaultNumberReg = /^(\+41+[0-9]{9})$/;
    const withZeroNumberReg = /^(0041 [0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/;
    const formatedNumberReg = /^(\+41\s+\(0\)\s+[0-9]+[0-9]+\ [0-9]+[0-9]+[0-9]+\ [0-9]+[0-9]+\ [0-9]+[0-9])$/;
    switch (true) {
      case (defaultNumberReg.test(number)) : newNumber = `+41 (0) ${number.slice(3, 5)} ${number.slice(5, 8)} ${number.slice(8, 10)} ${number.slice(10, 12)}`;
        break;
      case (withZeroNumberReg.test(number)) : newNumber = `+41 (0) ${number.slice(5, 18)}`;
        break;
      case (formatedNumberReg.test(number)) : newNumber = number;
      default : newNumber = '';
    }
    return newNumber;
  }
}
