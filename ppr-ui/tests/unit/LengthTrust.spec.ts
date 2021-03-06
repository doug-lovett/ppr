// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import { getVuexStore } from '@/store'
import { shallowMount, createLocalVue } from '@vue/test-utils'

// Components
import { LengthTrust } from '@/views'
import { ButtonFooter, RegistrationFee, Stepper } from '@/components/common'
import { RegistrationLengthTrust } from '@/components/registration'

// Other
import mockRouter from './MockRouter'
import { RouteNames } from '@/enums'

Vue.use(Vuetify)

const vuetify = new Vuetify({})
const store = getVuexStore()

// Input field selectors / buttons
const cancelBtn: string = '#reg-cancel-btn'
const saveBtn: string = '#reg-save-btn'
const saveResumeBtn: string = '#reg-save-resume-btn'
const backBtn: string = '#reg-back-btn'
const nextBtn: string = '#reg-next-btn'

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('Length and Trust Indenture new registration component', () => {
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
    await router.push({ name: 'length-trust' })
    wrapper = shallowMount(LengthTrust, { localVue, store, router, vuetify })
  })

  afterEach(() => {
    window.location.assign = assign
    wrapper.destroy()
  })

  it('renders Length Trust View with child components', () => {
    expect(wrapper.findComponent(LengthTrust).exists()).toBe(true)
    expect(wrapper.findComponent(Stepper).exists()).toBe(true)
    expect(wrapper.findComponent(RegistrationFee).exists()).toBe(true)
    expect(wrapper.findComponent(ButtonFooter).exists()).toBe(true)
    expect(wrapper.findComponent(RegistrationLengthTrust).exists()).toBe(true)
  })
})
