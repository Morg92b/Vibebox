<template>
    <footer class="footer">
        <div class="footer-container">
            <!-- Colonne 1 : Logo & Description -->
            <div class="footer-col">
                <router-link to="/" class="footer-logo">
                    <img src="@/assets/vibox.png" alt="Vibox Logo" class="logo-footer" />
                </router-link>
                <p class="footer-description">
                    Plateforme de partage de contenus multimédias.
                    Découvrez, créez, vibrez.
                </p>
            </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
            <p>© 2025 Vibebox. Tous droits réservés.</p>
        </div>
    </footer>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
</script>

<style scoped>
/* Styles communs */
body {
    margin: 0;
    padding: 0;
}

.footer {
    width: 100vw;
    /* Prend toute la largeur de la fenêtre */
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    background: rgba(24, 24, 24, 0.85);
    color: #fff;
    padding: 0.2rem 1rem;
    backdrop-filter: blur(5px);
    border-top: 1px solid #1a5e9c;
    box-sizing: border-box;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.footer-col {
    flex: 1;
    min-width: 200px;
    text-align: center;
}

.logo-footer {
    height: 90px;
}

.footer-description {
    font-size: 0.9rem;
    color: #fff;
}

/* Footer bottom */
.footer-bottom {
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    text-align: center;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    margin-top: 0.5rem;
    box-sizing: border-box;
}

/* Responsive */
@media (max-width: 768px) {
    .footer-container {
        grid-template-columns: 1fr;
        text-align: center;
    }
}
</style>
