# Portfolio Melissa Abider

Ce projet represente mon portfolio.

## Mise a jour des projets depuis le telephone

Cette branche ajoute une page privee `assistant.html` pour ajouter un projet sans modifier directement `index.html`.

Workflow :

1. Ouvrir `assistant.html` depuis le site publie.
2. Ecrire un message naturel avec le titre, l'annee, les technologies, le probleme, ce qui a ete construit, l'impact et le lien GitHub.
3. Cliquer sur `Draft card`, verifier les champs, puis `Add to JSON`.
4. Renseigner un token GitHub fine-grained avec `Contents: Read and write` sur le depot.
5. Cliquer sur `Commit data/projects.json` pour publier la mise a jour sur la branche choisie.

Le portfolio lit les projets depuis `data/projects.json`, donc les nouvelles cartes apparaissent automatiquement apres deploiement.
