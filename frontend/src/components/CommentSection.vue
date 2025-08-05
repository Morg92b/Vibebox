<template>
    <button @click="$emit('toggle-comments')" class="comment-button">
        <font-awesome-icon icon="fa-solid fa-comment" class="comment-icon" />
    </button>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faComment);
</script>

<style scoped>
.comment-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
}

.comment-icon {
    font-size: 1.2rem;
    color: #333;
}
</style>
