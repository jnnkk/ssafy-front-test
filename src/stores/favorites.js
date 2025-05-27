
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useFavoriteStore = defineStore('favorites', () => {
    const _favorites = ref([]);

    const getFavorites = computed(() => {
        console.log("현재 즐겨찾기 목록", _favorites.value)
        return _favorites.value
    });

    const setFavorites = (favoritesList) => {
        _favorites.value = favoritesList
    }

    const fetchFavorites = async (userId) => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/favorites/${userId}`, {
              headers: {
                'ngrok-skip-browser-warning': 'true',
              }
            })
            
            setFavorites(data.data.value)
            console.log("현재 즐겨찾기 목록", data.data.value)
        } catch (error) {
            console.error('즐겨찾기 목록 조회 실패', error)
        }
    }

    return {
        getFavorites,
        setFavorites,
        fetchFavorites
    }
})