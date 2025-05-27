<template>

  <v-app>
    <!-- <v-navigation-drawer>
      
    </v-navigation-drawer> -->

    <v-app-bar app color="light-blue">
      <HeaderView />
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <AuthModal />
    <v-footer>
      <FooterView />
    </v-footer>
  </v-app>

</template>

<script setup>
import HeaderView from '@/views/HeaderView.vue'
import FooterView from '@/views/FooterView.vue'
import AuthModal from '@/components/AuthModal.vue'
import { ref, onMounted } from 'vue'

const isLogin = ref(false)

onMounted(() => {
  isLogin.value = !!sessionStorage.getItem('loginUser')
})

</script>

<style scoped>
@font-face {
  font-family: 'GongGothicMedium';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_20-10@1.0/GongGothicMedium.woff')
    format('woff');
  font-weight: normal;
  font-style: normal;
}
</style>
