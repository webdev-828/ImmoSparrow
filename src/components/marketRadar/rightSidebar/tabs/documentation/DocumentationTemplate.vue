<template>
  <div class="tab-pane active">
    <template v-if="wizardSteps.paragraphs">
      <div class="data-section stand-out scroll-anchor">
        <div class="section-label cursor-show">
          <div class="label-copy">Documentation: Paragraphs and File Type</div>
          <div class="section-controls">
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-default"
                disabled>
                <i class="fa fa-arrow-left"/>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-default"
                @click="showTab('images')">
                <i class="fa fa-arrow-right"/>
              </button>
            </div>
          </div>
        </div>
        <div class="section-content">
          <div class="mr-doc font-s13 margin-b-5">
            <div class="mr-doc--message">
              Chose paragraphs you want to include in the file and download document in the prefered format.
            </div>
            <div class="mr-doc--image">
              <img
                src="/static/img/misc/mr-doc.png"
                alt="Market Radar Document" >
            </div>
          </div>
          <div class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">Paragraphs</div>
              <div class="data-subsection--label--controls">
                <span class="font-s12">Include in file</span>
              </div>
            </div>
            <div class="data-subsection--content">
              <div class="fluid-data-table flex-option big-data">
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Overview</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeOverview"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Images</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeImages"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Price Prediction</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includePricePrediction"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Similar Offers</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeSimilarOffers"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Price History</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includePriceHistory"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Selected Objects</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeSelectedObjects"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Market Situation</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeMarketSituation"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Macrolocation</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeMacroLocation"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Public Transport</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includePublicTransport"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Education</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeEducation"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">View / Silence</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeView"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Shopping / Services</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeShopping"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Immissions</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeImmissions"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell no-accent">
                    <div class="attribute">Construction Sites</div>
                    <div class="value">
                      <label class="css-input switch switch-sm switch-success margin-0">
                        <input
                          :checked="displayParagraphSettings.includeConstructionSites"
                          type="checkbox">
                        <span/>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">File type</div>
            </div>
            <div class="data-subsection--content">
              <div class="margin-b-15">
                <div class="margin-b-5">
                  <label class="css-input css-radio css-radio-default">
                    <input
                      v-model="exportType"
                      value="pptx"
                      type="radio"
                      name="radio-group1">
                    <span/> PowerPoint presentation
                  </label>
                </div>
                <div class="margin-b-5">
                  <label class="css-input css-radio css-radio-default">
                    <input
                      v-model="exportType"
                      value="docx"
                      type="radio"
                      name="radio-group1">
                    <span/> Microsoft Word document
                  </label>
                </div>
                <div class="margin-b-5">
                  <label class="css-input css-radio css-radio-default">
                    <input
                      v-model="exportType"
                      value="pdf"
                      type="radio"
                      name="radio-group1">
                    <span/> PDF document
                  </label>
                </div>
              </div>
              <div class="margin-b-20">
                <button
                  class="btn btn-block btn-sm btn-default"
                  type="button"
                  @click="showTab('images')">
                  Select images →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="wizardSteps.images">
      <div class="data-section stand-out scroll-anchor">
        <div class="section-label cursor-show">
          <div class="label-copy">Images</div>
          <div class="section-controls">
            <button
              type="button"
              class="btn btn-sm btn-default"
              @click="uploadSection=!uploadSection">
              Upload
            </button>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-default"
                @click="showTab('paragraphs')">
                <i class="fa fa-arrow-left"/>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-default"
                @click="showTab('params')">
                <i class="fa fa-arrow-right"/>
              </button>
            </div>
          </div>
        </div>
        <div class="section-content">
          <div
            v-show="uploadSection"
            class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">Upload Images</div>
            </div>
            <div class="data-subsection--content">
              <div class="form-group">
                <input
                  id="imageUpload"
                  type="file"
                  class="form-control font-s12 margin-b-10">
                <button
                  type="button"
                  class="btn btn-xs btn-success">
                  Upload
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-default"
                  @click="uploadSection=false">
                  Cancel
                </button>
              </div>
              <div class="image-container-wrap">
                <div
                  v-for="(i, index) in documentImages"
                  :key="index"
                  class="image-container">
                  <div
                    :style="'background-image: url(https://axresources.azurewebsites.net/image/get/'+ i.src +'/?mw=1760&mh=1083&q=90);'"
                    class="container-content image-bg"/>
                  <div class="container-control">
                    <button
                      v-tooltip.top="{ content: 'Delete', delay: { show: 700, hide: 100 }}"
                      type="button"
                      class="btn btn-xs btn-default">
                      <i class="fa fa-close"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">Main</div>
            </div>
            <div class="data-subsection--content">
              <div class="btn-group with-item">
                <button
                  type="button"
                  class="btn btn-sm btn-default dropdown-toggle left-btn"
                  data-toggle="dropdown"
                  aria-expanded="false">
                  <div
                    class="image-btn big-image"
                    style="background-image: url('https://axresources.azurewebsites.net/image/get/c3df5d72-1641-a9e2-d6f0-6251191e48aa/?mw=1760&mh=1083&q=90');"/>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-default dropdown-toggle caret-btn"
                  data-toggle="dropdown"
                  aria-expanded="false"><span class="caret" />
                </button>
                <ul class="filter-dropdown dropdown-menu">
                  <li>
                    <div class="flex-scroll show-scrollbar">
                      <div class="padding-10">
                        <div
                          v-for="(image, index) in documentImages"
                          :key="index"
                          :class="{ selected: image.selected }"
                          class="image-container selectable">
                          <div class="container-content">
                            <img :src="'https://axresources.azurewebsites.net/image/get/'+ image.src +'/?mw=1760&mh=1083&q=90'">
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">Overview</div>
            </div>
            <div class="data-subsection--content">
              <div class="row">
                <div class="col-xs-6 padding-r-5">
                  <div class="form-group margin-b-0">
                    <div class="btn-group with-item">
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle left-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <div
                          class="image-btn"
                          style="background-image: url('https://axresources.azurewebsites.net/image/get/23c14291-9eac-a4c0-0556-68cf743dc606/?mw=1760&mh=1083&q=90');"/>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle caret-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <span class="caret" />
                      </button>
                      <ul class="filter-dropdown dropdown-menu">
                        <li>
                          <div class="flex-scroll show-scrollbar">
                            <div class="padding-10">
                              <div
                                v-for="(image, index) in documentImages"
                                :key="index"
                                :class="{ selected: image.selected }"
                                class="image-container selectable">
                                <div class="container-content">
                                  <img :src="'https://axresources.azurewebsites.net/image/get/'+ image.src +'/?mw=1760&mh=1083&q=90'">
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="col-xs-6 padding-l-5">
                  <div class="form-group margin-b-0">
                    <div class="btn-group with-item">
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle left-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <div
                          class="image-btn"
                          style="background-image: url('https://axresources.azurewebsites.net/image/get/00120873-4e51-819c-ff7b-fab2cb6997a3/?mw=1760&mh=1083&q=90');"/>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle caret-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <span class="caret" />
                      </button>
                      <ul class="filter-dropdown dropdown-menu dropdown-menu-right">
                        <li>
                          <div class="flex-scroll show-scrollbar">
                            <div class="padding-10">
                              <div
                                v-for="(image, index) in documentImages"
                                :key="index"
                                :class="{ selected: image.selected }"
                                class="image-container selectable">
                                <div class="container-content">
                                  <img :src="'https://axresources.azurewebsites.net/image/get/'+ image.src +'/?mw=1760&mh=1083&q=90'">
                                </div>
                              </div>
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
          <div class="data-subsection">
            <div class="data-subsection--label">
              <div class="data-subsection--label--copy">Presentation</div>
              <div class="data-subsection--label--controls">
                <button
                  class="btn btn-xs btn-default"
                  type="button">
                  <i class="fa fa-angle-up"/>
                </button>
              </div>
            </div>
            <div class="data-subsection--content">
              <div class="row">
                <div
                  v-for="(image, index) in presentationImages"
                  :key="index"
                  class="col-xs-6 col-xs-6-lesser-padding margin-b-10">
                  <div class="form-group margin-b-5">
                    <div class="btn-group with-item">
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle left-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <div
                          v-if="index == 5"
                          class="image-btn no-image">
                          <i class="icon-no-image"/>
                        </div>
                        <div
                          v-else
                          :style="'background-image: url(https://axresources.azurewebsites.net/image/get/'+ image.src +'/?mw=1760&mh=1083&q=90);'"
                          class="image-btn"/>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-default dropdown-toggle caret-btn"
                        data-toggle="dropdown"
                        aria-expanded="false">
                        <span class="caret" />
                      </button>
                      <ul
                        :class="{'dropdown-menu-right': index == 1 || index == 3 || index == 5}"
                        class="filter-dropdown dropdown-menu">
                        <li>
                          <div class="flex-scroll show-scrollbar">
                            <div class="padding-10">
                              <div class="image-container selectable no-image">
                                <i class="icon-no-image"/>
                              </div>
                              <div
                                v-for="(image, index) in documentImages"
                                :key="index"
                                :class="{'selected': image.selected}"
                                class="image-container selectable">
                                <div class="container-content">
                                  <img
                                    :src="'https://axresources.azurewebsites.net/image/get/'+ image.src +'/?mw=1760&mh=1083&q=90'">
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="form-group">
                    <input
                      :value="image.title"
                      :disabled="index == 5"
                      type="text"
                      class="form-control input-sm">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="data-subsection">
            <div class="data-subsection--content">
              <div class="margin-b-20">
                <button
                  class="btn btn-block btn-sm btn-default"
                  type="button"
                  @click="showTab('params')">
                  Set titles and Download →
                </button>
                <button
                  class="btn btn-block btn-sm btn-default"
                  type="button"
                  @click="showTab('paragraphs')">
                  ← Choose paragraphs and type
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="wizardSteps.params">
      <div class="data-section stand-out scroll-anchor">
        <div class="section-label cursor-show">
          <div class="label-copy">Titles</div>
          <div class="section-controls">
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-default"
                @click="showTab('images')">
                <i class="fa fa-arrow-left"/>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-default"
                disabled>
                <i class="fa fa-arrow-right"/>
              </button>
            </div>
          </div>
        </div>
        <div class="section-content">
          <div class="data-subsection">
            <div class="data-subsection--content">
              <div class="form-group">
                <label>Teaser</label>
                <input
                  class="form-control input-sm"
                  type="text">
              </div>
              <div class="form-group">
                <label>Customer Name</label>
                <input
                  class="form-control input-sm"
                  type="text">
              </div>
              <div class="form-group">
                <label>Proposal Price</label>
                <input
                  class="form-control input-sm"
                  type="text">
              </div>
              <div class="form-group">
                <label>Proposal Price / m<sup>2</sup></label>
                <input
                  class="form-control input-sm"
                  type="text">
              </div>
              <div class="margin-b-20">
                <button
                  class="btn btn-block btn-sm btn-success"
                  type="button"
                  @click="download()"
                >Download</button>
                <button
                  class="btn btn-block btn-sm btn-default"
                  type="button"
                  @click="showTab('images')">
                  ← Select Images
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
