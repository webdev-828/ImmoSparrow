<template>
  <div>
    <div id="portfolio">
      <main
        id="main-container"
        :class="{'with-second-sidebar': leftSidebar}"
        class="no-head-state no-head-vb">
        <div
          v-bar
          v-if="categories['list']"
          style="position: absolute; z-index: 1">
          <div
            class="leads-container">
            <div
              class="objects-list content">
              <!-- Page Header -->
              <div class="page-hdr fancy-shadow">
                <div class="header-container">
                  <div class="titles with-control-block">
                    <div
                      class="subscription-name">
                      <span>List 1</span>
                      <div class="description font-s12">3 objects</div>
                    </div>
                    <div class="control-group">
                      <div class="btn-toolbar">
                        <div class="btn-group">
                          <button
                            v-tooltip.bottom="{ content: 'Download', delay: { show: 700, hide: 100 }}"
                            type="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                            class="btn btn-sm btn-default dropdown-toggle">
                            <i class="fa fa-download"/> <span class="caret"/>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right">
                            <li class="dropdown-header">Download as Excel File</li>
                            <li><a tabindex="-1">All Entries</a></li>
                            <li><a tabindex="-2">Since last download</a></li>
                          </ul>
                        </div>
                        <div class="btn-group">
                          <button
                            v-tooltip.bottom="{ content: 'Import', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default"><i class="fa fa-upload"/> Import</button>
                        </div>
                        <div class="btn-group">
                          <button
                            v-tooltip.bottom="{ content: 'Add Item', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-success"
                            @click="sidebarDeployed=!sidebarDeployed"><i class="fa fa-plus"/> Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="filters-container">
                  <div class="control-part">
                    <div class="input-group">
                      <input
                        placeholder="Search by (name, ZIP, etc. )"
                        type="text"
                        class="form-control input-sm search-header-input">
                      <span
                        class="input-group-addon">
                        <i class="fa fa-search"/>
                      </span>
                    </div>
                  </div>
                  <div class="control-part cursor-show">
                    <multiselect
                      id="sortBy"
                      :options="selectDemo"
                      :show-labels="false"
                      :close-on-select="true"
                      :allow-empty="false"
                      label="text"
                      track-by="value"
                      class="in-param-block"
                      openDirection="bottom"/>
                  </div>
                  <div class="control-part cursor-show">
                    <multiselect
                      id="filterBy"
                      :options="selectDemo"
                      :group-select="true"
                      :multiple="true"
                      :taggable="true"
                      :show-labels="false"
                      :clear-on-select="true"
                      :allow-empty="false"
                      group-values="options"
                      group-label="headers"
                      class="in-param-block"
                      track-by="value"
                      label="text"
                      openDirection="bottom"
                      placeholder="Select Filter"/>
                  </div>
                  <div class="tags-part">
                    <span
                      v-for="(i, index) in selectDemo"
                      :key="index"
                      class="multiselect__tag"><span>{{ i }}</span>
                    <i class="multiselect__tag-icon"/></span>
                  </div>
                </div>
                <div
                  v-if="selectState"
                  class="filters-container">
                  <div class="control-part">
                    <button
                      v-tooltip.top="{ content: 'Deselect Items', delay: { show: 700, hide: 100 }}"
                      type="button"
                      class="btn btn-xs btn-default bg-white"
                      @click="deselectItems()"><i class="fa fa-ban"/> Deselect</button>
                    <div class="btn-group">
                      <button
                        v-tooltip.top="{ content: 'Move Selected Items', delay: { show: 700, hide: 100 }}"
                        type="button"
                        data-toggle="dropdown"
                        aria-expanded="false"
                        class="btn btn-xs btn-default dropdown-toggle bg-white">
                        <i class="fa fa-download"/> Move <span class="caret"/>
                      </button>
                      <ul class="dropdown-menu">
                        <li class="dropdown-header">Select List</li>
                        <li class="active"><a href="#">All Items</a></li>
                        <li><a href="#">List 1</a></li>
                        <li><a href="#">List 2</a></li>
                        <li><a href="#">List 3</a></li>
                      </ul>
                    </div>
                    <button
                      v-tooltip.top="{ content: 'Delete Selected Items', delay: { show: 700, hide: 100 }}"
                      type="button"
                      class="btn btn-xs btn-default"
                      @click.stop><i class="fa fa-trash"/></button>
                    <span class="margin-l-5 font-s13 font-w600">{{ selectedObjects }} selected <span v-if="selectedObjects>1">items</span><span v-else>item</span></span>
                  </div>
                </div>
              </div>
              <!-- / Page Header -->
              <div
                v-if="!addList">
                <div
                  v-for="(i, index) in objects"
                  :key="index"
                  :class="{'selected': i.selected}"
                  class="block fancy-shadow with-image can-be-selected mouse-pointer"
                  @click="sidebarDeployed=!sidebarDeployed">
                  <div class="block-image">
                    <div
                      class="placeholder"
                      style="background-image: url(&quot;static/img/house-placeholder.png&quot;);"/>
                    <div
                      v-if="index == 0"
                      class="object-image"
                      style="background-image: url(&quot;https://axresources.azurewebsites.net/image/get/c3df5d72-1641-a9e2-d6f0-6251191e48aa/?mw=500&mh=500&q=90&amp;q=90}&quot;);"/>
                    <div
                      v-if="index == 1"
                      class="object-image"
                      style="background-image: url(&quot;https://axresources.azurewebsites.net/image/get/53f0c4b5-9516-380c-2e63-e1b01864f7fe/?mw=500&mh=500&q=90}&quot;);"/>
                    <div
                      v-if="index == 2"
                      class="object-image"
                      style="background-image: url(&quot;https://axresources.azurewebsites.net/image/get/2225fb70-8803-db00-bc36-28d78c061882/?mw=500&mh=500&q=90}&quot;);"/>
                  </div>
                  <div
                    class="block-not-image">
                    <div
                      class="block-header padding-b-0">
                      <div
                        class="header-data">
                        <h5>
                          <span
                            notranslate=""
                            title=""
                            class="font-s18 font-w600"
                            style="vertical-align: middle;">
                            {{ i.name }}
                          </span>
                        </h5>
                        <div
                          notranslate=""
                          subname=""
                          class="font-s13">
                          Oberwachtstrasse 6
                        </div>
                      </div>
                      <div class="select-option">
                        <button
                          type="button"
                          class="btn btn-sm btn-default"
                          @click.stop>
                          <img
                            width="14"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzE3NjI4N0QxRkVDMTFFOTk1RkFDRTdGQjE1MzEwNUEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzE3NjI4N0UxRkVDMTFFOTk1RkFDRTdGQjE1MzEwNUEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMTc2Mjg3QjFGRUMxMUU5OTVGQUNFN0ZCMTUzMTA1QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMTc2Mjg3QzFGRUMxMUU5OTVGQUNFN0ZCMTUzMTA1QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PinN/sIAAAUESURBVHjazFpbSFZBENYUQRKEn0QQumAZJohBRBCCICaEUD1IEoVJ+FIPUVREPlhIIAX1EPWqBQVl9GAP0YWiC0olRGUWllpSWWaamffL/zdTc2AY95x/z2X/3wPDnjO7Ozvf7uzu7OxJjEQiCfF8EhMTuyBZCYSKhIGGgJqAjoBuE67lLQBAvZAss8luAyoGHUd15S1KiPMDyi6HZA3QXqCLQP00WvisBxoB0MfcCFxwBE8S0G0ywQhRs07duJtcFHPMgKQHKI1YCGpb4CMEzwoUDtQB1A50ASjLo6waoD6gN0D1ODqKMr1spA45yvOgwEkmXNIkUKNKKQd540IGmtl9RblRlp8aCCB4ykTDP4B+Ac0JpfC7UVNmOVAn0LCQgQAyWLlMNqdafANC4UxxFJwu8kuBPgqlpoC2uGgjTcgYFfn3WF6KX0Df7BpSzK8uAeypS0s4zereF6ufxT/tGRA8hULBCY06W2hOWXXGgHJEmRDQJVQaTU/k9TBrSGH8AeL3+QH0lc2NyP/FUbu3H4u5lUT8rWKfQXouzG/eaMBzmXgzngDhcswE17D3oy5A7SMws4zHR2+Gve9hZQaJ907I+jdyXgGdt3qXvofoe9CnN2AB2CkAPmNlOojXz3j5Tlai48uVUdpH6SlKQ7CTFwfgEGwHOahkCn0Pszzc82aBrjFHoJ069ZsnT4GZwxXGmyLesMfRyVPMH4vy/Yy8zgglUfqI8WooTYfePezSP8uF5DW+iqwwnYHa/brvuraeJ/i/2YRO0RyZXDIhS+YOMrW8wDx1F4ByBX89y/ugISdHgNmp2LeyYglogyLvOsuvZ/xsXH7R/7IBU2nTOZOxADQnFbYxvQjt+rMKJ9MWDMlIxZMpztNYABojRZ7Y5GcqvG07qtJoDx3QOpOALJ/qu0OZreJYkU38CjY6kxptrWNyCk0BanByNVi5s0yZr4xfwvglGu1N+9rjNBpIZQrVRSl7VbXysVE6o9FeNZNxMnBAwmUf0Cj7gCnUSzzLKzim2V4f9x9NAKplSpa6PDJMs/c0zfayWZ2GwAEJb3hEs/xNscK9dOnvWaM0ZQpQpVvbpggQX/2qXbS3h9VdGzgg0WthlefgcLjjnvUDF+1Zi8kNU4CWsk0UndKQZr18duSIkFewUaOedZjsMgKIGtnMFPvjFPRTxKtfiXnV4dQpuPTLE2vggKihEyL2lu2ibrXw7dAcWzH8pShrjWqnUUAi1mBFc6pc3i7cUpxaxylW3sLMDWmfcUCk2EGh0AcZUY1SP0TKOzm33UaWbYeejiiC7S9UJhRF1n4RzkJ6aMRTcFCijjXepDChEToOFDusmueAPik6pd6IcxoF0BdSYIi+MT5w18F8wrQghB2iPq26LpIJQJZSjTZHgAnFCVYF8ieddkN+T6zJPq4Lq1go6pBNMdzhd0FZPIJsoqD/EroYfomjAfmfg76F9jo6b61bBYdD2uVYXzj7udZfTemThXTRvMijuRWxiOqBhQQo2QUIDGCsos/jlOKGWAB5BTYdtRzyKugd95i2wOeMmzmE0U3FZa5fwlXtPe5BRn7acADTEjAQFbCDMQFEd57834PaIPYIukZpFptquVFA8BSxxj4a+pcni22406YB9ZpoKMrNek1Qcuf9vASr0hytUneAdhteZbuBFmO4GfRYGcgPTwpA8fg9C0Nj6aY21sk4AHoblKC/AgwAe12uZH1xtscAAAAASUVORK5CYII=">
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-default"
                          @click.stop>
                          <img
                            width="14"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTJDQTg0RDgxRkY0MTFFOTk1RkFDRTdGQjE1MzEwNUEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTJDQTg0RDkxRkY0MTFFOTk1RkFDRTdGQjE1MzEwNUEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMTc2Mjg3RjFGRUMxMUU5OTVGQUNFN0ZCMTUzMTA1QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMTc2Mjg4MDFGRUMxMUU5OTVGQUNFN0ZCMTUzMTA1QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Plsh8gAAAAQFSURBVHja7FpdSBVBFN7rT2ZIifRrShII9XArEJGESiKKCOolkHqIHsIgqIciAqEXCXoJil41CKEIohKxJPrxwYwkSYtSqLAfKSjDUPvxptftO3UGxml37+7e/bvhgY+5d/bMzPl2zp4zM7uaruua14CcB5LAR6DIjzFMx/aYyBxgENAlELHajCME2QxMSkRGFGKtGUMI0qgY38z1FcCEVP8FWBRZQpB84L1kMM3QdgO954oL7o8cITJccbEhImih3wBMS/q3o0ZIJtNos00c+Cm1+woUR4VQPzBGwcBF216JFM1aXeCEINlMoMejQFKvuGBH0ITKeOCEh6F+FfBdIjUKlPpGCLIAuEID8/8qP8IupFtxwSOeE6LsziGW/nzwPSFq2jHFBbs8IwRpURLloUCyvKatBMalcb9RnWtC5E6czUWHCaAyyMUl29GpuOAJx4Qg+yQXI7ygyBY0Gcmew4oLPrZNCHJLcbFTYRFRSJVy5BN2/RAByqLNjLUYZfF4FMgoRt5TXLDaipBQ7IsaEcXQA5ILmib3GCuQ5KHilxZhicViwygWAs9g61ojnSzpdwINdAlTQLHNgZ4obc1AfS6x2Wev2p7JWEoWT6OR0NqtzubNW2NTj/o8aFM3bnGt0+xCDlAA1Cj1N+kmKTNoR27w7tVI3PZ5HWiS/r+Du/WbEsJFimztynTrPLhTeYP+2k1cyG2fg2Z9pnqG/guZJTRLaJZQtAgdNUuqVmPhejZwFfgMTACTnLPELjlwQsMOdK+ZJMrdvB/L4/woZAMITgOX7HSe4wUb5IllGJAy+9wUqi+hO8qzQqeuBfhPN+MisI4PTOiw/xVQwquFIs5fe9GmBvrLUxljtLIVG70GH1fPk7zsyk+hR7M2IO0KPlnphxkUaGYmeKVidcOHgdX4eYarFmOmnkYuysFIOgKe50D/OB+p/VkMg1R5JAjBkH6gy+VN2MO7apI7oRMCETKI3Gd9Gt2c43JFFGZI7IWSafRxUrpBtWETKuFyLI1nLyndkKqwCeWnS4hF7LILneYhvzCSZg4Tpz/1dvPQuM8zVZhGYKmQdr6X/7kuDucMGu5CkesxkfnABbGQxdhnXRDq0f6+XZ9C+1xbLufzgaF4GZBw0bZccts2378ksWnUJsmoAYdfqYhvHpJma8CwjnWbJVJvyVgbMyN/wNEUyLc+Dkm1KAfwbUCZwWz2GURJ0t8ZKUJscJPyDkgYO2VQT252WkopdH1HpAhJz0aHRe6jfVOrcEuOcDKprTPePpiF7ZDeLpCx24ClwGs6WoZ9QwZ6lSge8UpHZ1J3LfNQ1IVJdXOSJRJbwOV+xhJiUtUoHjCpJLjkZPS5HAg8RLGRnykKJNpvAQYA92AeCconMUAAAAAASUVORK5CYII=">
                        </button>
                        <label
                          v-tooltip.top="{ content: 'Select Item', delay: { show: 700, hide: 100 }}"
                          class="css-input css-checkbox css-checkbox-rounded css-checkbox-success margin-l-10 margin-t-5">
                          <input
                            :checked="i.selected"
                            type="checkbox"
                            @click="selectObject(index)"><span/>
                        </label>
                      </div>
                    </div>
                    <div
                      class="block-content">
                      <!-- Row -->
                      <div class="row">
                        <div class="col-xs-4">
                          <div class="padding-b-10"><i class="fa fa-user margin-r-5"/><span class="font-s13 font-w600 allcaps">Object</span></div>
                          <div class="css-table">
                            <div class="table-line">
                              <div class="line-param">Added</div>
                              <div class="line-value text-muted">
                                <div style="display: inline-block;"><span>Today</span></div>
                              </div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Address</div>
                              <div class="line-value text-muted">Oberwachtstrasse 6</div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">ZIP/Locality</div>
                              <div class="line-value text-muted">
                                8704 Herrliberg, ZH
                              </div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">&nbsp;</div>
                              <div class="line-value text-muted">
                                <button
                                  type="button"
                                  class="btn btn-sm btn-default has-tooltip"
                                  @click.stop><i class="fa fa-map"/></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-xs-4">
                          <div class="padding-b-10"><i class="fa fa-home margin-r-5"/><span class="font-s13 font-w600 allcaps">Building</span></div>
                          <div class="css-table">
                            <div class="table-line">
                              <div class="line-param">Room/s</div>
                              <div class="line-value text-muted">
                                5.5
                              </div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Living Area</div>
                              <div class="line-value text-muted">254 m<sup>2</sup></div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Property Area</div>
                              <div class="line-value text-muted">&nbsp;</div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Usable Area</div>
                              <div class="line-value text-muted">&nbsp;</div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Area</div>
                              <div class="line-value text-muted">254 m<sup>2</sup></div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Built Year</div>
                              <div class="line-value text-muted">
                                2008
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-xs-4">
                          <div class="padding-b-10 row">
                            <div class="col-xs-6"><i class="fa fa-info-circle margin-r-5"/><span class="font-s13 font-w600 allcaps">Info</span></div>
                            <div class="col-xs-6 text-right"/>
                          </div>
                          <div class="css-table">
                            <div class="table-line">
                              <div class="line-param">Tags</div>
                              <div class="line-value">
                                <span
                                  v-for="(i, index) in ['Favorite','Monitored','On Sale','No Price','Apartment Empty','Interested']"
                                  :key="index"
                                  :class="['label label-default', (index == 0 || index == 2 ? 'label-success':''), (index == 3 ? 'label-danger':'')]"
                                  class="margin-r-5">{{ i }}</span>
                              </div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Apartments Count</div>
                              <div class="line-value text-muted">
                                3
                              </div>
                            </div>
                            <div class="table-line">
                              <div class="line-param">Category</div>
                              <div class="line-value">
                                <span
                                  v-if="index == 0"
                                  class="label label-info">House</span>
                                <span
                                  v-if="index == 1"
                                  class="label label-info">Apartment</span>
                                <span
                                  v-if="index == 2"
                                  class="label label-info">Villa</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- / Row -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <!-- Left Sidebar -->
      <aside
        id="side-overlay"
        :class="{'active': leftSidebar}"
        class="one-level-cap">
        <button
          type="button"
          class="back-button-extra btn btn-default pull-right side-overlay--button has-tooltip"
          data-original-title="null"
          @click="leftSidebar=!leftSidebar"><i class="arrow"/>
        </button>
        <form>
          <div class="side-panel">
            <div class="flex-head fancy-shadow">
              <div class="data-section">
                <div class="section-label">
                  <div class="label-copy">Portfolio</div>
                  <div class="section-controls">
                    <button
                      type="button"
                      class="btn btn-sm btn-success"
                      @click="addList=!addList">Add List</button>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-bar
              class="flex-scroll">
              <div class="tab-content">
                <div class="tab-pane active">
                  <div class="side-panel">
                    <div class="data-section">
                      <div class="section-content">
                        <ul class="list list-selectable static-controls overcome-borders">
                          <li>
                            <div class="font-w600"><i class="fa fa-star-o"/> All items
                              <button
                                class="btn btn-sm btn-default pull-right btn-mobile"
                                type="button">Show</button>
                            </div>
                            <div class="font-s12 font-w400 text-muted">
                              <span>15 objects</span>
                            </div>
                          </li>
                          <li
                            :class="{'is-active':!addList}">
                            <div class="font-w600">List 1
                              <button
                                class="btn btn-sm btn-default pull-right btn-mobile"
                                type="button">Show</button>
                            </div>
                            <div class="font-s12 font-w400 text-muted">
                              <span>3 objects</span>
                            </div>
                            <div class="additional-controlls">
                              <div class="btn-group">
                                <button
                                  v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button">
                                  <i class="glyphicon glyphicon-pencil"/>
                                </button>
                                <button
                                  v-tooltip.top="{ content: 'Delete List', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-sm btn-default bg-white"
                                  style=""
                                  type="button">
                                  <i class="fa fa-trash"/>
                                </button>
                              </div>
                            </div>
                          </li>
                          <li
                            v-if="addList"
                            class="is-active new-item">
                            <div
                              class="label-copy margin-b-10">
                              <input
                                class="form-control input-sm"
                                value="List 2">
                            </div>
                            <div class="additional-controlls">
                              <div class="btn-group">
                                <button
                                  v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button">
                                  <i class="fa fa-check"/>
                                </button>
                                <button
                                  v-tooltip.top="{ content: 'Delete List', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-sm btn-default bg-white"
                                  style=""
                                  type="button"
                                  @click="addList = false">
                                  <i class="fa fa-trash"/>
                                </button>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </aside>
      <!-- / Left Sidebar -->
    </div>
    <aside
      v-if="sidebarDeployed"
      id="sidebar-fixed"
      class="active sidebar-shadow w-650">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <i class="fa fa-building-o margin-r-5" />
                <span class="font-s15 font-w600">Eine Klasse für sich – Luxuriöse Terrassenwohnung mit Seeblick</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <span>
              <button
                v-tooltip.bottom="{ content: 'Previous object', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next object', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default margin-r-10"
                type="button">
                <i class="fa fa-arrow-right"/>
              </button>
            </span>
            <button
              class="btn btn-sm btn-default has-tooltip"
              aria-describedby="tooltip_bax3dcmew8"
              @click="sidebarDeployed=!sidebarDeployed">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <ul class="flex-tabs list-unstyled">
          <li
            :class="{active: tabsItem['overview']}"
            @click="show('overview')">
            <span>Basic Info</span>
          </li>
          <li
            :class="{active: tabsItem['images']}"
            @click="show('images')">
            <span>Images</span>
          </li>
          <li
            :class="{active: tabsItem['apartments']}"
            class="with-badge"
            @click="show('apartments')">
            <span>Apartments</span>
            <span
              :class="{'badge-primary': tabsItem['apartments'], 'badge-default': !tabsItem['apartments']}"
              class="badge">3</span>
          </li>
          <li
            :class="{active: tabsItem['neighborhood']}"
            @click="show('neighborhood')">
            <span>Neighborhood</span>
          </li>
          <li
            :class="{active: tabsItem['contact']}"
            @click="show('contact')">
            <span>Contact</span>
          </li>
          <li
            :class="{active: tabsItem['history']}"
            @click="show('history')">
            <span>History</span>
          </li>
        </ul>
        <div
          v-bar
          class="detail-content">
          <div class="tab-content">
            <!-- Basic Info Tab -->
            <div
              v-if="tabsItem['overview']"
              class="tab-pane active padding-b-20">
              <div>
                <!-- Tags -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show">
                    <div class="label-copy">Tags</div>
                    <div class="section-controls">
                      <button class="btn btn-sm btn-default has-tooltip cursor-none">
                        <i class="fa fa-angle-up"/>
                      </button>
                    </div>
                  </div>
                  <div
                    class="section-content">
                    <div class="form-group">
                      <div class="input-group tamed-input-group">
                        <span class="input-group-addon input-icon"><i class="fa fa-tag"/></span>
                        <multiselect
                          :placeholder="'demo'"
                          :options="optionsDemo"
                          :group-select="false"
                          :multiple="false"
                          :limit="1"
                          :allow-empty="false"
                          :taggable="true"
                          :show-labels="false"
                          :clear-on-select="true"
                          :close-on-select="true"
                          class="multiselect-sm"
                          name="property type"
                          track-by="id"
                          openDirection="bottom"
                        />
                      </div>
                    </div>
                    <div class="form-group">
                      <div>
                        <span
                          v-for="(i, index) in ['Favorite','Monitored','On Sale','No Price','Apartment Empty','Interested','Address Located','PP Complete']"
                          :key="index"
                          class="multiselect__tag"><span notranslate="">{{ i }}</span> <i class="multiselect__tag-icon"/></span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Tags -->
                <!-- Basic Info -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click.stop="sectionBasic=!sectionBasic">
                    <div class="label-copy">Basic Info</div>
                    <div class="section-controls">
                      <button class="btn btn-sm btn-default has-tooltip cursor-none">
                        <i
                          :class="{'fa-angle-up': sectionBasic, 'fa-angle-down': !sectionBasic}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="sectionBasic"
                    class="section-content">
                    <div class="form-group row">
                      <div class="col-xs-12">
                        <label for="url">Title</label>
                        <input
                          id="url"
                          type="text"
                          class="form-control"
                          value="Moderne Attikawohnung: Ländlich und doch nahe zur Stadt Zürich">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-12">
                        <label for="url">Description</label>
                        <textarea
                          type="text"
                          class="form-control"
                          rows="5">An sonniger, sehr ruhiger Hanglage, am begehrtem Zürichbergzwischen Rigiplatz und Hadlaubstrasse, verkaufen wir per sofortin einem Doppelmehrfamilienhaus mit insgesamt 11 Einheiten, eine schöne4,5 Zimmerwohnung mit grosszügigem Balkon im 1. Obergeschossmit Küche, Bad, sep. WC und Cheminée sowie einem Keller. Die Wohnung mit Ausrichtung nach Südwesten und heller, angenehmer Atmosphäre, bietet ca. 102m2 Wohnfläche.Das zu verkaufende Objekt verfügt über einen Einstellhallenplatz Die Wohnung weist Renovationsbedarf auf. Die Boden- und Wandbeläge müssen aufgefrischt und Küche und Bad sollten erneuert werden.</textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Basic Info -->
                <!-- Address -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click.stop="sectionAddress=!sectionAddress">
                    <div class="label-copy">Address</div>
                    <div class="section-controls">
                      <button class="btn btn-sm btn-default has-tooltip cursor-none">
                        <i
                          :class="{'fa-angle-up': sectionAddress, 'fa-angle-down': !sectionAddress}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="sectionAddress"
                    class="section-content">
                    <div class="form-group row">
                      <div class="col-xs-4">
                        <div>
                          <label for="cityName">Street</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="Buechwisstrasse"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-2">
                        <div>
                          <label for="cityName">Number</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="8"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-2">
                        <div>
                          <label for="postcode">ZIP</label>
                          <input
                            id="postcode"
                            type="text"
                            name="postcode"
                            value="8121"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-4">
                        <div>
                          <label for="postcode">Locality</label>
                          <input
                            id="locality"
                            type="text"
                            name="postcode"
                            value="Benglen"
                            class="form-control">
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <div>
                          <label for="cityName">Latitude</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="46.946648"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-6">
                        <div>
                          <label for="cityName">Longitude</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="7.449737"
                            class="form-control">
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-3">
                        <button
                          type="button"
                          class="btn btn-block btn-sm btn-default">Select on Map</button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Address -->
                <!-- Building -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click="sectionBuilding=!sectionBuilding">
                    <div class="label-copy">Building</div>
                    <div class="section-controls">
                      <button class="btn btn-sm btn-default has-tooltip cursor-none">
                        <i
                          :class="{'fa-angle-up': sectionBuilding, 'fa-angle-down': !sectionBuilding}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="sectionBuilding"
                    class="section-content">
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Category</label>
                        <div class="input-group tamed-input-group width100percent">
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="up"
                          />
                        </div>
                      </div>
                      <div class="col-xs-6">
                        <label for="">Micro location</label>
                        <div class="input-group tamed-input-group width100percent">
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="up"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Built Year</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1932">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Total Floors</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="4">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">EGID</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="RS 431.841">
                      </div>
                      <div class="col-xs-6">
                        <label for="">BFS Number</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="6621">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Cadastre District</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="21">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Number</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="c447">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Cubature</label>
                        <input
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Construction Quality</label>
                        <div class="input-group tamed-input-group width100percent">
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="up"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Garage count</label>
                        <input
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                      <div class="col-xs-6">
                        <label for="">House types</label>
                        <div class="input-group tamed-input-group width100percent">
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="up"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Renovation Year</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1997">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Complete Renovation Year</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Building -->
                <!-- Property -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click.stop="sectionProperty=!sectionProperty">
                    <div class="label-copy">Property</div>
                    <div class="section-controls">
                      <button
                        class="btn btn-sm btn-default has-tooltip cursor-none">
                        <i
                          :class="{'fa-angle-up': sectionProperty, 'fa-angle-down': !sectionProperty}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="sectionProperty"
                    class="section-content">
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Property Area, m<sup>2</sup></label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="217">
                      </div>
                      <div class="col-xs-6">
                        <label for="">BFS Number</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="6621">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">EGID</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="CH722488848123">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Cadastre District</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="21">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6"/>
                      <div class="col-xs-6">
                        <label for="">Parcel Nummer</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="383">
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Property -->
              </div>
            </div>
            <!-- / Basic Info Tab -->
            <!-- Images Tab -->
            <div
              v-if="tabsItem['images']"
              class="tab-pane active padding-b-20">
              <div>
                <div class="data-section stand-out">
                  <div class="section-content">
                    <div
                      v-for="(i, index) in 5"
                      :key="index"
                      class="image-container">
                      <div class="container-content">
                        <img
                          v-if="index == 0"
                          src="https://axresources.azurewebsites.net/image/get/c3df5d72-1641-a9e2-d6f0-6251191e48aa/?mw=1760&mh=1083&q=90">
                        <img
                          v-if="index == 1"
                          src="https://axresources.azurewebsites.net/image/get/0f5a3b66-318a-ea9e-6640-1d65d472d4e0/?mw=1760&mh=1083&q=90">
                        <img
                          v-if="index == 2"
                          src="https://axresources.azurewebsites.net/image/get/00120873-4e51-819c-ff7b-fab2cb6997a3/?mw=1760&mh=1083&q=90">
                        <img
                          v-if="index == 3"
                          src="https://axresources.azurewebsites.net/image/get/89c255e4-64f3-52b8-5b24-a780bcdd1075/?mw=1760&mh=1083&q=90">
                        <img
                          v-if="index == 4"
                          src="https://axresources.azurewebsites.net/image/get/2d22e880-fe63-650f-f5a1-3c0c7350d2ee/?mw=1760&mh=1083&q=90">
                      </div>
                      <div class="container-control">
                        <div class="btn-group">
                          <button
                            v-tooltip.top="{ content: 'Move Up', delay: { show: 700, hide: 100 }}"
                            :disabled="index == 0"
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-chevron-up"/></button>
                          <button
                            v-tooltip.top="{ content: 'Move Down', delay: { show: 700, hide: 100 }}"
                            :disabled="index == 4"
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-chevron-down"/></button>
                        </div>
                        <button
                          v-tooltip.top="{ content: 'Delete', delay: { show: 700, hide: 100 }}"
                          type="button"
                          class="btn btn-xs btn-default"><i class="fa fa-trash"/></button>
                      </div>
                    </div>
                    <div class="padding-t-10">
                      <button
                        type="button"
                        class="btn btn-block btn-sm btn-success">Add Images</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / Images Tab -->
            <!-- Apartments Tab -->
            <div
              v-if="tabsItem['apartments']"
              class="tab-pane active padding-b-20">
              <div>
                <div
                  v-for="(i, index) in ['315','316','317']"
                  :key="index"
                  class="data-section stand-out">
                  <div
                    class="section-label cursor-show">
                    <div class="label-copy">Apartment No. {{ i }}</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.top="{ content: 'Delete Apartment', delay: { show: 700, hide: 100 }}"
                        type="button"
                        class="btn btn-sm btn-default"><i class="fa fa-trash"/></button>
                      <button
                        v-tooltip.top="{ content: 'Toggle Apartment Info', delay: { show: 700, hide: 100 }}"
                        type="button"
                        class="btn btn-sm btn-default"><i class="fa fa-angle-up"/></button>
                    </div>
                  </div>
                  <div
                    class="section-content">
                    <div class="form-group row">
                      <div class="col-xs-10">
                        <label for="">Title</label>
                        <input
                          :value="'Stock ' + i"
                          type="text"
                          class="form-control">
                      </div>
                      <div class="col-xs-2">
                        <label for="">Number</label>
                        <input
                          :value="i"
                          type="text"
                          class="form-control">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Sell Price, CHF</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1 200 000">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Rent Price, CHF</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="900">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">EWID</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="3">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Rooms</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Level number</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Position</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Living Area, m<sup>2</sup></label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="54">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Admin Number</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="E01.11">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Level</label>
                        <input
                          id=""
                          type="text"
                          class="form-control"
                          value="1. Stock">
                      </div>
                      <div class="col-xs-6">
                        <label for="">Bathrooms count</label>
                        <input
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                    </div>
                    <!-- Transaction Inputs -->
                    <div class="form-group row">
                      <div class="col-xs-6">
                        <label for="">Condition</label>
                        <div class="input-group tamed-input-group width100percent">
                          <multiselect
                            :placeholder="'demo'"
                            :options="optionsDemo"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :allow-empty="false"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class="multiselect-sm"
                            name="property type"
                            track-by="id"
                            openDirection="up"
                          />
                        </div>
                      </div>
                      <div class="col-xs-6">
                        <label for="">Complete Renovation Year</label>
                        <input
                          type="text"
                          class="form-control"
                          value="">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data-section padding-t-10">
                  <button
                    type="button"
                    class="btn btn-block btn-sm btn-success">Add Apartment</button>
                </div>
              </div>
            </div>
            <!-- / Apartments Tab -->
            <!-- Neighborhood Tab -->
            <div
              v-if="tabsItem['neighborhood']"
              class="tab-pane active padding-b-20">
              <div>
                <div class="data-section stand-out">
                  <div class="section-content">Neighborhood Info</div>
                </div>
              </div>
            </div>
            <!-- / Neighborhood Tab -->
            <!-- Contact Tab -->
            <div
              v-if="tabsItem['contact']"
              class="tab-pane active padding-b-20">
              <div>
                <!-- Contact Section -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click="showContactInfo=!showContactInfo">
                    <div class="label-copy">Contact Info</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default"
                        type="button">
                        <i
                          :class="{'fa-angle-up': showContactInfo, 'fa-angle-down': !showContactInfo}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="showContactInfo"
                    class="section-content">
                    <div class="form-group">
                      <div class="row margin-b-10">
                        <div
                          class="col-xs-12">
                          <label for="phone">Organization Name</label>
                          <input
                            id="name"
                            notranslate
                            type="text"
                            class="form-control"
                            name="name"
                            data-vv-scope="profile_form">
                        </div>
                      </div>
                      <div class="row margin-b-10">
                        <div
                          class="col-xs-12">
                          <label for="phone">Person Name</label>
                          <input
                            id="firstName"
                            notranslate
                            type="text"
                            class="form-control"
                            name="firstName"
                            data-vv-scope="profile_form">
                        </div>
                      </div>
                    </div>
                    <!-- Place for Address -->
                    <div class="form-group row">
                      <div class="col-xs-12">
                        <label for="url">Address</label>
                        <input
                          id="url"
                          type="text"
                          class="form-control"
                          placeholder="Zip, City, Commune …">
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-5">
                        <div>
                          <label for="postcode">City</label>
                          <input
                            id="locality"
                            type="text"
                            name="postcode"
                            value="Brig"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-5">
                        <div>
                          <label for="cityName">Street</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="Buechwisstrasse"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-2">
                        <div>
                          <label for="cityName">Number</label>
                          <input
                            id="cityName"
                            type="text"
                            name="cityName"
                            value="8"
                            class="form-control">
                        </div>
                      </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-xs-2">
                        <div>
                          <label for="postcode">ZIP</label>
                          <input
                            id="postcode"
                            type="text"
                            name="postcode"
                            value="3900"
                            class="form-control">
                        </div>
                      </div>
                      <div class="col-xs-2">
                        <div>
                          <label for="postcode">Country</label>
                          <select
                            class="form-control">
                            <option>CH</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div
                      class="form-group">
                      <div class="row margin-b-10">
                        <div
                          class="col-xs-12"> <!-- has-error -->
                          <label for="phone">Phone</label>
                          <the-mask
                            id="phone"
                            notranslate
                            class="form-control"
                            name="phone"
                            data-vv-scope="profile_form"
                            masked
                            mask="+41 (0) ## ### ## ##"/>
                            <!-- <div
                              class="help-block text-right animated fadeInDown">Enter valid phone number
                            </div> -->
                        </div>
                      </div>
                      <div class="row margin-b-10">
                        <div
                          class="col-xs-12">
                          <label for="cell">Cell</label>
                          <the-mask
                            id="cell"
                            notranslate
                            class="form-control"
                            name="cell"
                            data-vv-scope="profile_form"
                            masked
                            mask="+41 (0) ## ### ## ##"/>
                        </div>
                      </div>
                      <div class="row margin-b-10">
                        <div class="col-xs-12">
                          <label for="url">Website</label>
                          <input
                            id="url"
                            notranslate
                            class="form-control"
                            type="text"
                          >
                        </div>
                      </div>
                      <div class="row margin-b-10">
                        <div class="col-xs-12">
                          <label for="remarks">Remarks</label>
                          <input
                            id="remarks"
                            notranslate
                            class="form-control"
                            type="text"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- / Contact Section -->
                <!-- Cutom Section -->
                <div
                  class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click="showCustomContactInfo=!showCustomContactInfo">
                    <div class="label-copy">Custom Data</div>
                    <div class="section-controls">
                      <button
                        type="button"
                        class="btn btn-sm btn-success"
                        @click.stop="addContactField=!addContactField"><i class="fa fa-plus"/> Add Field</button>
                      <button
                        v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default"
                        type="button">
                        <i
                          :class="{'fa-angle-up': showCustomContactInfo, 'fa-angle-down': !showCustomContactInfo}"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="showCustomContactInfo"
                    class="section-content">
                    <div
                      class="row margin-b-10">
                      <div
                        class="col-xs-12">
                        <label notranslate>Custom Value</label>
                        <div class="input-group">
                          <input
                            notranslate
                            type="text"
                            class="form-control"
                            value="1698">
                          <span class="input-group-btn">
                            <button
                              class="btn btn-default"
                              type="button"><i class="fa fa-close"/></button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="addContactField"
                      class="stand-plate bg-warning-light fancy-shadow">
                      <div class="plate-title">Add Field</div>
                      <form
                        id="addContactField"
                        data-vv-scope="addContactField">
                        <div class="plate-content">
                          <div
                            class="form-group">
                            <label>Name</label>
                            <input
                              name="name"
                              data-vv-scope="addContactField"
                              notranslate
                              type="text"
                              class="form-control input-sm">
                          </div>
                          <div class="form-group">
                            <label>Value</label>
                            <input
                              notranslate
                              type="text"
                              class="form-control input-sm">
                          </div>
                        </div>
                        <div class="plate-controls">
                          <button
                            type="button"
                            class="btn btn-sm btn-default"
                            @click.stop>Cancel</button>
                          <button
                            type="submit"
                            class="btn btn-sm btn-success">Add new Field</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <!-- / Cutom Section -->
                <!-- Buttons Section -->
                <div class="data-section">
                  <div
                    class="section-content padding-t-10">
                    <div class="form-group">
                      <button
                        type="button"
                        class="btn btn-block btn-sm btn-success"
                        @click.stop>
                        <i
                          v-if="updatingEntry"
                          class="fa fa-circle-o-notch fa-spin"/> Update</button>
                    </div>
                  </div>
                </div>
                <!-- / Buttons Section -->
              </div>
            </div>
            <!-- / Contact Tab -->
            <!-- / Inhabitants Tab -->
            <!-- History Tab -->
            <div
              v-if="tabsItem['history']"
              class="tab-pane active padding-b-20">
              <div>
                <div
                  v-for="(i, index) in ['Price Prediction', 'Market Radar', 'Files', 'Price Prediction', 'Files', 'Market Radar']"
                  :key="index"
                  class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-icon-wrap">
                      <span
                        v-if="i == 'Price Prediction'"
                        class="icon-priceprediction"/>
                      <span
                        v-if="i == 'Market Radar'"
                        class="icon-marketradar"/>
                      <i
                        v-if="i == 'Files'"
                        class="si si-docs"/>
                    </div>
                    <div class="label-copy">
                      <div class="label-copy--subheader">13 Sep 2019</div>
                      <span>{{ i }}</span>
                    </div>
                  </div>
                  <div
                    class="section-content">
                    <div
                      v-if="i == 'Price Prediction'"
                      class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            Advertising Price
                          </div>
                          <div class="value">845'528</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            m<sup>2</sup> Price
                          </div>
                          <div class="value">21'138</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Price Range</div>
                          <div class="value">647'100 <i class="fa fa-arrows-h"/> 1'062'023</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">m<sup>2</sup> Range</div>
                          <div class="value">16'177 <i class="fa fa-arrows-h"/> 26'551</div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="i == 'Market Radar'"
                      class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            Advertising Price (Rent)
                          </div>
                          <div class="value">1'268</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            m<sup>2</sup> Price
                          </div>
                          <div class="value">68</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Price Range</div>
                          <div class="value">1'205 <i class="fa fa-arrows-h"/> 1'531</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">m<sup>2</sup> Range</div>
                          <div class="value">60 <i class="fa fa-arrows-h"/> 77</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">Simillar Offers</div>
                          <div class="value">72</div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="i == 'Files'"
                      class="fluid-data-table flex-option">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            <a href="#">Flat_Plan_ImmoSparrow_2019_08_25_NEW2.pdf</a>
                          </div>
                          <div class="value">258 Kb</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- / History Tab -->
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
