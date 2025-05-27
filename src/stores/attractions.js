
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAttractionStore = defineStore('attractions', () => {
    const _attractions = ref([]);

    const getAttractions = computed(() => {
        return _attractions.value
    });

    const getAttractionsByCategory = computed((category) => {
        if (_attractions.value.length === 0) return _attractions.value
        
        if (!category) return _attractions.value

        return _attractions.value.filter((attraction) => 
            attraction.contentTypeId == category
        )
    });

    const searchAttractions = (keyword) => {
        if (_attractions.value.length === 0) return _attractions.value

        if (!keyword || keyword.trim() === '') return _attractions.value

        return _attractions.value.filter((attraction) => 
            attraction.title.includes(keyword)
        )
    }

    const setAttractions = (attractionList) => {
        _attractions.value = attractionList
    }

    const addAttractions = (attractionList) => {
        _attractions.value.push(...attractionList)
    }

    const clearAttractions = () => {
        _attractions.value = []
    }

    return {
        getAttractions,
        getAttractionsByCategory,
        searchAttractions,
        setAttractions,
        addAttractions,
        clearAttractions
    }
})
