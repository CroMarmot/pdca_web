export const strict = process.env.NODE_ENV !== 'production'

export const state = () => ({
  counter: 0
})

export const mutations = {
  increment(state) {
    state.counter++
  }
}
