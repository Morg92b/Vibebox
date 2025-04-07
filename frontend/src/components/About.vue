<template>
    <section class="about">
        <h1>À propos</h1>
        <p>Vibebox est bien plus qu’un simple projet.</p>
        <p>C’est une idée née de ma passion pour la musique et mon amour du
            code. À travers ce site, je souhaite créer un espace où chacun peut partager ses playlists Spotify,
            découvrir de nouveaux sons et surtout, mettre en avant les artistes qui méritent d’être entendus.

            Ce projet s’inscrit dans le cadre de mon titre professionnel RNCP niveau 5, mais c’est avant tout un projet
            de cœur. Développer Vibebox m’a permis de combiner mes deux univers préférés : la musique et le
            développement web. Chaque ligne de code a été écrite avec enthousiasme, dans l’espoir de créer une
            plateforme conviviale, vivante et utile pour tous les passionnés de musique.

            Rejoignez l’aventure, partagez vos vibes et faites découvrir vos artistes coups de cœur au monde entier !
        </p>
    </section>
</template>

<style scoped>
h1 {
    color: black;
}

@media (prefers-color-scheme: dark) {
    h1 {
        color: white;
    }
}

.about {
    padding: 20px;
    background: var(--color-background-soft);
    border-radius: 8px;
}
</style>
