<template>
  <div>
    <Foo :foo="foo" />
    <Bar>{{ bar }}</Bar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data: {
    foo: 10,
    bar: 20,
  },
});
</script>
