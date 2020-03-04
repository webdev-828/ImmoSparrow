<template>
  <div class="section-content">
    <ul class="list list-selectable padding-top-5">
      <li
        class="no-hover no-overflow-hidden"
        @click.stop>
        <div class="">
          <div class="">
            <div>
              <div class="font-s13 font-w600">Name</div>
              <input
                ref="newPipe"
                v-model="pipeline.name"
                class="form-control input-sm"
                placeholder="New deal name">
            </div>
            <div class="margin-t-5">
              <div class="font-s13 font-w600">Assigned to</div>
              <div class="btn-group flex-group">
                <button
                  :disabled="editPipeId !== '' && pipeline.owner && (checkOwnerType(pipeline.owner.ownerType) === 'Agency' || checkOwnerType(pipeline.owner.ownerType) === 'Team')"
                  :class="{'active': pipeAssign['me']}"
                  class="btn btn-block btn-sm btn-default"
                  type="button"
                  @click="showPipeAssign('me')">Me</button>
                <button
                  :disabled="editPipeId !== '' && pipeline.owner && checkOwnerType(pipeline.owner.ownerType) === 'Agency'"
                  :class="{'active': pipeAssign['teams']}"
                  class="btn btn-block btn-sm btn-default margin-t-0"
                  type="button"
                  @click="showPipeAssign('teams')">Teams</button>
                <button
                  :class="{'active': pipeAssign['agency']}"
                  class="btn btn-block btn-sm btn-default margin-t-0"
                  type="button"
                  @click="showPipeAssign('agency')">Agency</button>
              </div>
              <div
                v-if="pipeAssign['teams']"
                class="margin-t-5">
                <div class="border-black-op">
                  <multiselect
                    v-model="selectedTeam"
                    :options="teams"
                    :show-labels="false"
                    :close-on-select="true"
                    label="name"
                    notranslate
                    class="multiselect-sm"
                    placeholder="Select a team"
                    track-by="id"
                    openDirection="bottom" />
                </div>
              </div>
            </div>
          </div>
          <div class="margin-t-10">
            <button
              v-if="editPipeId"
              :disabled="loading || !pipeline.name || (pipeAssign['teams'] && !selectedTeam)"
              type="button"
              class="btn btn-block btn-sm btn-success"
              @click.stop="updatePipe()">
              <i
                v-if="loading"
                class="fa fa-circle-o-notch fa-spin"/> Update
            </button>
            <button
              v-else
              :disabled="loading || !pipeline.name || (pipeAssign['teams'] && !selectedTeam)"
              type="button"
              class="btn btn-block btn-sm btn-success"
              @click.stop="createNewPipe()">
              <i
                v-if="loading"
                class="fa fa-circle-o-notch fa-spin"/> Add
            </button>
          </div>
          <div class="margin-t-10">
            <button
              type="button"
              class="btn btn-block btn-sm btn-default"
              @click.stop="closePipeDetails()">
              Cancel
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
