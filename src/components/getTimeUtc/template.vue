<template>
  <div
    v-if="publicationTimeUtc"
    style="display: inline-block">
    <span v-if="deletedTimeUtc">
      <var
        notranslate
        publicationTimeUtc>
        {{ getDuration(publicationTimeUtc, deletedTimeUtc) }}
      </var> days
    </span>
    <template v-else>
      <span v-if="getDuration(publicationTimeUtc) === 0">Since today</span>
      <span v-if="getDuration(publicationTimeUtc) === 1">Since yesterday</span>
      <span v-if="getDuration(publicationTimeUtc) > 1">
        <var
          notranslate
          publicationTimeUtc>
          {{ getDuration(publicationTimeUtc) }}
        </var> days
      </span>
    </template>
  </div>
</template>
