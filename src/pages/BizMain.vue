<template>
  <van-row class="full-row">
    <van-col style="height: 100%; background-color: #f1f1f1; z-index: 999;">
      <van-sidebar route v-model="active" style=" ">
        <van-sidebar-item replace to="/iot">
          <template #title>
            <van-icon class="iconfont icon-device" size="26" />
          </template>
        </van-sidebar-item>
        <van-sidebar-item replace to="/message" badge="5">
          <template #title>
            <van-icon class="iconfont icon-msg-read" size="26" />
          </template>
        </van-sidebar-item>
        <van-sidebar-item replace to="/mine">
          <template #title>
            <van-icon class="iconfont icon-mine" size="26" />
          </template>
        </van-sidebar-item>
      </van-sidebar>
    </van-col>
    <van-col style="flex: 1; width: calc(100vw - 55px);">
      <van-nav-bar class="animate__animated" v-bind:class="showNavbar ? 'animate__fadeInDown' : 'animate__fadeOutUp'"
        :title="commonStore.navbar.title" :left-arrow="commonStore.navbar.leftArrow" @click-left="back">
      </van-nav-bar>
      <router-view class="biz-content" v-bind:class="showNavbar ? 'move-down' : 'move-up'"
        v-bind:style="{ height: `calc(100vh - ${height}px)` }" v-slot="{ Component, route }">
        <transition :name="route.meta.animate">
          <keep-alive :include="['DeviceMgr', 'Mine']">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </van-col>

    <van-popup position="bottom" style="width: 100%; height: 560px; background-color: #f1f1f1;"
      v-model:show="commonStore.needLogin">
      <login />
    </van-popup>
    <debug-panel />
  </van-row>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommonStore } from '../store'
import DebugPanel from './components/DebugPanel.vue'
import Login from './user/Login.vue'

const commonStore = useCommonStore()
const active = ref(0)
const showTabbar = ref(true)
const showNavbar = ref(false)
const router = useRouter()
const height = ref(0)

let animate = null

onMounted(async () => {
  router.replace("/iot")
  active.value = 1
  await commonStore.init()
})

onUnmounted(() => {

})

window.addEventListener('popstate', (event) => {
  animate = null
})

router.beforeEach((to, from) => {
  showTabbar.value = to.meta.tabBar ? to.meta.tabBar : false
  showNavbar.value = to.meta.navBar ? to.meta.navBar : false

  commonStore.navbar.title = null
  commonStore.navbar.leftArrow = true
  commonStore.navbar.rightText = null

  commonStore.needLogin = to.meta.needAuth == true && commonStore.accessToken == null

  height.value = showNavbar.value ? 55 : 0

  return !commonStore.needLogin
})

router.afterEach((to, from) => {
  if (animate == null) {
    to.meta.animate = window.history.state.replaced ? null : 'slide-in'
  } else {
    to.meta.animate = animate
  }
})

function back() {
  animate = 'slide-out'
  router.back()
}

</script>

<style scoped>
.biz-content {
  width: calc(100vw - 55px);
  background: #f6f6f6;
  overflow-y: hidden;
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-in-enter-to {
  position: absolute;
  left: 55px;
}

.slide-in-enter-from {
  position: absolute;
  left: 100vw;
}

.slide-in-leave-to {
  position: absolute;
  left: -100vw;
}

.slide-in-leave-from {
  position: absolute;
  left: 55px;
}


.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-out-enter-to {
  position: absolute;
  left: 55px;
}

.slide-out-enter-from {
  position: absolute;
  left: -100%;
}

.slide-out-leave-to {
  position: absolute;
  left: 100%;
}

.slide-out-leave-from {
  position: absolute;
  left: 55px;
}

.move-up {
  transition: all 0.5s ease-in-out;
  position: absolute;
  top: 0;
}

.move-down {
  transition: all 0.5s ease-in-out;
  position: absolute;
  top: 55px;
}

@keyframes bounce-in {
  0% {
    opacity: 0.0;
  }

  100% {
    opacity: 1.;
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1.0;
  }

  100% {
    opacity: 0.0;
  }
}
</style>
