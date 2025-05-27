<template>
    <div class="weather-widget-container">
        <!-- 타이틀 섹션 -->
        <div class="weather-title mb-3">
            <div class="d-flex align-center justify-center">
                <v-icon color="amber" size="large" class="mr-2">mdi-weather-partly-rainy</v-icon>
                <div>
                    <h2 class="text-h5 font-weight-bold mb-0">오늘의 날씨 알리미</h2>
                    <p class="text-body-2 text-grey-darken-1 mb-0">오늘과 내일, 모레의 날씨를 확인해보세요!</p>
                </div>
            </div>
        </div>
        
        <v-container fluid class="fill-height pa-0" style="margin: 0; max-width: 100%;">

        <div v-if="loading" class="loading-container">
            <v-sheet class="loading-animation" rounded elevation="4">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="48"
                ></v-progress-circular>
                <div class="loading-icons">
                    <v-icon 
                        class="weather-icon rain" 
                        color="blue-lighten-1" 
                        size="small"
                    >mdi-weather-rainy</v-icon>
                    <v-icon 
                        class="weather-icon sun" 
                        color="amber" 
                        size="small"
                    >mdi-weather-sunny</v-icon>
                    <v-icon 
                        class="weather-icon snow" 
                        color="light-blue-lighten-4" 
                        size="small"
                    >mdi-weather-snowy</v-icon>
                    <v-icon 
                        class="weather-icon cloud" 
                        color="grey-lighten-1" 
                        size="small"
                    >mdi-weather-cloudy</v-icon>
                </div>
                <div class="text-body-2 mt-2">날씨 정보를 불러오는 중...</div>
            </v-sheet>
        </div>
        <v-row v-else class="fill-height ma-0">
            <!-- 오늘 날씨 - 메인 카드 -->
            <v-col cols="12" sm="6" md="5" lg="4" class="pa-1">
                <v-card 
                    class="main-card fill-height" 
                    elevation="4" 
                    :color="getColorByCondition(getTodayWeather()?.SKY)"
                >
                    <v-card-title class="text-h6 font-weight-bold text-center py-2">
                        오늘
                        <div class="text-caption font-weight-regular">{{ formatDate(getTodayDate()) }}</div>
                    </v-card-title>
                    <v-card-text class="d-flex flex-column align-center justify-center pa-2">
                        <v-icon size="64" class="mb-2">{{ getWeatherIcon(getTodayWeather()?.SKY, getTodayWeather()?.PTY) }}</v-icon>
                        
                        <div class="text-h5 font-weight-bold mb-2">
                            {{ getTodayWeather()?.TMN || '-' }} / {{ getTodayWeather()?.TMX || '-' }} °C
                        </div>

                        <v-row class="mt-1 text-center" dense>
                            <v-col cols="4">
                                <div class="text-caption font-weight-bold">강수확률</div>
                                <div class="text-body-2">{{ getTodayWeather()?.POP || '0' }}%</div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-caption font-weight-bold">강수형태</div>
                                <div class="text-body-2">{{ getPrecipitationType(getTodayWeather()?.PTY) }}</div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-caption font-weight-bold">하늘상태</div>
                                <div class="text-body-2">{{ getSkyCondition(getTodayWeather()?.SKY) }}</div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            
            <!-- 다음 날씨 예보 - 작은 카드들 -->
            <v-col cols="12" sm="6" md="7" lg="8" class="pa-0">
                <v-row class="fill-height ma-0">
                    <template v-for="(_, index) in 4" :key="index">
                        <v-col cols="6" sm="6" md="3" lg="3" class="pa-1">
                            <v-card 
                                class="forecast-card fill-height" 
                                elevation="2"
                                :color="getColorByCondition(getForecastWeather(index + 1)?.SKY)"
                                hover
                            >
                                <v-card-title class="text-body-1 font-weight-bold text-center pa-2">
                                    + {{ index + 1 }}일
                                    <div class="text-caption font-weight-regular">{{ formatShortDate(getForecastDate(index + 1)) }}</div>
                                </v-card-title>
                                <v-card-text class="d-flex flex-column align-center pa-2">
                                    <v-icon size="40" class="my-1">{{ getWeatherIcon(getForecastWeather(index + 1)?.SKY, getForecastWeather(index + 1)?.PTY) }}</v-icon>
                                    
                                    <div class="text-body-1 font-weight-bold mb-1">
                                        {{ getForecastWeather(index + 1)?.TMN || '-' }} / {{ getForecastWeather(index + 1)?.TMX || '-' }} °C
                                    </div>
                                    
                                    <v-chip 
                                        class="ma-1" 
                                        size="x-small"
                                        :color="getPrecipitationColor(getForecastWeather(index + 1)?.POP)"
                                    >
                                        강수 {{ getForecastWeather(index + 1)?.POP || '0' }}%
                                    </v-chip>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </template>
                </v-row>
            </v-col>
        </v-row>
            </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const weather = ref({})
const loading = ref(true)

const weatherKey = import.meta.env.VITE_APP_KEY_WEATHER

const baseDate = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
})

const baseTime = ref('0200')

const processedWeather = computed(() => {
    if (!weather.value || !Array.isArray(weather.value)) {
        return {}
    }

    const result = {}
    const targetCategories = ['PTY', 'POP', 'SKY', 'TMN', 'TMX']

    weather.value.forEach(item => {
        const { fcstDate, category, fcstValue } = item
        
        if (targetCategories.includes(category)) {
            if (!result[fcstDate]) {
                result[fcstDate] = {
                    PTY: null,
                    POP: null,
                    SKY: null,
                    TMN: null,
                    TMX: null
                }
            }
            
            result[fcstDate][category] = fcstValue
        }
    })

    return result
})

const getPrecipitationType = (value) => {
    const types = {
        '0': '없음',
        '1': '비',
        '2': '비/눈',
        '3': '눈',
        '5': '빗방울',
        '6': '빗방울눈날림',
        '7': '눈날림'
    }
    return types[value] || '알 수 없음'
}

const getSkyCondition = (value) => {
    const conditions = {
        '1': '맑음',
        '3': '구름많음',
        '4': '흐림'
    }
    return conditions[value] || '알 수 없음'
}

const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return '날짜 정보 없음'

    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)

    return `${year}년 ${month}월 ${day}일`
}

// 짧은 날짜 포맷 (작은 카드용)
const formatShortDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return ''

    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)

    return `${month}/${day}`
}

const getWeatherIcon = (skyValue, ptyValue) => {
    if (ptyValue && ptyValue !== '0') {
        const precip = {
            '1': 'mdi-weather-pouring',
            '2': 'mdi-weather-snowy-rainy',
            '3': 'mdi-weather-snowy-heavy',
            '5': 'mdi-weather-partly-rainy',
            '6': 'mdi-weather-snowy-rainy',
            '7': 'mdi-weather-snowy'
        }
        return precip[ptyValue] || 'mdi-weather-cloudy'
    }

    const sky = {
        '1': 'mdi-weather-sunny',
        '3': 'mdi-weather-partly-cloudy',
        '4': 'mdi-weather-cloudy'
    }

    return sky[skyValue] || 'mdi-weather-cloudy'
}

const getPrecipitationColor = (popValue) => {
    const pop = parseInt(popValue || '0')

    if (pop >= 70) return 'error'
    if (pop >= 40) return 'warning'
    if (pop >= 20) return 'info'
    return 'success'
}

const getColorByCondition = (skyValue) => {
    const colors = {
        '1': 'blue-lighten-5',
        '3': 'blue-grey-lighten-4',
        '4': 'blue-grey-darken-1'
    }

    return colors[skyValue] || 'grey-lighten-3'
}

const getTodayDate = () => {
    const dates = Object.keys(processedWeather.value).sort()
    return dates.length > 0 ? dates[0] : null
}

const getTodayWeather = () => {
    const todayDate = getTodayDate()
    return todayDate ? processedWeather.value[todayDate] : null
}

const getForecastDate = (daysAhead) => {
    const dates = Object.keys(processedWeather.value).sort()
    return dates.length > daysAhead ? dates[daysAhead] : null
}

const getForecastWeather = (daysAhead) => {
    const forecastDate = getForecastDate(daysAhead)
    return forecastDate ? processedWeather.value[forecastDate] : null
}

const fetchWeather = async () => {
    console.log('날씨 정보 불러오기 시작')
    loading.value = true

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500))

    try {
        const { data } = await axios.get('/api/1360000/VilageFcstInfoService_2.0/getVilageFcst', {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
            params: {
                serviceKey: weatherKey,
                pageNo: 1,
                numOfRows: 1000,
                dataType: 'JSON',
                base_date: baseDate.value,
                base_time: baseTime.value,
                nx: 60,
                ny: 127
            }
        })

        weather.value = data.response.body.items.item
        await minLoadingTime
    } catch (e) {
        console.error('날씨 정보 불러오기 실패', e)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchWeather()
})
</script>

<style scoped>
h2 {
    font-family: 'GongGothicMedium'
}

p {
    font-family: 'GongGothicMedium'
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

.loading-animation {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 12px;
    width: 200px;
}

.loading-icons {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    position: relative;
    height: 32px;
    width: 100%;
}

.weather-icon {
    position: absolute;
    transition: all 0.5s ease;
}

.weather-icon.rain {
    animation: iconFloat 3s ease-in-out infinite;
    animation-delay: 0.2s;
}

.weather-icon.sun {
    animation: iconRotate 6s linear infinite, iconFloat 4s ease-in-out infinite;
    animation-delay: 0s, 0.5s;
}

.weather-icon.snow {
    animation: iconFloat 3.5s ease-in-out infinite;
    animation-delay: 0.8s;
}

.weather-icon.cloud {
    animation: iconFloat 4s ease-in-out infinite;
    animation-delay: 1.2s;
}

@keyframes iconFloat {
    0%, 100% {
        transform: translateY(0);
        opacity: 1;
    }
    50% {
        transform: translateY(-10px);
        opacity: 0.7;
    }
}

@keyframes iconRotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.main-card {
    transition: all 0.3s ease;
    border-radius: 12px;
    overflow: hidden;
    min-height: 200px;
}

.main-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.forecast-card {
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
    min-height: 140px;
}

.forecast-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 반응형 조정 */
.weather-widget-container {
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
}

.weather-title {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    padding: 16px 20px;
    border-radius: 12px;
    border-left: 4px solid #2196f3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    flex-shrink: 0;
}

@media (max-width: 600px) {
    .main-card {
        min-height: 180px;
    }
    
    .forecast-card {
        min-height: 120px;
    }
}

@media (max-width: 960px) and (min-width: 601px) {
    .forecast-card {
        min-height: 130px;
    }
}
</style>