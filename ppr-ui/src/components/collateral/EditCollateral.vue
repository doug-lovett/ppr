<template>
  <div id="edit-vehicle" class="white py-8 pr-6">
    <v-expand-transition>
      <v-row no-gutters>
        <v-col cols="3">
            <label
              class="add-vehicle-header generic-label"
              :class="{ 'error-text': invalidSection }"
            >
              <span v-if="activeIndex === -1" class="pl-4"> Add Vehicle </span>
              <span v-else class="ml-n3">Edit Vehicle</span>
            </label>
        </v-col>
        <v-col cols="9">
              <v-form
                ref="vehicleForm"
                class="vehicle-form"
                v-on:submit.prevent="addVehicle"
              >
                <v-row no-gutters>
                    <v-col>
                      <v-select
                        :items="vehicleTypes"
                        filled
                        label="Vehicle Type"
                        v-model="currentVehicle.type"
                        id="txt-type"
                        :error-messages="errors.type.message ? errors.type.message : ''"
                      >
                        <template slot="item" slot-scope="data">
                          <span class="list-item">
                            {{ data.item.text }}
                          </span>
                        </template>
                      </v-select>
                    </v-col>
                </v-row>
                <v-row no-gutters v-if="currentVehicle.type === 'MH'">
                  <v-col>
                    <v-text-field
                      filled
                      id="txt-man"
                      label="Manufactured Home Registration Number"
                      v-model="currentVehicle.manufacturedHomeRegistrationNumber"
                      :error-messages="errors.manufacturedHomeRegistrationNumber.message ?
                      errors.manufacturedHomeRegistrationNumber.message : ''"
                      @keyup="onBlur('manufacturedHomeRegistrationNumber')"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      filled
                      :label="getSerialLabel"
                      :disabled="getSerialDisabled"
                      id="txt-serial"
                      v-model="currentVehicle.serialNumber"
                      :error-messages="errors.serialNumber.message ? errors.serialNumber.message : ''"
                      @keyup="onBlur('serialNumber')"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <v-text-field
                      filled
                      label="Year (Optional)"
                      id="txt-years"
                      v-model="currentVehicle.year"
                      @blur="onBlur('year')"
                      hint="YYYY"
                      persistent-hint
                      :error-messages="errors.year.message ? errors.year.message : ''"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      filled
                      label="Make"
                      id="txt-make"
                      v-model="currentVehicle.make"
                      persistent-hint
                      @blur="onBlur('make')"
                      :error-messages="errors.make.message ? errors.make.message : ''"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      filled
                      label="Model"
                      id="txt-model"
                      v-model="currentVehicle.model"
                      @blur="onBlur('model')"
                      persistent-hint
                      :error-messages="errors.model.message ? errors.model.message : ''"
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
                      @click="removeVehicle()"
                      id="remove-btn"
                      >Remove
                    </v-btn>

                    <v-btn
                      large
                      id="done-btn"
                      class="ml-auto"
                      color="primary"
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
  onMounted
} from '@vue/composition-api'

import { useCollateralValidation } from './composables/useCollateralValidation'
import { useVehicle } from './composables/useVehicle'

export default defineComponent({
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
  emits: ['addEditVehicle', 'resetEvent'],
  setup (props, context) {
    const {
      // @ts-ignore - returned by toRef
      currentVehicle,
      // @ts-ignore - returned by toRef
      vehicleTypes,
      // @ts-ignore - returned by toRef
      getSerialLabel,
      // @ts-ignore - returned by toRef
      getSerialDisabled,
      getVehicle,
      resetFormAndData,
      removeVehicle,
      addVehicle
    } = useVehicle(props, context)
    const { errors, validateInput, validateSerial, validateCollateralForm } = useCollateralValidation()
    onMounted(getVehicle)

    const onSubmitForm = async () => {
      const isValid = await validateCollateralForm(currentVehicle.value)
      if (!isValid) {
        return
      }

      addVehicle()
    }

    const onBlur = (fieldname) => {
      if (fieldname === 'serialNumber') {
        validateSerial(currentVehicle.value)
      } else {
        validateInput(fieldname, currentVehicle.value[fieldname])
      }
    }

    return {
      onSubmitForm,
      resetFormAndData,
      removeVehicle,
      onBlur,
      errors,
      currentVehicle,
      vehicleTypes,
      getSerialLabel,
      getSerialDisabled
    }
  }
})
</script>

<style lang="scss" module>
@import "@/assets/styles/theme.scss";

</style>
