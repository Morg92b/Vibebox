<template>
    <section class="important">
        <p>⚠️ <strong>IMPORTANT</strong> : Lier un compte Spotify nécessite une autorisation de l'API. La demande pour
            autoriser tout les comptes spotify est
            actuellement en attente. En attendant, veuillez me contacter directement pour obtenir l'accès nécessaire.
        </p>
    </section>
</template>

<style scoped>
.important {
    padding: 20px;
    background: var(--color-background-soft);
    border-radius: 8px;
    border-left: 5px solid #f39c12;
    /* bande orange */
    color: black;
}

@media (prefers-color-scheme: dark) {
    .important {
        color: white;
        border-left: 5px solid #f1c40f;
    }
}
</style>
