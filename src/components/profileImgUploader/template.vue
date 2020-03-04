<template>
  <div>
    <div class="flex-line">
      <div
        v-if="imgData.uploadedImage"
        class="image-section margin-r-10">
        <div>
          <img
            :src="imgData.uploadedImage"
            class="uploadedImg"
            alt="uploaded image">
        </div>
        <!-- <div v-if="imgData.removedAvatar">
          <img :src="'../../../static/img/' + defaultAvatarLink" alt="Avatar" class="uploadedImg"/>
        </div> -->
      </div>
      <div class="section-stretch avatar-ch">
        <button
          v-if="imgData.uploadedImage"
          type="button"
          class="btn btn-xs btn-default lbl-btn margin-b-5"><label
            for="avatar"
            class="">Choose Another File</label></button>
        <button
          v-else
          type="button"
          class="btn btn-xs btn-default lbl-btn"><label
            for="avatar"
            class="">Choose File</label></button>
        <button
          v-tooltip="'Delete selected'"
          v-if="imgData.uploadedImage"
          class="btn btn-rounded btn-xs btn-default btn-close"
          type="button"
          @click="removeAvatar">
          <i class="fa fa-close"/>
        </button>
        <div
          v-if="imgData.uploadedImage"
          class="">
          <button
            class="btn btn-xs btn-success"
            type="submit">Upload</button>
        </div>
        <input
          v-validate="'size:1024|ext:jpeg,jpg,png'"
          id="avatar"
          ref="avatar"
          type="file"
          name="avatar"
          class="inputfile"
          @change="onFileChange">
        <div class="invalid-feedback" >
          {{ errors.first('avatar') }}
        </div>
      </div>
    </div>
    <div class="margin-t-10">
      <button
        v-tooltip.top="{ content: 'Delete Profile Picture', delay: { show: 700, hide: 100 }}"
        class="btn btn-xs btn-default"
        type="submit"
        @click="removeAvatar">
        <i class="fa fa-trash"/>
      </button>
    </div>
  </div>
</template>
