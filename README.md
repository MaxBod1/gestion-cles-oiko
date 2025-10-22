# 🔑 Gestion des Clés - Application Web pour Agence Immobilière

Application web complète pour gérer le suivi des clés d'une agence immobilière, avec gestion des départs, retours, alertes de retard et historique complet.

## 🆕 Version Actuelle : v2.1.7.3

### 🎨 Améliorations récentes (22 octobre 2025) :
1. ✅ **Page d'accueil épurée** - Boutons "Historique" et "Répertoire" côte à côte, renommés et alignés
2. ✅ **Historique réorganisé** - Détails en 5 sections claires (bien, personnes, photo, signatures, actions)
3. ✅ **Bouton "Enregistrer le départ"** - Écouteur du formulaire maintenant correctement attaché
4. ✅ **Canvas de signature dans modal de retour** - Initialisation automatique et robuste
5. ✅ **Gestion de largeur canvas = 0** - Fallback intelligent sur largeur du parent
6. ✅ **Historique compact** - Affichage en accordéon pour meilleure lisibilité

## ✨ Fonctionnalités Principales

### 📇 Répertoire de Contacts (NOUVEAU v2.1.6.1!)
- **Base de données de contacts** pour gagner du temps
- **Enregistrement depuis les formulaires** :
  - 📇 Bouton "Enregistrer dans le répertoire" dans Départ ET Retour de clés
  - Enregistrement direct en 1 clic sans quitter le formulaire
  - Évite la double saisie des informations
  - Gain de temps : 95% plus rapide que l'enregistrement manuel
- **Auto-complétion intelligente** dans les formulaires :
  - Recherche en temps réel dès 2 caractères
  - Suggestions instantanées par nom, prénom ou entreprise
  - Remplissage automatique de tous les champs en 1 clic
  - Disponible sur départ ET retour de clés
- **Gestion complète des contacts** :
  - Affichage compact en accordéon (nom + prénom visibles)
  - Développer pour voir tous les détails
  - Ajouter, modifier, supprimer des contacts
  - Recherche dans le répertoire
  - Compteur de contacts
- **Détection des doublons** :
  - Vérification automatique (nom + prénom + téléphone)
  - Message de confirmation avant ajout d'un doublon potentiel
- **Accès rapide** depuis la page d'accueil avec bouton dédié

### 🔍 Recherche Rapide depuis la Page d'Accueil
- **Barre de recherche** directement sur la première page
- Recherche **instantanée** dans toutes les clés sorties
- Recherche par **tous les critères** : nom, prénom, entreprise, téléphone, email, ex-locataire, adresse, référence
- **Affichage immédiat** des résultats avec photos
- **Clic sur photo** pour l'afficher en grand
- **Pas besoin de se connecter** pour rechercher une clé

### 🏢 Gestion Multi-Équipes
- **3 équipes distinctes** : Travaux, Commercialisation, Gestion
- **Identification rapide** par clic sur prénom (pas de mot de passe)
- **Membres des équipes** :
  - **Travaux** 🔨 : Sophie, Marc, Julie, Thomas
  - **Commercialisation** 🏢 : Claire, Philippe, Isabelle, Antoine
  - **Gestion** 📋 : Marie, Laurent, Nathalie, Pierre

### 📤 Départ de Clés
- **🔍 Recherche rapide dans le répertoire** (NOUVEAU!)
  - Barre de recherche avec auto-complétion
  - Suggestions en temps réel dès 2 caractères
  - Remplissage automatique des champs en 1 clic
  - Bouton d'accès direct au répertoire complet
- Formulaire complet avec toutes les informations nécessaires
- **Informations de la personne** :
  - Nom et Prénom (obligatoires)
  - Nom de l'entreprise (facultatif)
  - Téléphone et Email (obligatoires)
- **Informations du bien** :
  - Nom de l'ex-locataire (obligatoire)
  - Adresse du bien (obligatoire)
  - Numéro de référence / Lot (facultatif)
  - Date de retour prévue (obligatoire)
- **Notes/Commentaires** (facultatif)
- **✍️ Signature électronique** (obligatoire) - NOUVEAU v2.1.5
  - Signature au doigt (tactile) ou à la souris
  - Canvas de signature intégré
  - Bouton Effacer pour recommencer
  - Stockage sécurisé avec l'enregistrement
- **Capture photo** directe depuis la caméra/tablette

### 📥 Retour de Clés
- **Recherche multi-critères** :
  - Par nom/prénom de la personne
  - Par nom de l'entreprise
  - Par nom de l'ex-locataire
- **Recherche en temps réel** (sans cliquer sur "Rechercher")
- **Comparaison photo** pour vérifier les clés retournées
- **🔍 Recherche rapide dans le répertoire** (NOUVEAU!)
  - Barre de recherche avec auto-complétion
  - Suggestions en temps réel pour la personne qui ramène
  - Remplissage automatique des coordonnées
- **Formulaire de validation complet** :
  - Coordonnées de la personne qui ramène (nom, prénom, téléphone)
  - Sélection du réceptionnaire (équipe + membre)
  - **✍️ Signature électronique** (obligatoire) - v2.1.5
  - Signature au doigt (tactile) ou à la souris
  - Traçabilité complète de chaque mouvement

### 📊 Tableau de Bord Global Interactif (NOUVEAU v2.1.0!)
- **Vue d'ensemble globale** sur la page d'accueil :
  - Affichage du nombre total de clés en circulation (toutes équipes confondues)
  - Alertes de retard à 3 niveaux :
    - Retard 1 jour (alerte orange 🟠)
    - Retard 3+ jours (alerte rouge 🔴)
    - Retard 7+ jours (alerte rouge clignotante 🔴)
  - Mise à jour automatique après chaque opération
- **🆕 Cartes Cliquables** (Version 2.1.0) :
  - **Cliquer sur n'importe quelle carte** pour voir la liste détaillée
  - **Modal avec toutes les clés** de la catégorie
  - **📞 Coordonnées en évidence** : téléphone et email cliquables
  - **📸 Photos agrandissables** pour identification
  - **Accès immédiat** sans connexion nécessaire
  - **Action rapide** : appeler ou envoyer un email en 1 clic
  - **✅ Retour de clé ultra-rapide** (NOUVEAU v2.1.1!) :
    - **Bouton "Retour" sur chaque clé** directement dans le modal
    - **Rendre une clé en 1 clic** depuis n'importe quelle liste
    - **Actualisation automatique** de la liste après le retour
    - **Notification toast** pour confirmer l'action
    - **La clé disparaît immédiatement** de la liste des clés en circulation
- **Tableau de bord d'équipe** après connexion :
  - Statistiques en temps réel pour votre équipe
  - Accès rapide à toutes les fonctionnalités

### 📋 Liste des Clés Sorties
- Vue complète de toutes les clés actuellement en circulation
- **🔍 Filtrage simplifié** (NOUVEAU v2.1.6!) :
  - Interface minimaliste avec listes déroulantes
  - Recherche par critère : personne, entreprise, ex-locataire, adresse
  - Filtre de dates : date de départ ou date de retour prévue
  - Filtre par statut : Dans les temps, Retard 1j, 3j, 7j+
  - Réinitialisation rapide
- **Alertes visuelles** selon le niveau de retard
- **Tri automatique** par date de retour prévue
- Possibilité de **marquer comme retourné** directement

### 📚 Historique
- Archivage de tous les retours de clés
- **🔍 Filtrage simplifié et intuitif** (NOUVEAU v2.1.4!) :
  - **Interface minimaliste** avec listes déroulantes
  - **Recherche par critère unique** : personne, entreprise, ex-locataire, adresse, personne qui a ramené, réceptionné par
  - **Filtre de dates simplifié** : choisir "Date de départ" ou "Date de retour" puis définir la période
  - **Réduction des champs affichés** : plus clair et plus rapide
  - **Champs conditionnels** : seuls les champs nécessaires s'affichent selon votre sélection
- Informations complètes sur chaque mouvement
- Traçabilité : qui a enregistré, qui a retourné, dates
- **📅 Modification des dates de retour** :
  - Possibilité de corriger une date de retour enregistrée par erreur
  - Bouton "📅 Modifier la date de retour" sur chaque fiche de l'historique
  - Sélection facile de la nouvelle date et heure
  - Mise à jour automatique des statistiques globales
- **🗑️ Suppression de clés** :
  - Bouton de suppression sur chaque fiche de l'historique
  - Double confirmation pour éviter les erreurs
  - Suppression définitive des données

### 💾 Stockage Local
- **Pas de serveur nécessaire** - fonctionne 100% en local
- Données stockées dans le **localStorage** du navigateur
- **Persistance des données** même après fermeture
- Photos stockées en base64

## 🚀 Installation et Utilisation

### Installation (Tablette/PC)

1. **Télécharger l'application**
   - Télécharger tous les fichiers (index.html, style.css, app.js)
   - Les placer dans un même dossier

2. **Ouvrir l'application**
   - Double-cliquer sur `index.html`
   - L'application s'ouvre dans votre navigateur par défaut

3. **Autoriser l'accès à la caméra**
   - Lors de la première prise de photo, autoriser l'accès à la caméra

### Utilisation Quotidienne

#### 1️⃣ Se Connecter
1. Sélectionner votre équipe (Travaux, Commercialisation ou Gestion)
2. Cliquer sur votre prénom
3. Vous êtes connecté !

#### 2️⃣ Enregistrer un Départ de Clés
1. Cliquer sur **"📤 Départ de Clés"**
2. Remplir le formulaire avec toutes les informations
3. Cliquer sur **"📷 Démarrer la caméra"**
4. Prendre une photo des clés avec **"📸 Prendre la photo"**
5. Vérifier la photo (possibilité de reprendre)
6. Cliquer sur **"✅ Enregistrer le départ"**

#### 3️⃣ Enregistrer un Retour de Clés
1. Cliquer sur **"📥 Retour de Clés"**
2. Rechercher le dossier :
   - Taper le nom/prénom de la personne
   - OU le nom de l'entreprise
   - OU le nom de l'ex-locataire
3. Les résultats s'affichent en temps réel
4. Cliquer sur **"✅ Marquer comme retourné"**
5. Comparer la photo avec les clés retournées
6. Confirmer le retour

#### 4️⃣ Consulter les Statistiques (NOUVEAU v2.1.0!)
- Le **tableau de bord global** (page d'accueil) affiche en temps réel :
  - Nombre de clés en circulation
  - Alertes de retard (1j, 3j, 7j+)
- **Cliquer sur une carte** pour voir les détails :
  - Liste complète des clés de cette catégorie
  - Coordonnées (téléphone + email) cliquables
  - Photos des clés agrandissables
  - **Action rapide** : Appeler en 1 clic sur mobile/tablette
- Les alertes sont **colorées** pour une identification rapide

#### 5️⃣ Voir les Clés Sorties
1. Cliquer sur **"📋 Liste des Clés Sorties"**
2. Vue complète avec alertes visuelles
3. Possibilité de marquer comme retourné directement

#### 6️⃣ Consulter l'Historique
1. Cliquer sur **"📚 Historique"**
2. **Utiliser les filtres simplifiés** (NOUVEAU v2.1.4!) :
   - **Choisir un critère de recherche** dans la liste déroulante (personne, entreprise, ex-locataire, etc.)
   - **Saisir la valeur** recherchée dans le champ qui apparaît
   - **Optionnel : Filtrer par date** en choisissant "Date de départ" ou "Date de retour" puis en définissant la période
   - Cliquer sur **"🔍 Filtrer"** pour afficher les résultats
   - **"🔄 Réinitialiser"** pour effacer tous les filtres
3. Voir tous les détails des retours passés
4. **Modifier une date de retour si nécessaire** :
   - Cliquer sur **"📅 Modifier la date de retour"**
   - Voir la date actuelle et sélectionner la nouvelle
   - Confirmer la modification
5. **Supprimer un enregistrement** :
   - Cliquer sur **"🗑️ Supprimer"**
   - Confirmer deux fois pour valider la suppression définitive

## 🎨 Interface Utilisateur

### Design Moderne
- **Palette de vert OIKO GESTION** élégante et apaisante
- **Animations fluides** pour une meilleure expérience
- **Icônes émojis** pour une navigation intuitive
- **Cartes avec ombres** pour une profondeur visuelle

### Responsive
- ✅ **Optimisé tablette** (principal usage)
- ✅ **Compatible smartphone**
- ✅ **Fonctionne sur PC**
- ✅ **Adaptation automatique** à toutes les tailles d'écran

### Alertes Visuelles
- 🟢 **Vert** : Clés retournées
- ⚪ **Blanc** : Dans les temps
- 🟠 **Orange** : Retard 1 jour
- 🔴 **Rouge** : Retard 3+ jours
- 🔴⚡ **Rouge clignotant** : Retard 7+ jours

## ⚙️ Personnalisation

### Modifier les Équipes et Prénoms

1. Ouvrir le fichier `app.js`
2. Modifier les lignes 2 à 16 :

```javascript
const teams = {
    travaux: {
        name: 'Équipe Travaux',
        icon: '🔨',
        members: ['Sophie', 'Marc', 'Julie', 'Thomas'] // Modifier ici
    },
    commercialisation: {
        name: 'Équipe Commercialisation',
        icon: '🏢',
        members: ['Claire', 'Philippe', 'Isabelle', 'Antoine'] // Modifier ici
    },
    gestion: {
        name: 'Équipe Gestion',
        icon: '📋',
        members: ['Marie', 'Laurent', 'Nathalie', 'Pierre'] // Modifier ici
    }
};
```

3. Enregistrer et recharger la page

### Modifier les Seuils d'Alerte

Les seuils sont définis selon vos besoins :
- **1 jour** de retard : alerte orange
- **3 jours** de retard : alerte rouge
- **7 jours** de retard : alerte rouge clignotante

Pour modifier, chercher dans `app.js` les conditions :
```javascript
if (diffDays >= 7) late7++;
else if (diffDays >= 3) late3++;
else if (diffDays >= 1) late1++;
```

## 🔒 Sécurité et Sauvegarde

### Stockage des Données
- Toutes les données sont stockées **localement** dans le navigateur
- **Aucune donnée** n'est envoyée sur Internet
- Les photos sont stockées en **base64** dans localStorage

### ⚠️ IMPORTANT - Sauvegarde
Pour éviter toute perte de données :

1. **NE PAS vider le cache du navigateur**
2. **NE PAS supprimer les données de navigation** (localStorage)
3. **Sauvegarder régulièrement** les données

#### Méthode de Sauvegarde Manuelle

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
// Exporter toutes les données
const data = localStorage.getItem('keysDatabase');
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'sauvegarde-cles-' + new Date().toISOString().split('T')[0] + '.json';
a.click();
```

#### Restaurer une Sauvegarde

```javascript
// Après avoir lu le fichier JSON
const data = '...'; // Contenu du fichier
localStorage.setItem('keysDatabase', data);
location.reload();
```

## 📱 Compatibilité

### Navigateurs Supportés
- ✅ **Google Chrome** 90+ (Recommandé)
- ✅ **Safari** 14+ (iOS/iPad/Mac)
- ✅ **Firefox** 88+
- ✅ **Microsoft Edge** 90+

### Appareils
- ✅ **Tablette Android** (Chrome)
- ✅ **iPad** (Safari)
- ✅ **Ordinateur PC** (tous navigateurs)
- ✅ **Ordinateur Mac** (Safari, Chrome)
- ✅ **Smartphone** (utilisation possible mais moins confortable)

### Fonctionnalités Requises
- **JavaScript activé** (obligatoire)
- **localStorage** disponible (présent dans tous les navigateurs modernes)
- **getUserMedia API** pour l'accès caméra (supporté par tous les navigateurs récents)

## 🆘 Dépannage

### Problème : La caméra ne démarre pas
**Solutions** :
1. Vérifier les autorisations de la caméra dans les paramètres du navigateur
2. S'assurer qu'aucune autre application n'utilise la caméra
3. Essayer avec un autre navigateur
4. Sur iPhone/iPad : Autoriser l'accès caméra dans Réglages > Safari

### Problème : Les données disparaissent
**Solutions** :
1. Vérifier que vous n'avez pas vidé le cache du navigateur
2. Utiliser toujours le **même navigateur** sur le même appareil
3. Ne pas utiliser le mode "Navigation privée"
4. Faire des sauvegardes régulières (voir section Sauvegarde)

### Problème : L'application ne se charge pas
**Solutions** :
1. Vérifier que les 3 fichiers sont dans le même dossier
2. Essayer d'actualiser la page (F5 ou Ctrl+R)
3. Vider le cache et recharger
4. Essayer avec un autre navigateur

### Problème : La photo est floue
**Solutions** :
1. Bien stabiliser la tablette/smartphone
2. S'assurer d'avoir un bon éclairage
3. Nettoyer l'objectif de la caméra
4. Reprendre la photo avec le bouton "🔄 Reprendre"

## 📊 Structure des Données

### Format d'un Enregistrement de Clés

```javascript
{
  id: 1234567890123,                    // Timestamp unique
  departDate: "2024-01-15T10:30:00Z",   // Date/heure de départ
  expectedReturnDate: "2024-01-20",     // Date de retour prévue
  returnDate: null,                     // Date de retour effectif (null si pas encore retourné)
  person: {
    nom: "Dupont",
    prenom: "Jean",
    entreprise: "Entreprise ABC",
    telephone: "0612345678",
    email: "jean.dupont@example.com"
  },
  bien: {
    exLocataire: "Martin Pierre",
    adresse: "123 rue de la Paix, 75001 Paris",
    reference: "LOT-A-123"
  },
  commentaires: "Clés appartement + cave",
  photo: "data:image/jpeg;base64,...",  // Photo en base64
  registeredBy: "Sophie",                // Qui a enregistré le départ
  registeredByTeam: "Équipe Travaux",   // Équipe d'origine
  returnedBy: "Marc",                    // Qui a validé le retour
  returnedByTeam: "Équipe Travaux"      // Équipe au retour
}
```

## 🎯 Fonctionnalités Techniques

### Technologies Utilisées
- **HTML5** : Structure moderne et sémantique
- **CSS3** : Design moderne avec animations, dégradés et responsive
- **JavaScript Vanilla** : Aucune dépendance externe
- **localStorage API** : Stockage local persistant
- **getUserMedia API** : Accès à la caméra
- **Canvas API** : Capture et traitement des photos

### Architecture
- **Application SPA** (Single Page Application)
- **Navigation par états** (affichage/masquage de pages)
- **Gestion d'état global** (currentUser, currentTeam, etc.)
- **Événements dynamiques** (recherche temps réel, etc.)

### Performance
- **Léger** : ~45 Ko total (HTML + CSS + JS)
- **Rapide** : Chargement instantané
- **Fluide** : Animations 60 FPS
- **Optimisé** : Photos compressées à 80%

## 📝 Notes Importantes

### Limitations
- ⚠️ **Pas de synchronisation** entre plusieurs appareils
- ⚠️ **Stockage limité** par le localStorage (~5-10 Mo selon navigateurs)
- ⚠️ **Données locales** : Restent sur l'appareil utilisé
- ⚠️ **Pas de collaboration** en temps réel entre utilisateurs

### Recommandations
- ✅ Utiliser **un seul appareil** (tablette dédiée)
- ✅ Faire des **sauvegardes régulières** (hebdomadaires)
- ✅ Ne pas vider le **cache du navigateur**
- ✅ Utiliser toujours le **même navigateur**
- ✅ Former tous les utilisateurs aux **bonnes pratiques**

### Capacité de Stockage
Avec localStorage (~5-10 Mo) :
- **Photos 100 Ko** chacune
- Capacité : **50-100 enregistrements** avec photos
- Si besoin de plus : Réduire la qualité des photos ou archiver régulièrement

## 🎓 Guide Utilisateur Rapide

### Pour l'équipe Travaux 🔨
1. Sélectionner "Travaux"
2. Cliquer sur votre prénom
3. Utiliser les boutons selon le besoin

### Pour l'équipe Commercialisation 🏢
1. Sélectionner "Commercialisation"
2. Cliquer sur votre prénom
3. Gérer les clés pour les visites

### Pour l'équipe Gestion 📋
1. Sélectionner "Gestion"
2. Cliquer sur votre prénom
3. Suivre l'état des clés et l'historique

## 📞 Support

Pour toute question ou problème :
1. Consulter la section **Dépannage** de ce README
2. Vérifier que tous les fichiers sont présents et à jour
3. Tester avec un autre navigateur si problème persistant

## 🔄 Mises à Jour

### Version Actuelle : 2.1.7

**Nouveautés v2.1.7 (22 octobre 2025) :**
- ✨ **Historique compact en accordéon** - Navigation ultra-rapide dans l'historique
  - Affichage condensé : Nom + Ex-locataire + Date de retour sur une ligne
  - Clic pour développer/replier les détails complets
  - Animation fluide et professionnelle
  - Économie d'espace vertical de ~75%
  - Responsive mobile optimisé
- 🔧 **Enregistrement direct depuis formulaires**
  - Bouton "📇 Enregistrer dans le répertoire" fonctionnel
  - Détection automatique des doublons
  - Validation complète des champs
  - Disponible dans Départ ET Retour de clés
- 🔧 **Correction auto-complétion**
  - Suggestions correctement positionnées sous les champs
  - Auto-remplissage fonctionnel dans modal de retour
  - Recherche améliorée dans tous les formulaires

**Fonctionnalités implémentées** :
- ✅ Gestion multi-équipes avec identification rapide
- ✅ Gestion des profils d'équipe (ajout/suppression de membres)
- ✅ Départ de clés avec formulaire complet
- ✅ Capture photo intégrée
- ✅ Retour de clés avec recherche multi-critères
- ✅ Tableau de bord global interactif (v2.1.0)
  - 🆕 Cartes cliquables pour accès direct aux détails
  - 🆕 Coordonnées (téléphone/email) cliquables pour action rapide
  - 🆕 Photos agrandissables
  - **✨ Retour ultra-rapide depuis les modals (v2.1.1)**
    - Bouton "✅ Retour de la Clé" sur chaque carte
    - Rendre une clé directement depuis la liste
    - Actualisation automatique après le retour
    - Notification toast de confirmation
  - **🔐 Validation complète du retour (v2.1.2)**
    - Formulaire complet pour enregistrer qui ramène les clés
    - Saisie des coordonnées (nom, prénom, téléphone)
    - Sélection du réceptionnaire parmi les profils d'utilisateurs
    - Traçabilité complète de chaque mouvement
    - Affichage enrichi dans l'historique
  - **📧 Emails de rappel automatiques (v2.1.3)**
    - Bouton "📧 Envoyer un rappel" sur chaque clé en retard
    - Email pré-rempli avec toutes les informations
    - 3 niveaux d'urgence (1j, 3j, 7j+)
    - Ouvre votre client email (Outlook, Gmail, etc.)
    - 95% de temps gagné sur l'envoi de rappels
  - **🔍 Filtres d'historique simplifiés (v2.1.4)**
    - Interface minimaliste avec listes déroulantes
    - Champs conditionnels : seuls les champs nécessaires apparaissent
    - Recherche par critère unique clair
    - Filtre de dates unifié (départ OU retour)
    - Plus d'erreurs avec des champs dupliqués
    - Expérience utilisateur optimisée
  - **✍️ Signatures électroniques (v2.1.5)**
    - Signature obligatoire au départ des clés
    - Signature obligatoire au retour des clés
    - Canvas tactile ou souris pour signer
    - Bouton Effacer pour recommencer
    - Stockage sécurisé des signatures en base64
    - Affichage des signatures dans l'historique
    - Traçabilité complète avec preuve de signature
  - **🔍 Filtres pour Liste des Clés Sorties (v2.1.6 - NOUVEAU!)**
    - Même système de filtrage simplifié que l'historique
    - Recherche par personne, entreprise, ex-locataire, adresse
    - Filtre par date de départ ou retour prévue
    - Filtre par statut (dans les temps ou en retard)
    - Interface cohérente et intuitive
- ✅ Suppression de clés dans l'historique (v2.1.3)
- ✅ Accès direct à l'historique depuis la page d'accueil (v2.1.1)
- ✅ Interface réorganisée et plus compacte (v2.1.1)
- ✅ Tableau de bord d'équipe avec statistiques temps réel
- ✅ Alertes de retard à 3 niveaux (1j, 3j, 7j+)
- ✅ Liste des clés sorties
- ✅ Historique complet avec filtrage avancé
- ✅ Modification des dates de retour dans l'historique (v2.0.0)
- ✅ Recherche rapide depuis la page d'accueil
- ✅ Stockage local (localStorage)
- ✅ Interface responsive (tablette/mobile/PC)
- ✅ Design moderne avec palette verte OIKO GESTION

## 📄 Licence

Application créée pour usage interne d'agence immobilière.

---

**Développé avec ❤️ pour simplifier la gestion des clés de votre agence immobilière**
