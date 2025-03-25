<template>
    <div class="background-container">
        <div class="animated-background"></div>
    </div>
</template>

<style scoped>
.background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: -1;
    /* Pour rester en arrière-plan */
}

.animated-background {
    width: 100%;
    height: 100%;
    background: #121212;
    background: linear-gradient(135deg,
            #121212 25%,
            #1a1a1a 25%,
            #1a1a1a 50%,
            #121212 50%,
            #121212 75%,
            #1a1a1a 75%,
            #1a1a1a);
    background-size: 40px 40px;
    animation: move 10s linear infinite;
}

@keyframes move {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 40px 40px;
    }
}

/* Version responsive */
@media (max-width: 1024px) {
    .animated-background {
        background-size: 30px 30px;
    }

    @keyframes move {
        100% {
            background-position: 30px 30px;
        }
    }
}
</style>