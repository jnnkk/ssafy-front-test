
// img의 dummy1 ~ dummy6 이미지중 하나를 반환하는 코드
export const dummyImage = (seed) => {
    const images = [
        '/src/assets/img/dummy1.jpg',
        '/src/assets/img/dummy2.webp',
        '/src/assets/img/dummy3.jpg',
        '/src/assets/img/dummy4.jpg',
        '/src/assets/img/dummy5.jpg',
        '/src/assets/img/dummy6.jpg',
    ]
    return images[seed % images.length]
}
