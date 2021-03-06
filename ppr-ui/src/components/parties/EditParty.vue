<template>
  <div id="edit-party" class="white pa-6">
    <v-expand-transition>
      <v-row no-gutters>
        <v-col cols="3">
          <label
            class="add-party-header generic-label ml"
            :class="{ 'error-text': invalidSection }"
          >
            <span v-if="activeIndex === -1" class="">Add</span>
            <span v-else>Edit</span>
            Secured Party
          </label>
        </v-col>
        <v-col cols="9">
          <v-form
            ref="partyForm"
            class="party-form"
            v-on:submit.prevent="addParty"
          >
            <v-row class="pb-6" no-gutters>
              <v-col cols="12">
                <v-radio-group v-model="partyBusiness" class="mt-0" row hide-details="true">
                  <v-radio
                    :class="[
                      'individual-radio',
                      $style['party-radio-individual'],
                    ]"
                    label="Individual Person"
                    value="I"
                  >
                  </v-radio>

                  <v-radio
                    :class="['business-radio', $style['party-radio-business']]"
                    label="Business"
                    value="B"
                  >
                  </v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters v-if="isPartyType">
              <v-col cols="12">
                <v-row v-if="partyBusiness === 'B'" no-gutters class="pb-4">
                  <v-col>
                    <label class="generic-label">Business Name</label>
                  </v-col>
                </v-row>
                <v-row v-else no-gutters class="pb-4">
                  <v-col>
                    <label class="generic-label">Person's Name</label>
                  </v-col>
                </v-row>
                <v-row v-if="partyBusiness === 'B'" no-gutters>
                  <v-col>
                    <v-text-field
                      filled
                      id="txt-name"
                      label="Business Legal Name"
                      v-model="searchValue"
                      :error-messages="
                        errors.businessName.message
                          ? errors.businessName.message
                          : ''
                      "
                      persistent-hint
                    />
                    <auto-complete
                      :searchValue="autoCompleteSearchValue"
                      :setAutoCompleteIsActive="autoCompleteIsActive"
                      @search-value="setSearchValue"
                      @hide-details="setHideDetails"
                    >
                    </auto-complete>
                  </v-col>
                </v-row>
                <v-row v-else no-gutters>
                  <v-col cols="4" class="pr-4">
                    <v-text-field
                      filled
                      label="First Name"
                      id="txt-first"
                      v-model="currentSecuredParty.personName.first"
                      persistent-hint
                      @blur="onBlur('first')"
                      :error-messages="
                        errors.first.message ? errors.first.message : ''
                      "
                    />
                  </v-col>
                  <v-col cols="4" class="pr-4">
                    <v-text-field
                      filled
                      label="Middle Name (Optional)"
                      id="txt-middle"
                      v-model="currentSecuredParty.personName.middle"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      filled
                      label="Last Name"
                      id="txt-last"
                      v-model="currentSecuredParty.personName.last"
                      persistent-hint
                      @blur="onBlur('last')"
                      :error-messages="
                        errors.last.message ? errors.last.message : ''
                      "
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters class="pb-4">
                  <v-col>
                    <label class="generic-label">Email Address</label>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      filled
                      id="txt-email"
                      label="Email Address"
                      v-model="currentSecuredParty.emailAddress"
                      :error-messages="
                        errors.emailAddress.message
                          ? errors.emailAddress.message
                          : ''
                      "
                      @blur="onBlur('emailAddress')"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters class="pb-4">
                  <v-col>
                    <label class="generic-label">Address</label>
                  </v-col>
                </v-row>
                <base-address
                  ref="regMailingAddress"
                  id="address-secured-party"
                  v-model="currentSecuredParty.address"
                  :editing="true"
                  :schema="addressSchema"
                  @valid="updateValidity($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="form__row form__btns">
                  <v-btn
                    large
                    outlined
                    color="error"
                    :disabled="activeIndex === -1"
                    @click="removeParty()"
                    id="remove-btn"
                    >Remove
                  </v-btn>

                  <v-btn
                    large
                    id="done-btn"
                    class="ml-auto"
                    color="primary"
                    :disabled="!isPartyType"
                    @click="onSubmitForm()"
                  >
                    Done
                  </v-btn>

                  <v-btn
                    id="cancel-btn"
                    large
                    outlined
                    color="primary"
                    @click="resetFormAndData(true)"
                  >
                    Cancel
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  computed,
  watch
} from '@vue/composition-api'
import BaseAddress from '@/composables/address/BaseAddress.vue'
import { useSecuredPartyValidation } from './composables/useSecuredPartyValidation'
import { useSecuredParty } from './composables/useSecuredParty'
import AutoComplete from '@/components/search/AutoComplete.vue'

export default defineComponent({
  components: {
    BaseAddress,
    AutoComplete
  },
  props: {
    activeIndex: {
      type: Number,
      default: -1
    },
    invalidSection: {
      type: Boolean,
      default: false
    }
  },
  emits: ['addEditParty', 'resetEvent'],
  setup (props, context) {
    const {
      currentSecuredParty,
      currentIsBusiness,
      getSecuredParty,
      resetFormAndData,
      removeSecuredParty,
      addSecuredParty,
      updateAddress,
      addressSchema
    } = useSecuredParty(props, context)

    const {
      errors,
      updateValidity,
      validateSecuredPartyForm,
      validateInput
    } = useSecuredPartyValidation()

    const localState = reactive({
      autoCompleteIsActive: true,
      autoCompleteSearchValue: '',
      partyBusiness: '',
      searchValue: '',
      hideDetails: false,
      isPartyType: computed((): boolean => {
        if (localState.partyBusiness === '') {
          return false
        }
        return true
      })
    })

    const onBlur = fieldname => {
      validateInput(fieldname, currentSecuredParty.value[fieldname])
    }

    const onSubmitForm = async () => {
      if (
        validateSecuredPartyForm(
          localState.partyBusiness,
          currentSecuredParty
        ) === true
      ) {
        addSecuredParty()
      }
    }

    const getPartyBusiness = () => {
      const businessValue = currentIsBusiness.value
      if (businessValue !== null) {
        localState.partyBusiness = 'I'
        if (businessValue) {
          localState.partyBusiness = 'B'
        }
      }
    }

    const setSearchValue = (searchValueTyped: string) => {
      localState.autoCompleteIsActive = false
      localState.searchValue = searchValueTyped
      currentSecuredParty.value.businessName = searchValueTyped
    }

    const setHideDetails = (hideDetails: boolean) => {
      localState.hideDetails = hideDetails
    }

    watch(
      () => localState.partyBusiness,
      currentValue => {
        if (currentValue === 'I') {
          currentSecuredParty.value.businessName = ''
        } else {
          currentSecuredParty.value.personName.first = ''
          currentSecuredParty.value.personName.middle = ''
          currentSecuredParty.value.personName.last = ''
        }
      }
    )

    watch(
      () => localState.searchValue,
      (val: string) => {
        localState.autoCompleteSearchValue = val
        // show autocomplete results when there is a searchValue
        localState.autoCompleteIsActive = val !== ''
        currentSecuredParty.value.businessName = val
      }
    )

    onMounted(() => {
      getSecuredParty()
      getPartyBusiness()
    })

    return {
      currentSecuredParty,
      currentIsBusiness,
      resetFormAndData,
      removeSecuredParty,
      onSubmitForm,
      onBlur,
      addressSchema,
      updateAddress,
      updateValidity,
      setSearchValue,
      setHideDetails,
      errors,
      ...toRefs(localState)
    }
  }
})
</script>

<style lang="scss" module>
@import '@/assets/styles/theme.scss';
.party-radio-business {
  width: 50%;
  background-color: rgba(0, 0, 0, 0.06);
  height: 60px;
  padding: 10px;
  margin-right: 0px !important;
}
.party-radio-individual {
  width: 47%;
  margin-right: 20px !important;
  background-color: rgba(0, 0, 0, 0.06);
  height: 60px;
  padding: 10px;
}
</style>
