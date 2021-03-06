<template>
  <v-container fluid no-gutters class="white px-0 py-6">
    <v-row class="px-6" align="center">
      <v-col cols="6">
        <v-text-field
          filled
          label="Secured Party Code or Name"
          id="txt-code"
          :hide-details="true"
          v-model="searchValue"
          persistent-hint
          :disabled="autoCompleteDisabled"
        />
        <v-card
          v-if="showAutoComplete"
          id="party-search-auto-complete"
          :class="['mt-1', $style['auto-complete-card']]"
          elevation="5"
        >
          <v-row no-gutters justify="end" :class="$style['close-btn-row']">
            <v-col cols="auto" justify="end" class="pt-0">
              <v-btn
                append
                icon
                x-small
                right
                :id="$style['auto-complete-close-btn']"
                class="auto-complete-close-btn"
                @click="closeAutoComplete()"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" class="pl-2 pr-5">
            <v-col no-gutters cols="auto">
              <v-list class="pt-0">
                <v-list-item-group v-model="autoCompleteSelected">
                  <v-list-item
                    v-for="(result, i) in autoCompleteResults"
                    :key="i"
                    :class="[
                      'pt-0',
                      'pb-0',
                      'pl-1',
                      $style['auto-complete-item'],
                    ]"
                  >
                    <v-list-item-content class="pt-2 pb-2">
                      <v-list-item-subtitle>
                        <v-row :class="$style['auto-complete-row']">
                          <v-col cols="2">{{ result.code }}</v-col>
                          <v-col cols="9"
                            >{{ result.businessName }}<br />
                            {{ result.address.street }},
                            {{ result.address.city }}
                            {{ result.address.region }}
                            {{ result.address.country }},
                            {{ result.address.postalCode }}
                          </v-col>
                        </v-row>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action
                      :class="$style['auto-complete-action']"
                      class="mt-n1"
                    >
                      <span
                        v-if="!resultAdded[i]"
                        @click="addResult(result, i)"
                      >
                        <v-icon>mdi-plus</v-icon>Add
                      </span>
                      <span class="auto-complete-added" v-else>
                        <v-icon class="auto-complete-added">mdi-check</v-icon
                        >Added
                      </span>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="6" :class="{ 'disabled-text': autoCompleteDisabled }">
        or
        <a
          id="add-party"
          class="generic-link"
          :class="{ 'disabled-text': autoCompleteDisabled }"
          @click="goToAddSecuredParty"
          :disabled="autoCompleteDisabled"
          >Add a Secured Party that doesn't have a code</a
        >
      </v-col>
    </v-row>
    <v-row class="px-6" align="center">
      <v-col cols="auto">
        <v-checkbox
          id="add-registering-party"
          class="reg-checkbox pa-0 ma-0"
          @click="addRegisteringParty"
          v-model="registeringPartySelected"
          :hide-details="true"
          :disabled="autoCompleteDisabled"
        >
        </v-checkbox>
      </v-col>
      <v-col :class="{ 'disabled-text': autoCompleteDisabled }">
        Include the registering party as a secured party
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  computed
} from '@vue/composition-api'
import { useGetters, useActions } from 'vuex-composition-helpers'
import { partyCodeSearch } from '@/utils'
import { SearchPartyIF, PartyIF } from '@/interfaces' // eslint-disable-line no-unused-vars

export default defineComponent({
  props: {
    isAutoCompleteDisabled: {
      type: Boolean,
      default: false
    },
    registeringPartyAdded: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'showSecuredPartyAdd',
    'addRegisteringParty',
    'removeRegisteringParty'
  ],
  setup (props, context) {
    const { setAddSecuredPartiesAndDebtors } = useActions<any>([
      'setAddSecuredPartiesAndDebtors'
    ])
    const { getAddSecuredPartiesAndDebtors } = useGetters<any>([
      'getAddSecuredPartiesAndDebtors'
    ])
    const localState = reactive({
      searchValue: '',
      autoCompleteIsActive: false,
      autoCompleteSelected: -1,
      autoCompleteResults: [],
      autoCompleteDisabled: computed((): boolean => {
        return props.isAutoCompleteDisabled
      }),
      registeringPartySelected: false,
      resultAdded: [],
      partyCode: 0,
      showAutoComplete: computed((): boolean => {
        return (
          localState.autoCompleteResults?.length > 0 &&
          localState.autoCompleteIsActive
        )
      })
    })

    const goToAddSecuredParty = () => {
      context.emit('showSecuredPartyAdd')
    }

    const addRegisteringParty = () => {
      if (localState.registeringPartySelected) {
        context.emit('addRegisteringParty')
      } else {
        context.emit('removeRegisteringParty')
      }
    }

    const addResult = (party: SearchPartyIF, resultIndex) => {
      localState.resultAdded[resultIndex] = true
      const currentParties = getAddSecuredPartiesAndDebtors.value
      const newParty: PartyIF = {
        code: party.code,
        businessName: party.businessName,
        emailAddress: party.emailAddress,
        address: party.address
      }
      currentParties.securedParties.push(newParty)
      setAddSecuredPartiesAndDebtors(currentParties)
    }

    const closeAutoComplete = () => {
      localState.autoCompleteIsActive = false
      localState.resultAdded = []
    }

    const updateAutoCompleteResults = async (searchValue: string) => {
      const response: [SearchPartyIF] = await partyCodeSearch(searchValue)
      // check if results are still relevant before updating list
      if (response?.length > 0) {
        // will take up to 25 results
        localState.autoCompleteResults = response?.slice(0, 25)
      }
    }
    watch(
      () => localState.autoCompleteSelected,
      (val: number) => {
        if (val >= 0) {
          localState.partyCode = localState.autoCompleteResults[val]?.value
          // localState.autoCompleteIsActive = false
        }
      }
    )
    watch(
      () => localState.autoCompleteIsActive,
      (val: boolean) => {
        if (!val) localState.autoCompleteResults = []
      }
    )

    watch(
      () => localState.searchValue,
      (val: string) => {
        if (localState.searchValue.length >= 4) {
          updateAutoCompleteResults(val)
          localState.autoCompleteIsActive = true
        }
      }
    )
    watch(
      () => props.registeringPartyAdded,
      (sel: boolean) => {
        localState.registeringPartySelected = sel
      }
    )

    return {
      goToAddSecuredParty,
      addRegisteringParty,
      addResult,
      closeAutoComplete,
      ...toRefs(localState)
    }
  }
})
</script>

<style lang="scss" module>
@import '@/assets/styles/theme.scss';
#auto-complete-close-btn {
  color: $gray5 !important;
  background-color: transparent !important;
}
.auto-complete-item {
  min-height: 0;
}
.auto-complete-card {
  max-width: 60rem;
  position: absolute;
  z-index: 3;
}
.auto-complete-row {
  width: 35rem;
}
.auto-complete-action {
  width: 150px;
  flex-direction: row;
  justify-content: flex-end;
}
.close-btn-row {
  height: 1rem;
}
</style>
