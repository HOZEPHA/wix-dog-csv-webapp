# Générateur CSV Wix - Web App

Application web statique pour générer un CSV Wix depuis des fiches chiens `.docx`.

## Avantages

- Pas d'installation Windows
- Hébergement gratuit sur GitHub Pages
- Traitement local dans le navigateur
- Aucun fichier envoyé à un serveur

## Lancer en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Déploiement GitHub Pages

1. Créer un repository GitHub, par exemple `wix-dog-csv-webapp`.
2. Uploader tous les fichiers de ce dossier.
3. Dans GitHub : `Settings` → `Pages`.
4. Source : `GitHub Actions`.
5. Ajouter le workflow présent dans `.github/workflows/deploy.yml`.
6. Pousser sur la branche `main`.

Le site sera publié sur :

```text
https://VOTRE_COMPTE.github.io/wix-dog-csv-webapp/
```

## Important pour GitHub Pages

Si ton repository s'appelle autrement, modifie `base` dans `vite.config.ts`.

Exemple :

```ts
base: '/nom-du-repository/'
```
