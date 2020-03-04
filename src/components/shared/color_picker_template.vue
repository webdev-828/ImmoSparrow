<template>
  <div class="m">
    <div
      :style="style"
      class="mouse-pointer w30h30"
      @click="showAllColors ? showAllColors =false:showAllColors =true"/>
    <div
      v-bar
      v-if="showAllColors"
      class="w30">
      <div>
        <div
          v-for="e in get_color('red')"
          :key="e"
          :style="get_style(e)"
          class="pull-right"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('pink')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          style="float: left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('purple')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('deeppurple')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('indigo')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('blue')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('lightblue')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('cyan')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('teal')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('green')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('lightgreen')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('lime')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('yellow')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('amber')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('orange')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('deeporange')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('brown')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('grey')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
        <div
          v-for="e in get_color('bluegrey')"
          :key="e"
          :style="get_style(e)"
          class="pull-left"
          @click="setColor(e)"/>
      </div>
    </div>
  </div>
</template>
