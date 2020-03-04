import Vue from 'vue';
import store from '../store';
import VTooltip from 'v-tooltip';
import * as globalStates from '../store/modules/globalStatesModule';
import { VNode, VNodeDirective } from 'vue/types/vnode';

Vue.directive('close-rightSidebar', {
  inserted(el) {
    el.addEventListener('click', (event) => {
      globalStates.commitShowRightSidebar(store, false);
      globalStates.commitProfileRightSidebar(store, false);
    });
  },
});

Vue.directive('close-pipeItem', {
  inserted(el) {
    el.addEventListener('click', (event) => {
      globalStates.commitShowPipeDetails(store, false);
    });
  },
});

Vue.directive('move', {
  inserted: (el) => {
    try {
      const searchSidebar = document.querySelector('#sidebar-fixed');
      const searchSidebarObject = document.querySelector('#sidebar-object-fixed');
      const sidebar = searchSidebar ? searchSidebar : searchSidebarObject;
      const style = window.getComputedStyle(<any>sidebar.parentNode.parentNode);

      if (sidebar.classList.contains('active') && style.display !== 'none') {
        if (document.getElementsByClassName('switch_style')[0] !== undefined) {
          document.getElementsByClassName('switch_style')[0].className = 'switch_style mapboxgl-ctrl-group mapboxgl-ctrl on_left second';
        }
      }
    } catch { }
  },
});

Vue.directive('close-popover', VTooltip.VClosePopover);

Vue.directive('show-multi-tag-holder', {
  inserted(el: HTMLElement) {
    el.addEventListener('click', (event) => {
      const parent = el.parentElement.getElementsByClassName('multiselect__tag').item(0).parentElement;
      parent.classList.add('tags_holder');
      const multiselectTags = parent.getElementsByClassName('multiselect__tag');
      const parentPos = parent.getBoundingClientRect();

      for (let i = 0, l = multiselectTags.length; i < l; i += 1) {
        const childrenPos = multiselectTags.item(i).getBoundingClientRect();
        if ((childrenPos.top - parentPos.top) === 87) {
          multiselectTags.item(i).classList.add('hidden');
        }
      }

      el.parentElement.getElementsByClassName('tags_holder_helper').item(0).classList.add('show');
      el.classList.remove('show');
      el.setAttribute('dont_group_multitag', '0');
      el.parentElement.getElementsByClassName('tags_holder_helper_less').item(0).classList.remove('show');
    });
  },
});

Vue.directive('remove-multi-tag-holder', {
  inserted(el: HTMLElement) {
    el.addEventListener('click', (event) => {
      if (el.parentElement.getElementsByClassName('tags_holder').length) {
        const tagsHolder = el.parentElement.getElementsByClassName('tags_holder').item(0);
        for (let i = 0, l = tagsHolder.getElementsByClassName('multiselect__tag').length; i < l; i += 1) {
          tagsHolder.getElementsByClassName('multiselect__tag').item(i).classList.remove('hidden');
        }

        tagsHolder.classList.remove('tags_holder');
        el.classList.remove('show');
        el.setAttribute('dont_group_multitag', '1');
        el.parentElement.getElementsByClassName('tags_holder_helper_less').item(0).classList.add('show');
        el.parentElement.getElementsByClassName('tags_holder_helper').item(0).classList.remove('show');
      }
    });
  },
});

Vue.directive('update-vtags', {
  inserted(el: HTMLElement) {
    el.onclick = () => {
      const parent = el.parentElement.parentElement;
      if (parent) {
        const hidden = parent.getElementsByClassName('multiselect__tag hidden').length;
        const hiddenElements = parent.getElementsByClassName('multiselect__tag hidden');
        if (hidden) {
          hiddenElements.item(0).classList.remove('hidden');
        } else {
          parent.classList.remove('tags_holder');
        }
      }
    };
  },
});

Vue.directive('hide-multiselect-elements', {
  inserted(el: HTMLElement) {
    el.setAttribute('dont_group_multitag', '0');
  },
  update(el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode) {
    const clhight = el.clientHeight;
    if (clhight !== parseInt(el.getAttribute('height'))) {
      const parent = el.parentElement;
      if (el.getAttribute('dont_group_multitag') === '0') {
        const tagsLen = el.getElementsByClassName('multiselect__tag').length;
        el.setAttribute('hide_from_index', (tagsLen).toString());
        if (el.clientHeight >= 87) {
          if (!el.classList.contains('tags_holder')) {
            el.classList.add('tags_holder');
          }

          if (el.getAttribute('hide_from_index')) {
            const multiselectTags = el.getElementsByClassName('multiselect__tag');
            const parentPos = el.getBoundingClientRect();
            for (let i = 0, l = multiselectTags.length; i < l; i += 1) {
              const childrenPos = multiselectTags.item(i).getBoundingClientRect();
              if ((childrenPos.top - parentPos.top) === 87) {
                if (!multiselectTags.item(i).classList.contains('hidden')) {
                  multiselectTags.item(i).classList.add('hidden');
                }
              }
            }

            const hidden = el.getElementsByClassName('multiselect__tag hidden').length;
            if (hidden) {
              if (!parent.getElementsByClassName('tags_holder_helper').item(0).classList.contains('show')) {
                parent.getElementsByClassName('tags_holder_helper').item(0).classList.add('show');
              }
              parent.getElementsByClassName('tags_holder_helper').item(0)
                .getElementsByTagName('span').item(0).innerHTML = hidden.toString();
            } else {
              el.parentElement.getElementsByClassName('tags_holder_helper_less').item(0).classList.remove('show');
              el.parentElement.getElementsByClassName('tags_holder_helper').item(0).classList.remove('show');
            }
          }
        }
      }
    }
  },
});

Vue.directive('show-submenu', {
  inserted(el) {
    el.addEventListener('click', (event) => {
      el.classList.add('open');
      el.classList.remove('open_with_delay');
    });
    el.addEventListener('mouseleave', (event) => {
      el.classList.remove('open_with_delay');
      el.classList.remove('open');
    });
    el.addEventListener('mouseenter', (event) => {
      if (!globalStates.getSearchSideBar(store)) {
        el.classList.remove('open');
        el.classList.add('open_with_delay');
      } else {
        el.classList.add('open');
      }
    });
  },
});

Vue.directive('focus', {
  inserted(el) {
    el.focus();
  },
});

Vue.directive('number-input', {
  inserted(el: HTMLInputElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode) {
    let currentValidValue: string = '';
    el.oninput = (evt: any) => {
      let regex = /^([1-9]\d*|0)$/g;
      let elementValue = el.value;
      if (elementValue === '') {
        currentValidValue = null;
        return;
      }
      if (el.getAttribute('withStep5')) {
        regex = /^([1-9]\d*|0)$|^(\d*[.,]5)$|^([0-9]\d*[.,])$/g;
        if (elementValue.indexOf(',') > -1) {
          if (!elementValue.endsWith(',')) {
            elementValue = elementValue.replace(/,/g, '.');
          }
        }
      }
      const test = regex.test(elementValue);
      if (currentValidValue !== elementValue) {
        if (test) {
          currentValidValue = elementValue;
          el.value = currentValidValue;
          const event = new Event('input', { bubbles: true });
          el.dispatchEvent(event);
          return;
        }
        el.value = currentValidValue;
        if (currentValidValue) {
          const event = new Event('input', { bubbles: true });
          el.dispatchEvent(event);
        } else {
          try {
            el.value = '';
            const event = new Event('input', { bubbles: true });
            el.dispatchEvent(event);
          } catch { }
        }
      }
    };
  },
});

Vue.directive('search-elements', {
  componentUpdated(el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode) {
    const children = el.getElementsByClassName('multiselect__tag');
    let childrenHidden = el.getElementsByClassName('multiselect__tag hidden').length;
    const tagsHolderMore = (el.parentElement.getElementsByClassName('tags_holder_helper')[0] as HTMLElement);
    const tagsHolderLess = (el.parentElement.getElementsByClassName('tags_holder_helper_less')[0] as HTMLElement);
    if (tagsHolderLess.classList.contains('show')) {
      if (el.offsetHeight <= 87) {
        tagsHolderLess.classList.remove('show');
      }
      return;
    }
    if (el.offsetHeight >= 80) {
      if (!el.classList.contains('hideFrom80')) {
        el.classList.add('hideFrom80');
      }
      for (const i in (<unknown>children as HTMLElement)) {
        if (el.children[i].offsetTop > 80) {
          if (!tagsHolderLess.classList.contains('show')) {
            children[i].classList.add('hidden');
          }
        }
      }
      childrenHidden = el.getElementsByClassName('multiselect__tag hidden').length;
      if (childrenHidden > 0) {
        (tagsHolderMore.getElementsByClassName('numberOfHiddenElements')[0] as HTMLElement).innerText = (<unknown>childrenHidden as string);
        tagsHolderMore.classList.add('show');
      } else {
        tagsHolderMore.classList.remove('show');
        tagsHolderLess.classList.remove('show');
        el.classList.remove('hideFrom80');
      }

      tagsHolderMore.onclick = () => {
        for (let i = 0, l = children.length; i < l; i += 1) {
          if (children[i].classList.contains('hidden')) {
            children[i].classList.remove('hidden');
          }
        }
        tagsHolderMore.classList.remove('show');
        el.classList.remove('hideFrom80');
        tagsHolderLess.classList.add('show');
      };

      tagsHolderLess.onclick = () => {
        el.classList.add('hideFrom80');
        tagsHolderMore.classList.add('show');
        tagsHolderLess.classList.remove('show');
      };
    }
  },
});

Vue.directive('time24-match', {
  inserted(el: HTMLInputElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode) {
    let curValue = '';
    el.oninput = (evt: any) => {
      const regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$|^([0-9]|0[0-9]|1[0-9]|2[0-3]):$|^([0-9]|0[0-9]|1[0-9]|2[0-3])(?:)$/g;
      const text = el.value;

      if (el.value === '') {
        curValue = el.value;
        return;
      }
      if (!regex.test(text)) {
        evt.returnValue = false;
        el.value = curValue;
        evt.preventDefault();
        evt.stopImmediatePropagation();
        try {
          vnode.elm.dispatchEvent(new CustomEvent('input'));
        } catch { }
        return;
      }
      curValue = el.value;
    };
  },
});

Vue.directive('click-outside', {
  bind(el: any, binding: VNodeDirective, vnode: VNode) {
    el.clickOutsideEvent = function (event: any) {
      if (!(el === event.target || el.contains(event.target))) {
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unbind(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
});
