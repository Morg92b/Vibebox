<template>
    <div class="login-box">
        <p>S'enregistrer</p>
        <form @submit.prevent="handleSubmit">
            <div class="user-box">
                <input v-model="localUsername" required name="username" type="text">
                <label>Nom d'utilisateur</label>
            </div>
            <div class="user-box">
                <input v-model="localEmail" required name="email" type="text">
                <label>Email</label>
            </div>
            <div class="user-box">
                <input v-model="localPassword" required name="password" type="password">
                <label>Mot de passe</label>
            </div>
            <div class="user-box">
                <input v-model="localconfirmpassword" required name="passwordConfirm" type="password">
                <label>Confirmez le mot de passe</label>
            </div>
            <button type="submit">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Soumettre
            </button>
        </form>
        <p v-if="localErrorMessage" class="error-message">{{ localErrorMessage }}</p>
        <p>Vous avez déjà un compte ? <router-link to="/login" class="a2">Se connecter!</router-link></p>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
    username: String,
    email: String,
    password: String,
    confirmpassword: String,
    errorMessage: String
});

const emits = defineEmits(['update:username', 'update:email', 'update:password', 'update:confirmpassword', 'submit']);

const localUsername = ref(props.username);
const localEmail = ref(props.email);
const localPassword = ref(props.password);
const localconfirmpassword = ref(props.confirmpassword);
const localErrorMessage = ref(props.errorMessage);

watchEffect(() => {
    localEmail.value = props.email;
    localUsername.value = props.username;
    localPassword.value = props.password;
    localconfirmpassword.value = props.confirmpassword;
    localErrorMessage.value = props.errorMessage;
});

const handleSubmit = () => {
    console.log('Soumission du formulaire avec les valeurs :', {
        username: localUsername.value,
        email: localEmail.value,
        password: localPassword.value,
        confirmpassword: localconfirmpassword.value
    });

    emits('update:username', localUsername.value);
    emits('update:email', localEmail.value);
    emits('update:password', localPassword.value);
    emits('update:confirmpassword', localconfirmpassword.value);
    emits('submit', {
        username: localUsername.value,
        email: localEmail.value,
        password: localPassword.value,
        confirmpassword: localconfirmpassword.value
    });
};
</script>


<style scoped>
/* Styles existants */
.login-box {
    position: absolute;
    top: 43%;
    left: 50%;
    width: 400px;
    height: 480px;
    padding: 40px;
    margin: 20px auto;
    transform: translate(-50%, -55%);
    background: rgba(0, 0, 0, .9);
    box-sizing: border-box;
    box-shadow: 0 15px 25px rgba(0, 0, 0, .6);
    border-radius: 10px;
    overflow: hidden;
}

.login-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    /* Ajustez la hauteur selon vos besoins */
    background: linear-gradient(to bottom, rgba(43, 120, 235, 0.5), transparent);
    /* Couleur du halo bleu */
    clip-path: ellipse(70% 100% at 50% 0);
    /* Ajustez pour obtenir l'effet de vague souhaité */
}

.login-box p:first-child {
    margin: 1 0 30px;
    padding: 0;
    background: linear-gradient(to right, #1a5e9c, #1a5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
}

.login-box .user-box {
    position: relative;
}

.login-box .user-box input {
    width: 100%;
    padding: 10px 0;
    font-size: 16px;
    color: #fff;
    margin-bottom: 30px;
    border: none;
    border-bottom: 1px solid #fff;
    outline: none;
    background: transparent;
}

.login-box .user-box label {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px 0;
    font-size: 16px;
    color: #fff;
    pointer-events: none;
    transition: .5s;
}

.login-box .user-box input:focus~label,
.login-box .user-box input:valid~label {
    top: -20px;
    left: 0;
    color: #fff;
    font-size: 12px;
}

/* Styles modifiés pour les boutons */
.login-box form button {
    position: relative;
    display: inline-block;
    padding: 10px 20px;
    font-weight: bold;
    color: #fff;
    font-size: 16px;
    text-decoration: none;
    text-transform: uppercase;
    overflow: hidden;
    transition: .5s;
    margin-top: 40px;
    letter-spacing: 3px;
    background: transparent;
    border: none;
    cursor: pointer;
}

.login-box form button:hover {
    background: #fff;
    color: #272727;
    border-radius: 5px;
}

.login-box form button span {
    position: absolute;
    display: block;
}

.login-box form button span:nth-child(1) {
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #fff);
    animation: btn-anim1 1.5s linear infinite;
}

@keyframes btn-anim1 {
    0% {
        left: -100%;
    }

    50%,
    100% {
        left: 100%;
    }
}

.login-box form button span:nth-child(2) {
    top: -100%;
    right: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(180deg, transparent, #fff);
    animation: btn-anim2 1.5s linear infinite;
    animation-delay: .375s
}

@keyframes btn-anim2 {
    0% {
        top: -100%;
    }

    50%,
    100% {
        top: 100%;
    }
}

.login-box form button span:nth-child(3) {
    bottom: 0;
    right: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(270deg, transparent, #fff);
    animation: btn-anim3 1.5s linear infinite;
    animation-delay: .75s;
}

@keyframes btn-anim3 {
    0% {
        right: -100%;
    }

    50%,
    100% {
        right: 100%;
    }
}

.login-box form button span:nth-child(4) {
    bottom: -100%;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(360deg, transparent, #fff);
    animation: btn-anim4 1.5s linear infinite;
    animation-delay: 1.125s
}

@keyframes btn-anim4 {
    0% {
        bottom: -100%;
    }

    50%,
    100% {
        bottom: 100%;
    }
}

.login-box p:last-child {
    color: #aaa;
    font-size: 14px;
}

.login-box a.a2 {
    color: #fff;
    text-decoration: none;
}

.login-box a.a2:hover {
    background: transparent;
    color: #aaa;
    border-radius: 5px;
}

/* Nouveau style pour les messages d'erreur */
.error-message {
    color: #fff;
}
</style>