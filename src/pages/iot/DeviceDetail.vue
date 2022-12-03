<template>
  <van-col style="flex: 1; overflow-y: auto; overflow-x: hidden;" justify="center" align="center">
    <van-cell-group>
      <van-cell :title="$t('iot.device.name')" :title-style="{ maxWidth: '80px', textAlign: 'right' }" center>
        <template #value>
          <div class="van-ellipsis">{{ curDevice?.deviceId }}</div>
        </template>
        <template #right-icon>
          <van-switch v-model="isSubscribe" size="24px" style="margin-left: 5px;">
            <template #node>
              <div class="icon-wrapper">
                <van-icon size="24" class="iconfont"
                  v-bind:class="isSubscribe ? 'icon-subscribed' : 'icon-subscribe'" />
              </div>
            </template>
          </van-switch>
        </template>
      </van-cell>

      <van-collapse v-model="showSearch" accordion>
        <van-collapse-item name="1" center :title="$t('iot.device.company')"
          :title-style="{ maxWidth: '80px', textAlign: 'right' }">
          <template #value>
            <div style="text-align: right;">
              <van-tag v-if="curCompany" size="large" closeable>{{ curCompany?.name }}</van-tag>
            </div>
          </template>
          <van-search v-model="searchKey">
            <template #action>
              <div @click="">搜索</div>
            </template>
          </van-search>
          <van-list style="max-height: 200px;">
            <van-cell v-for="company in companies" :title="company.name" :value="company.ownerName" is-link
              @click="onCompanySelected(company)"></van-cell>
          </van-list>
        </van-collapse-item>
      </van-collapse>

      <van-collapse v-model="showMap" accordion>
        <van-collapse-item name="1" center :title="$t('iot.device.address')"
          :title-style="{ maxWidth: '80px', textAlign: 'right' }">
          <template #value>
            <div class="van-ellipsis" style="margin-left: 15px; text-align: right;">
              {{ curDevice?.address }}
            </div>
          </template>
          <amap-viewer v-if="curDevice" style="height: 300px;" v-model:lng="curDevice.lng"
            v-model:lat="curDevice.lat" v-model:address="curDevice.address" />
          <van-button type="success" :loading="updating" @click="updateDeviceInfo" :text="$t('common.done')"
            style="width: 100%; margin: 15px 0;" />
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>

    <van-row style="padding: 15px 0;" justify="center">
      <div ref="echartsElectric" class="chart-container" />
      <div ref="echartsTemperature" class="chart-container" />
      <div ref="echartsHumidity" class="chart-container" />
    </van-row>


  </van-col>
</template>

<script lang="ts" setup>
import { BarChart, BarSeriesOption, GaugeChart, GaugeSeriesOption, LineChart, LineSeriesOption } from 'echarts/charts'
import {
  DatasetComponent, DatasetComponentOption,
  GridComponent, GridComponentOption,
  LegendComponent, LegendComponentOption,
  TitleComponent, TitleComponentOption,
  TooltipComponent, TooltipComponentOption,
  TransformComponent
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { Notify } from 'vant'
import { onMounted, ref, watch, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { IOT, IOTApi } from '../../models'
import { useCommonStore } from '../../store'
import { useIOTDeviceStore } from '../../store/IOTDevices'
import AmapViewer from '../components/AmapViewer.vue'
import Company from './Company.vue'


type ECOption = echarts.ComposeOption<BarSeriesOption | LineSeriesOption | TitleComponentOption | TooltipComponentOption | GridComponentOption | DatasetComponentOption | LegendComponentOption | GaugeSeriesOption>

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  GaugeChart,
  UniversalTransition,
  CanvasRenderer,
])

const props = defineProps<{
  device: IOT.Device
}>()
// const AmapViewer = defineAsyncComponent(() => import('../components/AmapViewer.vue'))
const route = useRoute()

const echartsElectric = ref()
const echartsTemperature = ref()
const echartsHumidity = ref()

const isSubscribe = ref(false)
const curDevice = ref<IOT.Device>(null)
const curCompany = ref<IOT.Company>(null)

const updating = ref(false)
const showMap = ref(null)
const showSearch = ref(null)
const searchKey = ref('')
const companies = ref<Array<IOT.Company>>([])

let electricOpts: any = {}
let electricChart: echarts.ECharts = null

let tempOpts: any = {}
let tempChart: echarts.ECharts = null

let humidityOpts: any = {}
let humidityChart: echarts.ECharts = null

const deviceStore = useIOTDeviceStore()
const commonStore = useCommonStore()
const i18n = useI18n()

onMounted(async () => {

  commonStore.navbar.title = i18n.t('iot.device.title')
  curDevice.value = props.device

  initElectric()
  initTemperature()
  initHumidity()
  initDeviceInfo()
})

watch(searchKey, async () => {
  companies.value = await IOTApi.searchCompany(searchKey.value)
})


watch(isSubscribe, () => {
  if (curDevice.value != null) {
    if (isSubscribe.value) {
      commonStore.deviceTmpSubscribe(curDevice.value.deviceId)
    } else {
      commonStore.deviceTmpUnsubscribe(curDevice.value.deviceId)
    }
  }
})

watch(() => deviceStore.temperature, () => {
  updateData()
})

watch(() => props.device, () => {
  initDeviceInfo()
})

async function initDeviceInfo() {
  curDevice.value = props.device
  if (curDevice.value != null && curDevice.value.cid != null) {
    curCompany.value = await IOTApi.getCompany(curDevice.value.cid)
  }
}

function initElectric() {
  electricOpts = {
    title: {
      text: '电机',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    legend: {
      data: ['电流', '电压',]
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '-/mA',
      },
      {
        type: 'value',
        name: '-/V',
      }
    ],
    series: [
      {
        name: '电流',
        type: 'line',
        color: ["#eb9f0d"],
        smooth: true,
        data: []
      },
      {
        name: '电压',
        type: 'line',
        color: ["#969ac7"],
        smooth: true,
        yAxisIndex: 1,
        data: []
      }
    ]
  }

  electricChart = echarts.init(echartsElectric.value)
  electricChart.setOption(electricOpts)
}

function initTemperature() {
  tempOpts = {
    title: {
      text: '温度',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      containLabel: true
    },
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        itemStyle: {
          color: '#FD7347'
        },
        progress: {
          show: true,
          width: 8
        },
        pointer: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          show: false
        },
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        splitNumber: 12,
        itemStyle: {
          color: '#FFAB9155'
        },
        progress: {
          show: true,
          width: 30
        },

        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 30
          }
        },
        axisTick: {
          distance: -45,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        splitLine: {
          distance: -52,
          length: 14,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -8,
          color: '#999',
          fontSize: 12
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '50%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 16,
          fontWeight: 'bolder',
          formatter: '{value} °C',
          color: 'inherit'
        },
      },
    ]
  }
  tempChart = echarts.init(echartsTemperature.value)
  tempChart.setOption(tempOpts)
}

function initHumidity() {
  humidityOpts = {
    title: {
      text: '湿度',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
    },
    series: {
      type: 'line',
      smooth: true,
      data: []
    }

  }

  humidityChart = echarts.init(echartsHumidity.value)
  humidityChart.setOption(humidityOpts)
}

async function onCompanySelected(company: IOT.Company) {
  curDevice.value.cid = company._id
  curCompany.value = company
  showSearch.value = null
  updateDeviceInfo()
}

async function updateDeviceInfo() {
  updating.value = true
  await IOTApi.updateDevice(curDevice.value)
  updating.value = false
  showMap.value = null
}

function updateData() {
  if (tempOpts.series[0].data == null) {
    tempOpts.series[1].data = [{ value: deviceStore.temperature }]
  } else {
    tempOpts.series[1].data = tempOpts.series[0].data
  }
  tempOpts.series[0].data = [{ value: deviceStore.temperature }]
  tempChart.setOption(tempOpts)


  electricOpts.xAxis.data = deviceStore.xAxisLabel
  electricOpts.series[0].data = deviceStore.voltageData
  electricOpts.series[1].data = deviceStore.electricData
  electricChart.setOption(electricOpts)

  humidityOpts.xAxis.data = deviceStore.xAxisLabel
  humidityOpts.series.data = deviceStore.humidityData
  humidityChart.setOption(humidityOpts)
}

</script>
<style scoped>
.device-status {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: green;
}

.chart-container {
  width: calc(33% - 20px);
  min-width: 300px;
  height: 260px;
  margin-left: 15px;
}

.icon-wrapper {
  display: flex;
  width: 100%;
  justify-content: center;
}

.icon-subscribe {
  line-height: 24px;
  color: var(--van-gray-5);
}

.icon-subscribed {
  line-height: 24px;
  color: var(--van-blue);
}
</style>