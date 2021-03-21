// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { getVuexStore } from '@/store'
import { shallowMount, createLocalVue } from '@vue/test-utils'

// Components
import { Dashboard } from '@/views'

// Other
import mockRouter from './MockRouter'
import { SearchBar } from '@/components/search'
import { mockedSearchResponse } from './test-data'
import { UISearchTypes } from '@/enums'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Dashboard component', () => {
  let wrapper: any
  const { assign } = window.location

  beforeEach(async () => {
    // mock the window.location.assign function
    delete window.location
    window.location = { assign: jest.fn() } as any

    // create a Local Vue and install router on it
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()
    await router.push({ name: 'dashboard' })
    wrapper = shallowMount(Dashboard, { localVue, store, router, vuetify })
  })

  afterEach(() => {
    window.location.assign = assign
    wrapper.destroy()
  })

  it('renders Dashboard View', () => {
    expect(wrapper.findComponent(Dashboard).exists()).toBe(true)
    expect(wrapper.findComponent(SearchBar).exists()).toBe(true)
  })
  it('routes to search after getting a search response', async () => {
    wrapper.vm.setSearchResults(mockedSearchResponse[UISearchTypes.SERIAL_NUMBER])
    await Vue.nextTick()
    expect(wrapper.vm.$route.name).toBe('search')
  })
})
