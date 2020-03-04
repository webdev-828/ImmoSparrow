<template>
  <div
    class="tabs-content padding-20">
    <div class="data-section stand-out">
      <div
        class="section-label">
        <div class="label-copy with-tabs block-tabs">
          <span
            :class="{'active': templateTabs['marketradar']}"
            class="label-tab beta-feature feature-on-block"
            @click="show('marketradar')">Marketradar</span>
          <span
            :class="{'active': templateTabs['email']}"
            class="label-tab alpha-feature feature-on-block"
            @click="show('email')">Email</span>
        </div>
        <div class="section-controls">
          <div
            class="btn-group">
            <button
              type="button"
              class="btn btn-sm btn-success dropdown-toggle"
              data-toggle="dropdown"
              aria-expanded="false">
              Upload
            </button>
            <ul class="filter-dropdown dropdown-menu dropdown-menu-right padding-0">
              <li>
                <div style="width: 390px;">
                  <div class="padding-10">
                    <form>
                      <div class="data-section stand-out bg-gray-light-fix">
                        <div class="section-label">
                          <div class="label-copy">Upload Template</div>
                          <div class="section-controls">
                            <div class="btn-group">
                              <button
                                :class="{'active': templateTabs['marketradar']}"
                                type="button"
                                class="btn btn-sm btn-default bg-white">Marketradar</button>
                              <button
                                :class="{'active': templateTabs['email']}"
                                type="button"
                                class="btn btn-sm btn-default bg-white">Email</button>
                            </div>
                          </div>
                        </div>
                        <div class="section-content">
                          <div class="from-group margin-b-10">
                            <label for="doc-title">Title</label>
                            <input
                              id="doc-title"
                              type="text"
                              class="form-control input-sm">
                          </div>
                          <div class="from-group margin-b-10">
                            <label for="doc-type">Document Type</label>
                            <select
                              id="doc-type"
                              class="form-control input-sm">
                              <option>Powerpoint</option>
                              <option>Word</option>
                            </select>
                          </div>
                          <div class="from-group margin-b-10">
                            <label for="temp-type">Template Type</label>
                            <select
                              id="temp-type"
                              class="form-control input-sm">
                              <option>AgencySlides</option>
                              <option>FullSlides</option>
                              <option>FullDocumentation</option>
                            </select>
                          </div>
                          <div class="from-group margin-b-20">
                            <label for="doc-file">File</label>
                            <input
                              id="doc-file"
                              type="file"
                              class="form-contol font-s12">
                          </div>
                          <div class="margin-b-20">
                            <button
                              type="button"
                              class="btn btn-block btn-sm btn-success">Upload</button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-if="templateTabs['marketradar']"
        class="section-content">
        <table class="table table-condensed">
          <tbody>
            <tr class="head-row">
              <td>Image</td>
              <td>Title</td>
              <td>Document Type</td>
              <td>Template Type</td>
              <td>Last Change</td>
              <td>Valid</td>
              <td class="text-right">Actions</td>
            </tr>
            <tr
              v-for="(i, index) in documentTemplates"
              :key="index"
              :class="{'warning': !i.valid}">
              <td>
                <div
                  class="image-placeholder-block">
                  <div
                    v-if="!i.image"
                    class="image-placeholder">
                    <i class="icon-no-image"/>
                  </div>
                  <div
                    v-else
                    class="image-real">
                    <img
                      src="../../../../static/img/misc/mr-doc.png"
                      alt="Market Radar Document" >
                  </div>
                </div>
              </td>
              <td>
                {{ i.title }}
              </td>
              <td class="break-word">{{ i.docType }}</td>
              <td class="break-word">{{ i.templateType }}</td>
              <td>{{ i.lastChange }}</td>
              <td>
                <span v-if="i.valid">Yes</span>
                <span v-else>No</span>
                <div
                  v-if="!i.valid"
                  class="btn-group">
                  <button
                    class="btn btn-xs btn-warning dropdown-toggle"
                    data-toggle="dropdown"
                    type="button">
                    <i class="fa fa-question" />
                  </button>
                  <ul
                    class="dropdown-menu dropdown-menu-right"
                    @click.stop>
                    <li class="font-s12 padding-10">
                      <strong>Missing fields:</strong> MaxPrice, MinPrice, NumberOfRooms.
                    </li>
                  </ul>
                </div>
              </td>
              <td class="text-right padding-l-0">
                <input
                  id="uploadTemplate"
                  type="file"
                  class="inputfile-hidden">
                <div class="btn-group">
                  <label
                    v-tooltip.top="{ content: 'Reupload Template', delay: { show: 700, hide: 100 }}"
                    for="uploadTemplate"
                    class="btn btn-sm btn-default"><i class="fa fa-upload" /></label>
                  <button
                    v-tooltip.top="{ content: 'Delete', delay: { show: 700, hide: 100 }}"
                    type="button"
                    class="btn btn-sm btn-default"><i class="fa fa-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="templateTabs['email']"
        class="section-content">
        No templates yet. Add one using the Upload form.
      </div>
    </div>
  </div>
</template>
