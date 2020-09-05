export const state = () => ({
  date2plan: {}
})

export const mutations = {
  updateDate2Plan(state, { date, plan }) {
    state.date2plan[date] = plan
  }
}
