<template>
  <div>
    <div>{{ plan_date }}</div>
    <div>
      <template v-for="item in list">
        <input v-model="item.startTime" />
        <input v-model="item.endTime" />
        <input v-model="item.startTime" />
        <input v-model="item.endTime" />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Daily',
  data() {
    return {
      plan_date: '123',
      list: []
    }
  }
}
</script>

<style scoped></style>
