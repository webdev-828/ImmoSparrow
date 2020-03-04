<template>
  <div class="v-input-number">
    <input
      :maxlength="maxlength"
      :placeholder="placeholder"
      v-model="quantity"
      :name="name"
      :ref="refs"
      type="text"
      autocomplete="off"
      @keyup="onKeyup($event)"
      @keydown="onKeydown"
      @blur="onBlur"
      @paste="onPaste"
    > <span v-if="issq">m<sup>2</sup></span>
  </div>
</template>

<script>
export default {
  props: {
    nextInput: {
      type: String,
      default: ''
    },
    req: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    dval: {
      type: String,
      default: ''
    },
    step: {
      type: Number,
      default: 1
    },
    integer: {
      type: Boolean,
      default: false
    },
    mousedown: {
      type: Boolean,
      default: false
    },
    keydown: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    refs: {
      type: Boolean,
      default: false
    },
    issq: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: 4
    }

  },
  data () {
    return {
      clicked: false,
      interval: 0,
      timeout: 0,
      quantity: 0,
      oldValue: 0,
      isKeydown: false
    }
  },
  watch: {
    placeholder: function () {
      this.quantity = !this.placeholder ? this.min : null
    },
    quantity: function () {
      this.evaluateQuantity()
    },
    min: function (val) {
      if (this.quantity < val) {
        this.quantity = val
      }
    },
    max: function (val) {
      this.quantity = this.quantity > val ? val : this.min
    }
  },
  mounted () {
    this.emitChange(true)
  },
  created () {
    this.$root.$on('resetInputNumberFields', () => {
      this.quantity = 0
    })
  },
  methods: {
    onPaste (e) {
      e.preventDefault()
      let curVal = e.clipboardData.getData('Text')
      let prevVal = this.quantity.toString()
      curVal = curVal.replace(/[^0-9]+/g, '')
      const posStart = this.$refs[this.refs].selectionStart
      const posEnd = this.$refs[this.refs].selectionEnd
      curVal = prevVal.slice(0, posStart) + curVal + prevVal.slice(posStart !== posEnd ? posEnd : posStart)
      this.quantity = curVal >= this.maxlength ? curVal.substr(0, this.maxlength) : curVal
    },
    /* emitChange (init = false) {
      this.oldValue = this.quantity
      if (!this.quantity) {
        this.quantity = this.dval
      }
      if (this.quantity !== '') {
        this.$emit('onInputNumberChange', this.quantity, init)
      }
      if (this.quantity < this.min || this.quantity > this.max) {
        this.$emit('invalidInput', {
          name: this.name,
          val: true,
          message: 'Number not in range: ' + ' ' + this.min + ' - ' + this.max
        })
      } else {
        this.$emit('invalidInput', {
          name: this.name,
          val: false
        })
      }
    }, */
    emitChange (init = false) {
      this.oldValue = this.quantity
      if (!this.quantity) {
        this.quantity = this.dval
      }
      this.$emit('onInputNumberChange', this.quantity, init)
      if ((this.quantity < this.min || this.quantity > this.max) && this.quantity !== '') {
        let msg = 'Field is out of range'
        if (this.min === 1800) {
          msg = 'Out of range (only between 1890-2019)'
        }
        this.$emit('invalidInput', {
          name: this.name,
          val: true,
          msg: msg
        })
      } else {
        this.$emit('invalidInput', {
          name: this.name,
          val: false,
          msg: ' '
        })
      }
    },
    increment () {
      if (!this.quantity) {
        this.quantity = this.min
      } else {
        this.quantity = this.quantity < this.max ? this.quantity + this.step : this.max
      }
    },
    decrement () {
      if (!this.quantity) {
        this.quantity = this.min
      } else {
        this.quantity = this.quantity > this.min ? this.quantity - this.step : this.min
      }
    },
    onBlur () {
    },
    onReset () {
      this.quantity = 0
    },
    onClick (e, dir) {
      this.clicked = true
      if (dir === 'up') this.increment()
      if (dir === 'down') this.decrement()
      this.onMouseup()
    },
    evaluateQuantity () {
      // if (this.isKeydown) return
      // if (!this.placeholder && this.quantity.toString().length > 0 && this.quantity !== this.oldValue) {
      if (!this.placeholder) {
        let d = this.quantity.toString()
        if (d.indexOf(',') > -1) {
          d = d.replace(',', '.')
          this.quantity = d
        }
        if (d.indexOf('.') > -1) {
          if ((this.quantity % 1) !== 0.5 && (this.quantity % 1) !== 0) {
            this.quantity = this.quantity - (this.quantity % 1) + 0.5
          }
        }
        this.emitChange()
      }
    },
    onKeyup (e) {
      this.isKeydown = false
      this.evaluateQuantity()
    },
    onKeydown (e) {
      if (e.keyCode === 13) {
        if (this.nextInput) {
          if (this.nextInput === 'submit') {
            console.log(e)
            return
          }
          if (this.$parent.$refs[this.nextInput]) {
            this.$parent.$refs[this.nextInput].$refs['false'].focus()
            this.$parent.$refs[this.nextInput].$refs['false'].select()
          } else {
            this.$parent.$emit('currentFiled', this)
            return
          }

          // this.$parent.$emit('nextFiled', this.$parent.$refs[this.nextInput])
          this.$parent.$emit('currentFiled', this)
        }
        e.preventDefault()
      }
      this.isKeydown = true
      if (!this.keydown) {
        e.preventDefault()
        return
      }
      // Allow dot key for decimals:
      if (e.keyCode === 110 || e.keyCode === 190 || e.keyCode === 188) {
        if (this.integer) {
          e.preventDefault()
          return
        } else {
          if (!this.quantity.toString().match(/./g) || this.quantity.toString().match(/./g).length > 2) {
            e.preventDefault()
            return
          }
        }
      }
      // Allow these keys only:
      if (
        // backspace, delete, tab, escape, enter, dot, comma
        [46, 8, 9, 27, 13, 110, 190, 188].indexOf(e.keyCode) >= 0 ||
        // Ctrl/cmd+A
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        // Ctrl/cmd+C
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        // Ctrl/cmd+R
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        // Ctrl/cmd+V
        (e.keyCode === 82 && (e.ctrlKey || e.metaKey)) ||
        // Ctrl/cmd+X
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        // home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return
      }
      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    }
  }
}
</script>
