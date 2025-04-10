<style scoped>
.tv-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tv-screen {
    position: relative;
    width: 300px;
    height: 200px;
    background: black;
    border: 10px solid #333;
    border-radius: 10px;
    box-shadow:
        0 0 20px rgba(0, 0, 0, 0.8),
        inset 0 0 50px rgba(255, 255, 255, 0.2);
    overflow: hidden;
}

.static {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(0deg,
            #000,
            #000 1px,
            #111 1px,
            #fff 1px,
            #333 2px);
    animation: flicker 0.1s steps(20) infinite;
    z-index: 1;
}

.error-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: red;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 2px 2px 5px black;
    z-index: 2;
    animation: glitch 0.5s infinite;
}

.tv-stand {
    width: 150px;
    height: 10px;
    background: #333;
    margin-top: 10px;
    border-radius: 5px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.7);
}

@keyframes flicker {
    0% {
        opacity: 0.8;
        transform: scaleY(1);
    }

    50% {
        opacity: 1;
        transform: scaleY(1.01);
    }

    100% {
        opacity: 0.7;
        transform: scaleY(0.99);
    }
}

@keyframes glitch {
    0% {
        transform: translate(-50%, -50%) skewX(5deg);
        opacity: 0.9;
    }

    25% {
        transform: translate(-50%, -50%) skewX(-5deg);
        opacity: 0.8;
    }

    50% {
        transform: translate(-50%, -50%) skewX(0deg);
        opacity: 1;
    }

    75% {
        transform: translate(-50%, -50%) skewX(-5deg);
        opacity: 0.8;
    }

    100% {
        transform: translate(-50%, -50%) skewX(5deg);
        opacity: 0.9;
    }
}
</style>

<template>
    <div class="tv-container">
        <div class="tv-screen">
            <div class="static"></div>
            <div class="error-text">ERROR</div>
        </div>
        <div class="tv-stand"></div>
    </div>
</template>
