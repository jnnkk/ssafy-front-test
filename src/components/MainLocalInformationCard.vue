<template>
    <v-card 
        class="hover-card"
        @click="handleClick"
    >
        <div class="card-image-container">
            <div class="image-wrapper">
                <v-img
                :src="props.item.image"
                :alt="props.item.name"
                height="300"
                cover
                class="card-image"
                >
                </v-img>
            </div>
            <div class="overlay"></div>
            <div class="card-content">
                <v-card-title class="text-white card-title">{{ props.item.name }}</v-card-title>
            </div>
        </div>
    </v-card>
</template>

<script setup>
const props = defineProps({
    item: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['handle-click'])

const handleClick = () => {
    emit('handle-click', props.item)
}
</script>

<style scoped>
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.hover-card {
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease;
    cursor: pointer;
}

.card-image-container {
    position: relative;
    overflow: hidden;
    height: 300px;
}

.image-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.5s ease;
}

.card-image {
    height: 100%;
    width: 100%;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    transition: all 0.5s ease;
    opacity: 0;
    z-index: 1;
}

.card-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}

.card-title {
    font-size: 1.3rem;
    transition: all 0.5s ease;
    transform: translateY(20px);
    opacity: 0.8;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

/* Hover effects */
.hover-card:hover .image-wrapper {
    transform: scale(1.1);
    filter: blur(3px);
}

.hover-card:hover .overlay {
    opacity: 1;
}

.hover-card:hover .card-title {
    transform: translateY(0);
    font-size: 1.8rem;
    font-weight: bold;
    opacity: 1;
}
</style>