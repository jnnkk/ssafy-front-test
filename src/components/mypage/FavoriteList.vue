<template>
  <div class="favorites-container">
    <h2>즐겨찾기</h2>
    <div class="card-list">
      <div class="favorite-card" v-for="fav in favorites" :key="fav.attrId">
        <button class="delete-btn" @click="deleteFavorite(fav.attrId)">X</button>
        <img :src="fav.imageUrl || defaultImage" alt="관광지 이미지" />
        <h3>{{ fav.title }}</h3>
        <h3>{{ fav.address }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { dummyImage } from '@/assets/js/dummyImage'
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
});
const defaultImage = '/src/assets/noimage.avif'
const favorites = ref([]);
// 예시로 userId를 props나 스토어에서 가져왔다고 가정
const userId = props.user.userId/* 여기 userId 할당 (예: props.userId 또는 Vuex getter) */;

async function fetchFavorites() {
  try {
    // 1) userId 별 즐겨찾기 리스트
    const { data: favList } = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/favorites?userId=${userId}`
    );
    // 2) attrId 별로 attractions 정보 가져와서 title, firstImage1 병합
    const enriched = await Promise.all(
      favList.value.map(async (fav) => {
        const { data: attr } = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/attractions/${fav.attrId}`
        );
        console.log(attr.title, attr.firstImage1)
        return {
          attrId:    fav.attrId,
          title:     attr.value.title,
          imageUrl:  attr.value.firstImage1 || dummyImage(fav.attrId),
          address: attr.value.addr1
        };
      })
    );
    favorites.value = enriched;
  } catch (err) {
    console.error('즐겨찾기 로딩 실패', err);
  }
}

async function deleteFavorite(attrId) {
  try {
    const result = confirm('정말 이 작업을 진행하시겠습니까?');
    if (result) {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/favorites/${attrId}`);
    favorites.value = favorites.value.filter(f => f.attrId !== attrId);
    } 
  } catch (err) {
    console.error('삭제 실패', err);
  }
}

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-container {
  padding: 20px;
}
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.favorite-card {
  position: relative;
  width: 220px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  background: #fff;
}
.favorite-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
}
.favorite-card h3 {
  font-size: 16px;
  margin: 10px 0 0;
}
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4d4f;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}
</style>
