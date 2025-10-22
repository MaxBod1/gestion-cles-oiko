// Configuration par défaut des équipes
const defaultTeams = {
    travaux: {
        name: 'Équipe Travaux',
        icon: '🔨',
        members: ['Sophie', 'Marc', 'Julie', 'Thomas']
    },
    commercialisation: {
        name: 'Équipe Commercialisation',
        icon: '🏢',
        members: ['Claire', 'Philippe', 'Isabelle', 'Antoine']
    },
    gestion: {
        name: 'Équipe Gestion',
        icon: '📋',
        members: ['Marie', 'Laurent', 'Nathalie', 'Pierre']
    }
};

// Configuration des équipes (chargée depuis localStorage ou défaut)
let teams = {};

// État de l'application
let currentTeam = null;
let currentUser = null;
let currentPhoto = null;
let videoStream = null;
let keysDatabase = [];
let selectedKeyForReturn = null;
let departFormListenerAttached = false;

// Base de données des contacts (répertoire)
let contactsDatabase = [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    updateDashboard();
    updateGlobalDashboard();
    
    // Note: L'écouteur du formulaire de départ sera attaché dans showPage('depart-cles')
    // pour garantir que le formulaire existe au moment de l'attachement
    
    // Recherche en temps réel
    const searchNom = document.getElementById('search-nom');
    const searchEntreprise = document.getElementById('search-entreprise');
    const searchLocataire = document.getElementById('search-locataire');
    
    if (searchNom) searchNom.addEventListener('input', searchKeys);
    if (searchEntreprise) searchEntreprise.addEventListener('input', searchKeys);
    if (searchLocataire) searchLocataire.addEventListener('input', searchKeys);
    
    // Recherche rapide sur page d'accueil (temps réel)
    const quickSearchInput = document.getElementById('quick-search-input');
    if (quickSearchInput) {
        quickSearchInput.addEventListener('input', quickSearch);
        quickSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                quickSearch();
            }
        });
    }
    
    // Initialiser l'auto-complétion du répertoire
    initAutocomplete();
});

// Gestion de la base de données locale
function loadDatabase() {
    const saved = localStorage.getItem('keysDatabase');
    if (saved) {
        keysDatabase = JSON.parse(saved);
    }
    
    // Charger les équipes personnalisées ou utiliser les valeurs par défaut
    const savedTeams = localStorage.getItem('teamsConfig');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    } else {
        teams = JSON.parse(JSON.stringify(defaultTeams)); // Copie profonde
        saveTeams();
    }
    
    // Charger les contacts du répertoire
    const savedContacts = localStorage.getItem('contactsDatabase');
    if (savedContacts) {
        contactsDatabase = JSON.parse(savedContacts);
    }
}

function saveDatabase() {
    localStorage.setItem('keysDatabase', JSON.stringify(keysDatabase));
}

function saveContacts() {
    localStorage.setItem('contactsDatabase', JSON.stringify(contactsDatabase));
}

function saveTeams() {
    localStorage.setItem('teamsConfig', JSON.stringify(teams));
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Actions spécifiques selon la page
    if (pageId === 'dashboard') {
        updateDashboard();
    } else if (pageId === 'liste-cles') {
        displayKeysList();
    } else if (pageId === 'historique') {
        displayHistorique();
    } else if (pageId === 'repertoire') {
        displayRepertoire();
    } else if (pageId === 'depart-cles') {
        // Attendre que le DOM soit prêt
        setTimeout(() => {
            // Attacher l'écouteur de soumission du formulaire (une seule fois)
            const form = document.getElementById('depart-form');
            console.log('🔍 Recherche du formulaire depart-form:', form);
            
            if (form) {
                if (!departFormListenerAttached) {
                    // Ajouter l'écouteur seulement s'il n'est pas déjà attaché
                    form.addEventListener('submit', handleDepartSubmit);
                    departFormListenerAttached = true;
                    console.log('✅ Écouteur de formulaire départ attaché (première fois)');
                } else {
                    console.log('ℹ️ Écouteur déjà attaché, pas besoin de le réattacher');
                }
            } else {
                console.error('❌ Formulaire depart-form introuvable');
            }
            
            // Initialiser le canvas de signature pour le départ
            initSignatureCanvas('signature-canvas-depart', 'depart');
        }, 150);
    } else if (pageId === 'retour-cles') {
        // Réinitialiser la recherche
        const searchNom = document.getElementById('search-nom');
        const searchEntreprise = document.getElementById('search-entreprise');
        const searchLocataire = document.getElementById('search-locataire');
        const searchResults = document.getElementById('search-results');
        
        if (searchNom) searchNom.value = '';
        if (searchEntreprise) searchEntreprise.value = '';
        if (searchLocataire) searchLocataire.value = '';
        if (searchResults) searchResults.innerHTML = '';
    }
}

function goBack(pageId) {
    if (videoStream) {
        stopCamera();
    }
    showPage(pageId);
}

// Accès direct à l'historique depuis la page d'accueil
function showHistoryFromHome() {
    displayHistorique();
    showPage('historique');
}

// Sélection d'équipe
function selectTeam(team) {
    currentTeam = team;
    displayTeamUsers();
    showPage('user-selection');
}

// Afficher les boutons utilisateurs de l'équipe
function displayTeamUsers() {
    if (!currentTeam) return;
    
    const teamNameElement = document.getElementById('team-name');
    if (teamNameElement) {
        teamNameElement.textContent = teams[currentTeam].name + ' ' + teams[currentTeam].icon;
    }
    
    const userButtons = document.getElementById('user-buttons');
    if (userButtons) {
        userButtons.innerHTML = '';
        
        teams[currentTeam].members.forEach(member => {
            const btn = document.createElement('button');
            btn.className = 'user-btn';
            btn.textContent = member;
            btn.onclick = () => selectUser(member);
            userButtons.appendChild(btn);
        });
    }
}

// Sélection d'utilisateur
function selectUser(userName) {
    currentUser = {
        name: userName,
        team: currentTeam,
        teamName: teams[currentTeam].name
    };
    
    const currentUserElement = document.getElementById('current-user');
    if (currentUserElement) {
        currentUserElement.textContent = 
            `${teams[currentTeam].icon} ${userName} - ${teams[currentTeam].name}`;
    }
    
    showPage('dashboard');
}

// Déconnexion
function logout() {
    currentUser = null;
    currentTeam = null;
    showPage('team-selection');
}

// Mise à jour du tableau de bord
function updateDashboard() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const activeKeys = keysDatabase.filter(k => !k.returnDate);
    
    let late1 = 0, late3 = 0, late7 = 0;
    
    activeKeys.forEach(key => {
        const returnDate = new Date(key.expectedReturnDate);
        returnDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 7) late7++;
        else if (diffDays >= 3) late3++;
        else if (diffDays >= 1) late1++;
    });
    
    const keysOutElement = document.getElementById('keys-out');
    const keysLate1Element = document.getElementById('keys-late-1');
    const keysLate3Element = document.getElementById('keys-late-3');
    const keysLate7Element = document.getElementById('keys-late-7');
    
    if (keysOutElement) keysOutElement.textContent = activeKeys.length;
    if (keysLate1Element) keysLate1Element.textContent = late1;
    if (keysLate3Element) keysLate3Element.textContent = late3;
    if (keysLate7Element) keysLate7Element.textContent = late7;
}

// Mise à jour du tableau de bord global (page d'accueil)
function updateGlobalDashboard() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const activeKeys = keysDatabase.filter(k => !k.returnDate);
    
    let late1 = 0, late3 = 0, late7 = 0;
    
    activeKeys.forEach(key => {
        const returnDate = new Date(key.expectedReturnDate);
        returnDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 7) late7++;
        else if (diffDays >= 3) late3++;
        else if (diffDays >= 1) late1++;
    });
    
    const globalKeysOutElement = document.getElementById('global-keys-out');
    const globalKeysLate1Element = document.getElementById('global-keys-late-1');
    const globalKeysLate3Element = document.getElementById('global-keys-late-3');
    const globalKeysLate7Element = document.getElementById('global-keys-late-7');
    
    if (globalKeysOutElement) globalKeysOutElement.textContent = activeKeys.length;
    if (globalKeysLate1Element) globalKeysLate1Element.textContent = late1;
    if (globalKeysLate3Element) globalKeysLate3Element.textContent = late3;
    if (globalKeysLate7Element) globalKeysLate7Element.textContent = late7;
}

// Gestion de la caméra
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: 'environment', // Caméra arrière sur tablette
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('video');
        if (video) {
            video.srcObject = videoStream;
            video.style.display = 'block';
        }
        
        const startCamera = document.getElementById('start-camera');
        const takePhoto = document.getElementById('take-photo');
        const photoPreview = document.getElementById('photo-preview');
        const retakePhoto = document.getElementById('retake-photo');
        
        if (startCamera) startCamera.style.display = 'none';
        if (takePhoto) takePhoto.style.display = 'inline-block';
        if (photoPreview) photoPreview.style.display = 'none';
        if (retakePhoto) retakePhoto.style.display = 'none';
    } catch (error) {
        alert('Erreur d\'accès à la caméra : ' + error.message);
    }
}

function takePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        currentPhoto = canvas.toDataURL('image/jpeg', 0.8);
        
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.src = currentPhoto;
            preview.style.display = 'block';
        }
        
        video.style.display = 'none';
        
        const takePhotoBtn = document.getElementById('take-photo');
        const retakePhotoBtn = document.getElementById('retake-photo');
        
        if (takePhotoBtn) takePhotoBtn.style.display = 'none';
        if (retakePhotoBtn) retakePhotoBtn.style.display = 'inline-block';
        
        stopCamera();
    }
}

function retakePhoto() {
    currentPhoto = null;
    startCamera();
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Gestion des signatures électroniques
let signatureCanvases = {};

function initSignatureCanvas(canvasId, contextName) {
    console.log('initSignatureCanvas appelée avec:', { canvasId, contextName });
    
    const canvas = document.getElementById(canvasId);
    console.log('Canvas récupéré:', canvas);
    
    if (!canvas) {
        console.error('Canvas NON TROUVÉ:', canvasId);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Contexte 2D récupéré:', ctx);
    
    // Ajuster la taille du canvas à son conteneur
    const rect = canvas.getBoundingClientRect();
    console.log('Dimensions avant ajustement:', rect);
    
    // Si le canvas n'a pas de largeur (modal caché), utiliser la largeur du parent
    let canvasWidth = rect.width;
    if (canvasWidth === 0) {
        const parent = canvas.parentElement;
        if (parent) {
            const parentRect = parent.getBoundingClientRect();
            canvasWidth = parentRect.width || 500; // Fallback à 500px
            console.log('Canvas invisible, utilisation largeur parent:', canvasWidth);
        }
    }
    
    canvas.width = canvasWidth || 500;
    canvas.height = 200;
    
    console.log('Dimensions après ajustement:', { width: canvas.width, height: canvas.height });
    
    // Configuration du style de dessin
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Fonction pour obtenir les coordonnées (souris ou tactile)
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }
    
    // Événements souris
    canvas.addEventListener('mousedown', (e) => {
        console.log('MOUSEDOWN détecté sur canvas:', contextName);
        isDrawing = true;
        const coords = getCoordinates(e);
        console.log('Coordonnées:', coords);
        lastX = coords.x;
        lastY = coords.y;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        console.log('MOUSEMOVE - dessin en cours');
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        lastX = coords.x;
        lastY = coords.y;
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // Événements tactiles
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const coords = getCoordinates(e);
        lastX = coords.x;
        lastY = coords.y;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        lastX = coords.x;
        lastY = coords.y;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDrawing = false;
    });
    
    // Stocker le contexte
    signatureCanvases[contextName] = { canvas, ctx, hasSignature: false };
    console.log('Canvas stocké dans signatureCanvases[' + contextName + ']');
    
    // Marquer qu'il y a une signature dès qu'on dessine
    const markAsSigned = () => {
        signatureCanvases[contextName].hasSignature = true;
        console.log('Signature marquée comme présente pour:', contextName);
    };
    canvas.addEventListener('mouseup', markAsSigned);
    canvas.addEventListener('touchend', markAsSigned);
    
    console.log('=== initSignatureCanvas TERMINÉE pour', contextName, '===');
    console.log('Canvas dimensions finales:', canvas.width, 'x', canvas.height);
    console.log('Canvas style:', window.getComputedStyle(canvas));
    
    return { canvas, ctx };
    
    return { canvas, ctx };
}

function clearSignature(contextName) {
    const canvasData = signatureCanvases[contextName];
    if (canvasData) {
        const { canvas, ctx } = canvasData;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvasData.hasSignature = false;
    }
}

function getSignatureData(contextName) {
    const canvasData = signatureCanvases[contextName];
    if (canvasData && canvasData.hasSignature) {
        return canvasData.canvas.toDataURL('image/png');
    }
    return null;
}

function isSignatureEmpty(contextName) {
    const canvasData = signatureCanvases[contextName];
    return !canvasData || !canvasData.hasSignature;
}

// Note: Le canvas de signature pour le départ est initialisé dans showPage() quand la page 'depart-cles' est affichée

// Soumission du formulaire de départ
function handleDepartSubmit(e) {
    console.log('🔥 handleDepartSubmit appelée !');
    e.preventDefault();
    
    if (!currentPhoto) {
        alert('Veuillez prendre une photo des clés avant d\'enregistrer.');
        return;
    }
    
    // Vérifier la signature
    if (isSignatureEmpty('depart')) {
        alert('⚠️ La signature est obligatoire. Veuillez signer dans le cadre prévu.');
        return;
    }
    
    const nomElement = document.getElementById('nom');
    const prenomElement = document.getElementById('prenom');
    const entrepriseElement = document.getElementById('entreprise');
    const telephoneElement = document.getElementById('telephone');
    const emailElement = document.getElementById('email');
    const exLocataireElement = document.getElementById('ex-locataire');
    const adresseBienElement = document.getElementById('adresse-bien');
    const referenceLotElement = document.getElementById('reference-lot');
    const dateRetourElement = document.getElementById('date-retour');
    const commentairesElement = document.getElementById('commentaires');
    
    // Récupérer la signature
    const signature = getSignatureData('depart');
    
    const formData = {
        id: Date.now(),
        departDate: new Date().toISOString(),
        expectedReturnDate: dateRetourElement ? dateRetourElement.value : '',
        returnDate: null,
        person: {
            nom: nomElement ? nomElement.value : '',
            prenom: prenomElement ? prenomElement.value : '',
            entreprise: entrepriseElement ? entrepriseElement.value : '',
            telephone: telephoneElement ? telephoneElement.value : '',
            email: emailElement ? emailElement.value : ''
        },
        bien: {
            exLocataire: exLocataireElement ? exLocataireElement.value : '',
            adresse: adresseBienElement ? adresseBienElement.value : '',
            reference: referenceLotElement ? referenceLotElement.value : ''
        },
        commentaires: commentairesElement ? commentairesElement.value : '',
        photo: currentPhoto,
        signature: signature, // Ajout de la signature
        registeredBy: currentUser.name,
        registeredByTeam: currentUser.teamName
    };
    
    keysDatabase.push(formData);
    saveDatabase();
    
    alert('✅ Départ de clés enregistré avec succès !');
    
    // Mettre à jour le tableau de bord global
    updateGlobalDashboard();
    
    // Réinitialiser le formulaire
    const form = document.getElementById('depart-form');
    if (form) form.reset();
    currentPhoto = null;
    
    // Réinitialiser la signature
    clearSignature('depart');
    
    const photoPreview = document.getElementById('photo-preview');
    const startCameraBtn = document.getElementById('start-camera');
    const retakePhotoBtn = document.getElementById('retake-photo');
    
    if (photoPreview) photoPreview.style.display = 'none';
    if (startCameraBtn) startCameraBtn.style.display = 'inline-block';
    if (retakePhotoBtn) retakePhotoBtn.style.display = 'none';
    
    showPage('dashboard');
}

// Recherche de clés
function searchKeys() {
    const searchNomElement = document.getElementById('search-nom');
    const searchEntrepriseElement = document.getElementById('search-entreprise');
    const searchLocataireElement = document.getElementById('search-locataire');
    
    const searchNom = searchNomElement ? searchNomElement.value.toLowerCase() : '';
    const searchEntreprise = searchEntrepriseElement ? searchEntrepriseElement.value.toLowerCase() : '';
    const searchLocataire = searchLocataireElement ? searchLocataireElement.value.toLowerCase() : '';
    
    const results = keysDatabase.filter(key => {
        if (key.returnDate) return false; // Ignorer les clés déjà revenues
        
        const matchNom = !searchNom || 
            key.person.nom.toLowerCase().includes(searchNom) ||
            key.person.prenom.toLowerCase().includes(searchNom);
        
        const matchEntreprise = !searchEntreprise ||
            key.person.entreprise.toLowerCase().includes(searchEntreprise);
        
        const matchLocataire = !searchLocataire ||
            key.bien.exLocataire.toLowerCase().includes(searchLocataire);
        
        return matchNom && matchEntreprise && matchLocataire;
    });
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Aucun résultat trouvé</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(key => createKeyCard(key, true)).join('');
}

// Création d'une carte de clé
function createKeyCard(key, showReturnButton = false) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const returnDate = new Date(key.expectedReturnDate);
    returnDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-ok';
    let statusText = 'Dans les temps';
    let cardClass = '';
    
    if (diffDays >= 7) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours ⚠️`;
        cardClass = 'late-7';
    } else if (diffDays >= 3) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours`;
        cardClass = 'late-3';
    } else if (diffDays >= 1) {
        statusClass = 'status-warning';
        statusText = `Retard de ${diffDays} jour(s)`;
        cardClass = 'late-1';
    }
    
    const departDateFormatted = new Date(key.departDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const expectedReturnFormatted = new Date(key.expectedReturnDate).toLocaleDateString('fr-FR');
    
    return `
        <div class="key-card ${cardClass}">
            <div class="key-card-header">
                <div class="key-card-title">
                    ${key.person.prenom} ${key.person.nom}
                    ${key.person.entreprise ? `(${key.person.entreprise})` : ''}
                </div>
                <div class="key-card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="key-card-details">
                <div class="detail-item">
                    <div class="detail-label">Ex-locataire</div>
                    <div class="detail-value">${key.bien.exLocataire}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Adresse du bien</div>
                    <div class="detail-value">${key.bien.adresse}</div>
                </div>
                ${key.bien.reference ? `
                <div class="detail-item">
                    <div class="detail-label">Référence / Lot</div>
                    <div class="detail-value">${key.bien.reference}</div>
                </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Téléphone</div>
                    <div class="detail-value">${key.person.telephone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${key.person.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date de départ</div>
                    <div class="detail-value">${departDateFormatted}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Retour prévu</div>
                    <div class="detail-value">${expectedReturnFormatted}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Enregistré par</div>
                    <div class="detail-value">${key.registeredBy} (${key.registeredByTeam})</div>
                </div>
            </div>
            
            ${key.commentaires ? `
            <div class="detail-item" style="margin-top: 15px;">
                <div class="detail-label">Commentaires</div>
                <div class="detail-value">${key.commentaires}</div>
            </div>
            ` : ''}
            
            <div class="key-card-photo">
                <img src="${key.photo}" alt="Photo des clés">
            </div>
            
            ${showReturnButton ? `
            <div class="key-card-actions">
                <button class="btn btn-success" onclick="openReturnModal(${key.id})">
                    ✅ Marquer comme retourné
                </button>
            </div>
            ` : ''}
        </div>
    `;
}

// Affichage de la liste des clés sorties
function displayKeysList() {
    const activeKeys = keysDatabase.filter(k => !k.returnDate);
    const container = document.getElementById('keys-list');
    
    if (!container) return;
    
    if (activeKeys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">Aucune clé en circulation actuellement</div>
            </div>
        `;
        return;
    }
    
    // Trier par date de retour prévue (les plus en retard en premier)
    activeKeys.sort((a, b) => new Date(a.expectedReturnDate) - new Date(b.expectedReturnDate));
    
    container.innerHTML = activeKeys.map(key => createKeyCard(key, true)).join('');
}

// Affichage de l'historique
function displayHistorique() {
    const returnedKeys = keysDatabase.filter(k => k.returnDate);
    const container = document.getElementById('historique-list');
    
    if (!container) return;
    
    if (returnedKeys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div class="empty-state-text">Aucun historique disponible</div>
            </div>
        `;
        return;
    }
    
    // Trier par date de retour (plus récent en premier)
    returnedKeys.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
    
    container.innerHTML = returnedKeys.map(key => {
        const returnDateFormatted = new Date(key.returnDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="history-card-compact" data-key-id="${key.id}">
                <!-- En-tête compact cliquable -->
                <div class="history-header-compact" onclick="toggleHistoryDetails(${key.id})">
                    <div class="history-main-info">
                        <span class="history-icon">🔑</span>
                        <div class="history-primary">
                            <strong>${key.person.prenom} ${key.person.nom}</strong>
                            <span class="history-separator">•</span>
                            <span class="history-exlocataire">${key.bien.exLocataire}</span>
                            <span class="history-separator">•</span>
                            <span class="history-date">${returnDateFormatted}</span>
                        </div>
                    </div>
                    <span class="toggle-icon" id="toggle-history-${key.id}">▼</span>
                </div>
                
                <!-- Détails cachés par défaut -->
                <div class="history-details" id="details-history-${key.id}" style="display: none;">
                    <!-- Section 1 : Informations principales -->
                    <div class="history-section">
                        <h4 class="history-section-title">📋 Informations du bien</h4>
                        <div class="history-info-grid">
                            <div class="history-detail-item">
                                <span class="history-detail-label">Ex-locataire :</span>
                                <span class="history-detail-value">${key.bien.exLocataire}</span>
                            </div>
                            <div class="history-detail-item">
                                <span class="history-detail-label">Adresse :</span>
                                <span class="history-detail-value">${key.bien.adresse}</span>
                            </div>
                            ${key.bien.reference ? `
                            <div class="history-detail-item">
                                <span class="history-detail-label">Référence :</span>
                                <span class="history-detail-value">${key.bien.reference}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Section 2 : Personnes impliquées -->
                    <div class="history-section">
                        <h4 class="history-section-title">👥 Personnes</h4>
                        <div class="history-info-grid">
                            <div class="history-detail-item">
                                <span class="history-detail-label">Réceptionné par :</span>
                                <span class="history-detail-value">${key.returnedBy} (${key.returnedByTeam})</span>
                            </div>
                            ${key.returnedPersonInfo ? `
                            <div class="history-detail-item">
                                <span class="history-detail-label">Ramené par :</span>
                                <span class="history-detail-value">${key.returnedPersonInfo.prenom} ${key.returnedPersonInfo.nom}<br><small>📱 ${key.returnedPersonInfo.telephone}</small></span>
                            </div>
                            ` : ''}
                            <div class="history-detail-item">
                                <span class="history-detail-label">Date de retour :</span>
                                <span class="history-detail-value">${returnDateFormatted}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Section 3 : Photo -->
                    <div class="history-section">
                        <h4 class="history-section-title">📷 Photo des clés</h4>
                        <div class="history-photo-container">
                            <img src="${key.photo}" alt="Photo des clés" onclick="showPhotoModal(this.src)" class="history-photo">
                        </div>
                    </div>
                    
                    <!-- Section 4 : Signatures -->
                    ${key.signature || (key.returnedPersonInfo && key.returnedPersonInfo.signature) ? `
                    <div class="history-section">
                        <h4 class="history-section-title">✍️ Signatures</h4>
                        <div class="history-signatures-grid">
                            ${key.signature ? `
                            <div class="history-signature-item">
                                <div class="history-signature-label">Signature au départ</div>
                                <img src="${key.signature}" alt="Signature au départ" class="history-signature-img">
                                <div class="history-signature-name">${key.person.prenom} ${key.person.nom}</div>
                            </div>
                            ` : ''}
                            ${key.returnedPersonInfo && key.returnedPersonInfo.signature ? `
                            <div class="history-signature-item">
                                <div class="history-signature-label">Signature au retour</div>
                                <img src="${key.returnedPersonInfo.signature}" alt="Signature au retour" class="history-signature-img">
                                <div class="history-signature-name">${key.returnedPersonInfo.prenom} ${key.returnedPersonInfo.nom}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Section 5 : Actions -->
                    <div class="history-section">
                        <div class="history-actions">
                            <button class="btn-history-action btn-edit" onclick="openEditDateModal(${key.id})">
                                📅 Modifier la date
                            </button>
                            <button class="btn-history-action btn-delete" onclick="confirmDeleteKey(${key.id})">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour ouvrir/fermer les détails d'une clé dans l'historique
function toggleHistoryDetails(keyId) {
    const details = document.getElementById('details-history-' + keyId);
    const toggle = document.getElementById('toggle-history-' + keyId);
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        toggle.textContent = '▲';
        toggle.classList.add('open');
    } else {
        details.style.display = 'none';
        toggle.textContent = '▼';
        toggle.classList.remove('open');
    }
}

// Filtrage de l'historique
function filterHistorique() {
    const filterElement = document.getElementById('filter-historique');
    const filter = filterElement ? filterElement.value.toLowerCase() : '';
    
    if (!filter) {
        displayHistorique();
        return;
    }
    
    const filtered = keysDatabase.filter(key => {
        if (!key.returnDate) return false;
        
        return key.person.nom.toLowerCase().includes(filter) ||
            key.person.prenom.toLowerCase().includes(filter) ||
            key.person.entreprise.toLowerCase().includes(filter) ||
            key.bien.exLocataire.toLowerCase().includes(filter) ||
            key.bien.adresse.toLowerCase().includes(filter);
    });
    
    const container = document.getElementById('historique-list');
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Aucun résultat trouvé</div>
            </div>
        `;
        return;
    }
    
    filtered.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
    
    container.innerHTML = filtered.map(key => {
        const returnDateFormatted = new Date(key.returnDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="key-card">
                <div class="key-card-header">
                    <div class="key-card-title">
                        ${key.person.prenom} ${key.person.nom}
                        ${key.person.entreprise ? `(${key.person.entreprise})` : ''}
                    </div>
                    <div class="key-card-status status-ok">✅ Retourné</div>
                </div>
                
                <div class="key-card-details">
                    <div class="detail-item">
                        <div class="detail-label">Ex-locataire</div>
                        <div class="detail-value">${key.bien.exLocataire}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Adresse du bien</div>
                        <div class="detail-value">${key.bien.adresse}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date de retour</div>
                        <div class="detail-value">${returnDateFormatted}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Réceptionné par</div>
                        <div class="detail-value">${key.returnedBy} (${key.returnedByTeam})</div>
                    </div>
                    ${key.returnedPersonInfo ? `
                    <div class="detail-item">
                        <div class="detail-label">Ramené par</div>
                        <div class="detail-value">${key.returnedPersonInfo.prenom} ${key.returnedPersonInfo.nom}<br>📱 ${key.returnedPersonInfo.telephone}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="key-card-photo">
                    <img src="${key.photo}" alt="Photo des clés">
                </div>
                
                <div class="key-card-actions" style="text-align: center; margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-edit-date" onclick="openEditDateModal(${key.id})">
                        📅 Modifier la date de retour
                    </button>
                    <button class="btn-delete-key" onclick="confirmDeleteKey(${key.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Afficher/masquer le champ de texte selon le type de filtre sélectionné
function updateFilterField() {
    const filterType = document.getElementById('filter-type')?.value;
    const textContainer = document.getElementById('filter-text-container');
    const textInput = document.getElementById('filter-text-value');
    
    if (filterType && filterType !== '') {
        textContainer.style.display = 'flex';
        textInput.focus();
    } else {
        textContainer.style.display = 'none';
        textInput.value = '';
    }
}

// Afficher/masquer les champs de dates selon le type de filtre sélectionné
function updateDateFields() {
    const dateType = document.getElementById('filter-date-type')?.value;
    const startContainer = document.getElementById('filter-date-start-container');
    const endContainer = document.getElementById('filter-date-end-container');
    const startInput = document.getElementById('filter-date-start');
    const endInput = document.getElementById('filter-date-end');
    
    if (dateType && dateType !== '') {
        startContainer.style.display = 'flex';
        endContainer.style.display = 'flex';
    } else {
        startContainer.style.display = 'none';
        endContainer.style.display = 'none';
        startInput.value = '';
        endInput.value = '';
    }
}

// Filtrage avancé de l'historique simplifié
function filterHistoriqueAdvanced() {
    // Récupérer le type de filtre texte
    const filterType = document.getElementById('filter-type')?.value || '';
    const filterTextValue = document.getElementById('filter-text-value')?.value.toLowerCase().trim() || '';
    
    // Récupérer le type de filtre date
    const filterDateType = document.getElementById('filter-date-type')?.value || '';
    const filterDateStart = document.getElementById('filter-date-start')?.value || '';
    const filterDateEnd = document.getElementById('filter-date-end')?.value || '';
    
    // Si aucun filtre n'est appliqué, afficher tout
    const hasFilters = (filterType && filterTextValue) || (filterDateType && (filterDateStart || filterDateEnd));
    
    if (!hasFilters) {
        displayHistorique();
        return;
    }
    
    // Filtrer les clés retournées
    const filtered = keysDatabase.filter(key => {
        if (!key.returnDate) return false;
        
        // Filtre texte selon le type sélectionné
        if (filterType && filterTextValue) {
            let textMatch = false;
            
            switch (filterType) {
                case 'person':
                    // Personne qui a pris les clés
                    textMatch = key.person.nom.toLowerCase().includes(filterTextValue) ||
                               key.person.prenom.toLowerCase().includes(filterTextValue);
                    break;
                    
                case 'entreprise':
                    // Entreprise
                    textMatch = key.person.entreprise.toLowerCase().includes(filterTextValue);
                    break;
                    
                case 'ex-locataire':
                    // Ex-locataire
                    textMatch = key.bien.exLocataire.toLowerCase().includes(filterTextValue);
                    break;
                    
                case 'adresse':
                    // Adresse du bien
                    textMatch = key.bien.adresse.toLowerCase().includes(filterTextValue);
                    break;
                    
                case 'returned-person':
                    // Personne qui a ramené
                    if (key.returnedPersonInfo) {
                        textMatch = key.returnedPersonInfo.nom.toLowerCase().includes(filterTextValue) ||
                                   key.returnedPersonInfo.prenom.toLowerCase().includes(filterTextValue);
                    }
                    break;
                    
                case 'receptionnaire':
                    // Réceptionné par
                    textMatch = key.returnedBy.toLowerCase().includes(filterTextValue);
                    break;
            }
            
            if (!textMatch) return false;
        }
        
        // Filtre de dates selon le type sélectionné
        if (filterDateType && (filterDateStart || filterDateEnd)) {
            let dateToCheck;
            
            if (filterDateType === 'depart') {
                dateToCheck = new Date(key.departDate);
            } else if (filterDateType === 'return') {
                dateToCheck = new Date(key.returnDate);
            }
            
            if (dateToCheck) {
                dateToCheck.setHours(0, 0, 0, 0);
                
                if (filterDateStart) {
                    const startDate = new Date(filterDateStart);
                    startDate.setHours(0, 0, 0, 0);
                    if (dateToCheck < startDate) return false;
                }
                
                if (filterDateEnd) {
                    const endDate = new Date(filterDateEnd);
                    endDate.setHours(23, 59, 59, 999);
                    if (dateToCheck > endDate) return false;
                }
            }
        }
        
        return true;
    });
    
    const container = document.getElementById('historique-list');
    
    if (!container) return;
    
    // Affichage des résultats
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Aucun résultat trouvé pour ces critères</div>
                <button class="btn btn-secondary" onclick="clearFiltersHistorique()" style="margin-top: 20px;">
                    🔄 Réinitialiser les filtres
                </button>
            </div>
        `;
        return;
    }
    
    // Trier par date de retour (plus récent en premier)
    filtered.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
    
    // Afficher le nombre de résultats
    const resultCount = document.createElement('div');
    resultCount.className = 'filter-results-count';
    resultCount.textContent = `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
    
    container.innerHTML = `
        <div class="filter-results-count">${filtered.length} résultat${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}</div>
    ` + filtered.map(key => {
        const returnDateFormatted = new Date(key.returnDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="key-card">
                <div class="key-card-header">
                    <div class="key-card-title">
                        ${key.person.prenom} ${key.person.nom}
                        ${key.person.entreprise ? `(${key.person.entreprise})` : ''}
                    </div>
                    <div class="key-card-status status-ok">✅ Retourné</div>
                </div>
                
                <div class="key-card-details">
                    <div class="detail-item">
                        <div class="detail-label">Ex-locataire</div>
                        <div class="detail-value">${key.bien.exLocataire}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Adresse du bien</div>
                        <div class="detail-value">${key.bien.adresse}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date de retour</div>
                        <div class="detail-value">${returnDateFormatted}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Réceptionné par</div>
                        <div class="detail-value">${key.returnedBy} (${key.returnedByTeam})</div>
                    </div>
                    ${key.returnedPersonInfo ? `
                    <div class="detail-item">
                        <div class="detail-label">Ramené par</div>
                        <div class="detail-value">${key.returnedPersonInfo.prenom} ${key.returnedPersonInfo.nom}<br>📱 ${key.returnedPersonInfo.telephone}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="key-card-photo">
                    <img src="${key.photo}" alt="Photo des clés">
                </div>
                
                <div class="key-card-actions" style="text-align: center; margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-edit-date" onclick="openEditDateModal(${key.id})">
                        📅 Modifier la date de retour
                    </button>
                    <button class="btn-delete-key" onclick="confirmDeleteKey(${key.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Réinitialiser tous les filtres de l'historique
function clearFiltersHistorique() {
    // Vider les champs de filtre simplifiés
    const filterType = document.getElementById('filter-type');
    const filterTextValue = document.getElementById('filter-text-value');
    const filterDateType = document.getElementById('filter-date-type');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    
    // Réinitialiser tous les champs
    if (filterType) filterType.value = '';
    if (filterTextValue) filterTextValue.value = '';
    if (filterDateType) filterDateType.value = '';
    if (filterDateStart) filterDateStart.value = '';
    if (filterDateEnd) filterDateEnd.value = '';
    
    // Masquer les champs conditionnels
    const textContainer = document.getElementById('filter-text-container');
    const startContainer = document.getElementById('filter-date-start-container');
    const endContainer = document.getElementById('filter-date-end-container');
    
    if (textContainer) textContainer.style.display = 'none';
    if (startContainer) startContainer.style.display = 'none';
    if (endContainer) endContainer.style.display = 'none';
    
    // Réafficher tout l'historique
    displayHistorique();
    
    // Message de confirmation
    showToast('🔄 Filtres réinitialisés');
}

// Gestion des filtres pour la Liste des Clés Sorties
function updateFilterFieldKeys() {
    const filterType = document.getElementById('filter-keys-type')?.value;
    const textContainer = document.getElementById('filter-keys-text-container');
    const textInput = document.getElementById('filter-keys-text-value');
    
    if (filterType && filterType !== '') {
        textContainer.style.display = 'flex';
        textInput.focus();
    } else {
        textContainer.style.display = 'none';
        textInput.value = '';
    }
}

function updateDateFieldsKeys() {
    const dateType = document.getElementById('filter-keys-date-type')?.value;
    const startContainer = document.getElementById('filter-keys-date-start-container');
    const endContainer = document.getElementById('filter-keys-date-end-container');
    const startInput = document.getElementById('filter-keys-date-start');
    const endInput = document.getElementById('filter-keys-date-end');
    
    if (dateType && dateType !== '') {
        startContainer.style.display = 'flex';
        endContainer.style.display = 'flex';
    } else {
        startContainer.style.display = 'none';
        endContainer.style.display = 'none';
        startInput.value = '';
        endInput.value = '';
    }
}

function filterKeysList() {
    // Récupérer le type de filtre texte
    const filterType = document.getElementById('filter-keys-type')?.value || '';
    const filterTextValue = document.getElementById('filter-keys-text-value')?.value.toLowerCase().trim() || '';
    
    // Récupérer le type de filtre date
    const filterDateType = document.getElementById('filter-keys-date-type')?.value || '';
    const filterDateStart = document.getElementById('filter-keys-date-start')?.value || '';
    const filterDateEnd = document.getElementById('filter-keys-date-end')?.value || '';
    
    // Récupérer le filtre de statut
    const filterStatus = document.getElementById('filter-keys-status')?.value || '';
    
    // Si aucun filtre n'est appliqué, afficher tout
    const hasFilters = (filterType && filterTextValue) || 
                       (filterDateType && (filterDateStart || filterDateEnd)) ||
                       filterStatus;
    
    if (!hasFilters) {
        displayKeysList();
        return;
    }
    
    // Filtrer les clés sorties (non retournées)
    const filtered = keysDatabase.filter(key => {
        if (key.returnDate) return false; // Ignorer les clés déjà retournées
        
        // Filtre texte selon le type sélectionné
        if (filterType && filterTextValue) {
            let textMatch = false;
            
            switch (filterType) {
                case 'person':
                    textMatch = key.person.nom.toLowerCase().includes(filterTextValue) ||
                               key.person.prenom.toLowerCase().includes(filterTextValue);
                    break;
                case 'entreprise':
                    textMatch = key.person.entreprise.toLowerCase().includes(filterTextValue);
                    break;
                case 'ex-locataire':
                    textMatch = key.bien.exLocataire.toLowerCase().includes(filterTextValue);
                    break;
                case 'adresse':
                    textMatch = key.bien.adresse.toLowerCase().includes(filterTextValue);
                    break;
            }
            
            if (!textMatch) return false;
        }
        
        // Filtre de dates selon le type sélectionné
        if (filterDateType && (filterDateStart || filterDateEnd)) {
            let dateToCheck;
            
            if (filterDateType === 'depart') {
                dateToCheck = new Date(key.departDate);
            } else if (filterDateType === 'return-expected') {
                dateToCheck = new Date(key.expectedReturnDate);
            }
            
            if (dateToCheck) {
                dateToCheck.setHours(0, 0, 0, 0);
                
                if (filterDateStart) {
                    const startDate = new Date(filterDateStart);
                    startDate.setHours(0, 0, 0, 0);
                    if (dateToCheck < startDate) return false;
                }
                
                if (filterDateEnd) {
                    const endDate = new Date(filterDateEnd);
                    endDate.setHours(23, 59, 59, 999);
                    if (dateToCheck > endDate) return false;
                }
            }
        }
        
        // Filtre de statut (retard)
        if (filterStatus) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const returnDate = new Date(key.expectedReturnDate);
            returnDate.setHours(0, 0, 0, 0);
            const diffTime = today - returnDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            switch (filterStatus) {
                case 'ok':
                    if (diffDays >= 1) return false;
                    break;
                case 'late1':
                    if (diffDays < 1 || diffDays >= 3) return false;
                    break;
                case 'late3':
                    if (diffDays < 3 || diffDays >= 7) return false;
                    break;
                case 'late7':
                    if (diffDays < 7) return false;
                    break;
            }
        }
        
        return true;
    });
    
    const container = document.getElementById('keys-list');
    
    if (!container) return;
    
    // Affichage des résultats
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Aucun résultat trouvé pour ces critères</div>
                <button class="btn btn-secondary" onclick="clearFiltersKeysList()" style="margin-top: 20px;">
                    🔄 Réinitialiser les filtres
                </button>
            </div>
        `;
        return;
    }
    
    // Trier par date de retour prévue (les plus en retard en premier)
    filtered.sort((a, b) => new Date(a.expectedReturnDate) - new Date(b.expectedReturnDate));
    
    // Afficher le nombre de résultats
    container.innerHTML = `
        <div class="filter-results-count">${filtered.length} résultat${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}</div>
    ` + filtered.map(key => createKeyCard(key, true)).join('');
}

function clearFiltersKeysList() {
    // Vider les champs de filtre
    const filterType = document.getElementById('filter-keys-type');
    const filterTextValue = document.getElementById('filter-keys-text-value');
    const filterDateType = document.getElementById('filter-keys-date-type');
    const filterDateStart = document.getElementById('filter-keys-date-start');
    const filterDateEnd = document.getElementById('filter-keys-date-end');
    const filterStatus = document.getElementById('filter-keys-status');
    
    // Réinitialiser tous les champs
    if (filterType) filterType.value = '';
    if (filterTextValue) filterTextValue.value = '';
    if (filterDateType) filterDateType.value = '';
    if (filterDateStart) filterDateStart.value = '';
    if (filterDateEnd) filterDateEnd.value = '';
    if (filterStatus) filterStatus.value = '';
    
    // Masquer les champs conditionnels
    const textContainer = document.getElementById('filter-keys-text-container');
    const startContainer = document.getElementById('filter-keys-date-start-container');
    const endContainer = document.getElementById('filter-keys-date-end-container');
    
    if (textContainer) textContainer.style.display = 'none';
    if (startContainer) startContainer.style.display = 'none';
    if (endContainer) endContainer.style.display = 'none';
    
    // Réafficher toutes les clés sorties
    displayKeysList();
    
    // Message de confirmation
    showToast('🔄 Filtres réinitialisés');
}

// Modal de confirmation de retour
function openReturnModal(keyId) {
    selectedKeyForReturn = keysDatabase.find(k => k.id === keyId);
    
    if (!selectedKeyForReturn) return;
    
    // Utiliser le modal de validation complet avec formulaire
    const keySummary = document.getElementById('quick-return-key-info');
    if (keySummary) {
        keySummary.innerHTML = `
            <h4>Clé à rendre :</h4>
            <p><strong>Sortie par :</strong> ${selectedKeyForReturn.person.prenom} ${selectedKeyForReturn.person.nom} ${selectedKeyForReturn.person.entreprise ? '(' + selectedKeyForReturn.person.entreprise + ')' : ''}</p>
            <p><strong>Bien :</strong> ${selectedKeyForReturn.bien.adresse}</p>
            <p><strong>Ex-locataire :</strong> ${selectedKeyForReturn.bien.exLocataire}</p>
            <div class="key-card-photo" style="margin-top: 15px;">
                <p><strong>Photo des clés à comparer :</strong></p>
                <img src="${selectedKeyForReturn.photo}" alt="Photo des clés" style="max-width: 100%; border-radius: 10px;">
            </div>
        `;
    }
    
    // Réinitialiser le formulaire
    const nomInput = document.getElementById('return-person-nom');
    const prenomInput = document.getElementById('return-person-prenom');
    const telephoneInput = document.getElementById('return-person-telephone');
    const teamSelect = document.getElementById('return-receptionnaire-team');
    const memberSelect = document.getElementById('return-receptionnaire-name');
    
    if (nomInput) nomInput.value = '';
    if (prenomInput) prenomInput.value = '';
    if (telephoneInput) telephoneInput.value = '';
    if (teamSelect) teamSelect.value = '';
    if (memberSelect) {
        memberSelect.value = '';
        memberSelect.disabled = true;
    }
    
    // Afficher le modal de validation complet
    const modal = document.getElementById('modal-quick-return');
    if (modal) {
        modal.classList.add('active');
        
        // Initialiser le canvas de signature après un délai pour s'assurer que le modal est visible
        setTimeout(() => {
            console.log('🎨 Initialisation du canvas de signature pour le retour...');
            initSignatureCanvas('signature-canvas-return', 'return');
            console.log('✅ Canvas de signature initialisé');
        }, 300);
    }
}

function closeModal() {
    // Fermer le modal de validation complet
    closeQuickReturnModal();
    selectedKeyForReturn = null;
}

function confirmReturn() {
    // Rediriger vers la fonction unifiée de validation
    confirmQuickReturn();
}

// Fermer le modal en cliquant en dehors
const modalRetour = document.getElementById('modal-retour');
if (modalRetour) {
    modalRetour.addEventListener('click', (e) => {
        if (e.target.id === 'modal-retour') {
            closeModal();
        }
    });
}

// Recherche rapide depuis la page d'accueil
function quickSearch() {
    const searchInput = document.getElementById('quick-search-input');
    const resultsContainer = document.getElementById('quick-search-results');
    
    if (!searchInput || !resultsContainer) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Si la recherche est vide, ne rien afficher
    if (searchTerm === '') {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Rechercher uniquement dans les clés sorties (pas encore retournées)
    const results = keysDatabase.filter(key => {
        if (key.returnDate) return false; // Ignorer les clés déjà revenues
        
        // Recherche dans tous les champs pertinents
        return key.person.nom.toLowerCase().includes(searchTerm) ||
            key.person.prenom.toLowerCase().includes(searchTerm) ||
            key.person.entreprise.toLowerCase().includes(searchTerm) ||
            key.person.telephone.toLowerCase().includes(searchTerm) ||
            key.person.email.toLowerCase().includes(searchTerm) ||
            key.bien.exLocataire.toLowerCase().includes(searchTerm) ||
            key.bien.adresse.toLowerCase().includes(searchTerm) ||
            key.bien.reference.toLowerCase().includes(searchTerm);
    });
    
    // Afficher les résultats
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Aucune clé trouvée pour "${searchTerm}"</div>
            </div>
        `;
        return;
    }
    
    // Générer les cartes pour chaque résultat
    resultsContainer.innerHTML = `
        <div style="margin-bottom: 15px; color: white; font-weight: 600;">
            ${results.length} clé${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}
        </div>
        ${results.map(key => createKeyCardForQuickSearch(key)).join('')}
    `;
}

// Créer une carte simplifiée pour la recherche rapide
function createKeyCardForQuickSearch(key) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const returnDate = new Date(key.expectedReturnDate);
    returnDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-ok';
    let statusText = 'Dans les temps';
    let cardClass = '';
    
    if (diffDays >= 7) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours ⚠️`;
        cardClass = 'late-7';
    } else if (diffDays >= 3) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours`;
        cardClass = 'late-3';
    } else if (diffDays >= 1) {
        statusClass = 'status-warning';
        statusText = `Retard de ${diffDays} jour(s)`;
        cardClass = 'late-1';
    }
    
    const departDateFormatted = new Date(key.departDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const expectedReturnFormatted = new Date(key.expectedReturnDate).toLocaleDateString('fr-FR');
    
    return `
        <div class="key-card ${cardClass}">
            <div class="key-card-header">
                <div class="key-card-title">
                    ${key.person.prenom} ${key.person.nom}
                    ${key.person.entreprise ? `(${key.person.entreprise})` : ''}
                </div>
                <div class="key-card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="key-card-details">
                <div class="detail-item">
                    <div class="detail-label">Ex-locataire</div>
                    <div class="detail-value">${key.bien.exLocataire}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Adresse</div>
                    <div class="detail-value">${key.bien.adresse}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Téléphone</div>
                    <div class="detail-value">${key.person.telephone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Départ</div>
                    <div class="detail-value">${departDateFormatted}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Retour prévu</div>
                    <div class="detail-value">${expectedReturnFormatted}</div>
                </div>
            </div>
            
            <div class="key-card-photo">
                <img src="${key.photo}" alt="Photo des clés" style="cursor: pointer;" onclick="showPhotoModal('${key.photo}')">
            </div>
        </div>
    `;
}

// Afficher une photo en grand dans un modal
function showPhotoModal(photoSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cursor = 'pointer';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90vh; padding: 20px; background: white; border-radius: 20px;">
            <h2 style="color: #52a788; margin-bottom: 20px;">Photo des clés</h2>
            <img src="${photoSrc}" alt="Photo des clés" style="max-width: 100%; max-height: 70vh; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <p style="text-align: center; margin-top: 20px; color: #666;">Cliquez n'importe où pour fermer</p>
        </div>
    `;
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
}

// ==================== GESTION DES PROFILS ====================

// Afficher la page de gestion des profils
function showTeamSettings() {
    if (!currentTeam) return;
    
    const settingsTeamName = document.getElementById('settings-team-name');
    if (settingsTeamName) {
        settingsTeamName.textContent = teams[currentTeam].name + ' ' + teams[currentTeam].icon;
    }
    
    displayTeamMembers();
    showPage('team-settings');
}

// Afficher la liste des membres de l'équipe
function displayTeamMembers() {
    const container = document.getElementById('team-members-list');
    if (!container || !currentTeam) return;
    
    const members = teams[currentTeam].members;
    
    if (members.length === 0) {
        container.innerHTML = `
            <div class="empty-members">
                <div class="empty-members-icon">👥</div>
                <div>Aucun membre dans cette équipe</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = members.map((member, index) => {
        // Compter les clés créées par ce membre
        const keysCount = keysDatabase.filter(k => k.registeredBy === member).length;
        
        return `
            <div class="member-item">
                <div>
                    <div class="member-name">${member}</div>
                    <div class="member-stats">${keysCount} clé${keysCount > 1 ? 's' : ''} enregistrée${keysCount > 1 ? 's' : ''}</div>
                </div>
                <div class="member-actions">
                    <button class="btn-icon btn-delete" onclick="confirmDeleteMember('${member}')" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Ajouter un nouveau profil
function addNewProfile() {
    const input = document.getElementById('new-profile-name');
    if (!input || !currentTeam) return;
    
    const newName = input.value.trim();
    
    // Validations
    if (newName === '') {
        alert('⚠️ Veuillez entrer un prénom');
        return;
    }
    
    if (newName.length < 2) {
        alert('⚠️ Le prénom doit contenir au moins 2 caractères');
        return;
    }
    
    if (newName.length > 30) {
        alert('⚠️ Le prénom est trop long (maximum 30 caractères)');
        return;
    }
    
    // Vérifier si le nom existe déjà
    if (teams[currentTeam].members.includes(newName)) {
        alert('⚠️ Ce prénom existe déjà dans l\'équipe');
        return;
    }
    
    // Ajouter le membre
    teams[currentTeam].members.push(newName);
    saveTeams();
    
    // Réinitialiser le champ
    input.value = '';
    
    // Rafraîchir les affichages
    displayTeamMembers();      // Rafraîchir la liste dans les réglages
    displayTeamUsers();         // Rafraîchir les boutons sur la page de sélection
    
    alert(`✅ ${newName} a été ajouté à l'équipe !`);
}

// Confirmer la suppression d'un membre
function confirmDeleteMember(memberName) {
    if (!currentTeam) return;
    
    // Compter les clés de ce membre
    const keysCount = keysDatabase.filter(k => k.registeredBy === memberName).length;
    
    let message = `Êtes-vous sûr de vouloir supprimer ${memberName} ?`;
    
    if (keysCount > 0) {
        message += `\n\n⚠️ Attention : Ce membre a enregistré ${keysCount} clé${keysCount > 1 ? 's' : ''}.`;
        message += `\n\nL'historique de ces clés sera CONSERVÉ, seul le profil sera supprimé.`;
    }
    
    if (confirm(message)) {
        deleteMember(memberName);
    }
}

// Supprimer un membre
function deleteMember(memberName) {
    if (!currentTeam) return;
    
    // Vérifier qu'il reste au moins un membre
    if (teams[currentTeam].members.length <= 1) {
        alert('⚠️ Impossible de supprimer le dernier membre de l\'équipe.\nIl doit y avoir au moins un membre par équipe.');
        return;
    }
    
    // Supprimer le membre
    teams[currentTeam].members = teams[currentTeam].members.filter(m => m !== memberName);
    saveTeams();
    
    // Rafraîchir les affichages
    displayTeamMembers();      // Rafraîchir la liste dans les réglages
    displayTeamUsers();         // Rafraîchir les boutons sur la page de sélection
    
    alert(`✅ ${memberName} a été supprimé de l'équipe.\n\nL'historique des clés enregistrées par cette personne a été conservé.`);
}

// Support de la touche Entrée dans le champ d'ajout de profil
document.addEventListener('DOMContentLoaded', () => {
    const newProfileInput = document.getElementById('new-profile-name');
    if (newProfileInput) {
        newProfileInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewProfile();
            }
        });
    }
});

// ==================== MODIFICATION DE DATE DE RETOUR ====================

let selectedKeyForDateEdit = null;

// Ouvrir le modal de modification de date
function openEditDateModal(keyId) {
    const key = keysDatabase.find(k => k.id === keyId);
    if (!key || !key.returnDate) return;
    
    selectedKeyForDateEdit = key;
    
    const modal = document.getElementById('modal-edit-date');
    const currentDateDisplay = document.getElementById('current-return-date');
    const newDateInput = document.getElementById('new-return-date');
    
    if (!modal || !currentDateDisplay || !newDateInput) return;
    
    // Afficher la date actuelle
    const currentDate = new Date(key.returnDate);
    const formattedDate = currentDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    currentDateDisplay.textContent = formattedDate;
    
    // Pré-remplir avec la date actuelle au format datetime-local
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    newDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    modal.classList.add('active');
}

// Fermer le modal de modification de date
function closeEditDateModal() {
    const modal = document.getElementById('modal-edit-date');
    if (modal) {
        modal.classList.remove('active');
    }
    selectedKeyForDateEdit = null;
}

// Sauvegarder la nouvelle date de retour
function saveNewReturnDate() {
    if (!selectedKeyForDateEdit) return;
    
    const newDateInput = document.getElementById('new-return-date');
    if (!newDateInput) return;
    
    const newDateValue = newDateInput.value;
    if (!newDateValue) {
        alert('⚠️ Veuillez sélectionner une nouvelle date');
        return;
    }
    
    // Convertir en ISO string
    const newDate = new Date(newDateValue);
    
    // Trouver la clé dans la base et mettre à jour
    const key = keysDatabase.find(k => k.id === selectedKeyForDateEdit.id);
    if (key) {
        const oldDate = new Date(key.returnDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        key.returnDate = newDate.toISOString();
        saveDatabase();
        
        const newDateFormatted = newDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        alert(`✅ Date de retour modifiée avec succès !\n\nAncienne date : ${oldDate}\nNouvelle date : ${newDateFormatted}`);
        
        closeEditDateModal();
        
        // Rafraîchir l'affichage de l'historique
        displayHistorique();
        
        // Mettre à jour le tableau de bord global
        updateGlobalDashboard();
    }
}

// Confirmer et supprimer une clé de l'historique
function confirmDeleteKey(keyId) {
    // Convertir en nombre si nécessaire
    const numericKeyId = typeof keyId === 'string' ? parseInt(keyId) : keyId;
    
    // Trouver la clé
    const key = keysDatabase.find(k => k.id == numericKeyId);
    if (!key) {
        alert('❌ Erreur : Clé introuvable.');
        return;
    }
    
    // Message de confirmation détaillé
    const confirmMessage = `⚠️ ATTENTION : Supprimer définitivement cette clé ?\n\n` +
        `Personne : ${key.person.prenom} ${key.person.nom}\n` +
        `${key.person.entreprise ? 'Entreprise : ' + key.person.entreprise + '\n' : ''}` +
        `Bien : ${key.bien.adresse}\n` +
        `Ex-locataire : ${key.bien.exLocataire}\n\n` +
        `⚠️ Cette action est IRRÉVERSIBLE !`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Double confirmation pour plus de sécurité
    if (!confirm('🚨 Êtes-vous VRAIMENT sûr(e) de vouloir supprimer cette clé ?\n\nCette action ne peut pas être annulée !')) {
        return;
    }
    
    // Supprimer la clé de la base de données
    const index = keysDatabase.findIndex(k => k.id == numericKeyId);
    if (index !== -1) {
        keysDatabase.splice(index, 1);
        saveDatabase();
        
        // Notification de succès
        showToast('🗑️ Clé supprimée avec succès');
        
        // Rafraîchir l'affichage
        displayHistorique();
        
        // Mettre à jour les tableaux de bord
        updateDashboard();
        updateGlobalDashboard();
    } else {
        alert('❌ Erreur lors de la suppression.');
    }
}

// Fermer le modal en cliquant en dehors
document.addEventListener('DOMContentLoaded', () => {
    const modalEditDate = document.getElementById('modal-edit-date');
    if (modalEditDate) {
        modalEditDate.addEventListener('click', (e) => {
            if (e.target.id === 'modal-edit-date') {
                closeEditDateModal();
            }
        });
    }
    
    // Fermer le modal de liste des clés en cliquant en dehors
    const modalKeysList = document.getElementById('modal-keys-list');
    if (modalKeysList) {
        modalKeysList.addEventListener('click', (e) => {
            if (e.target.id === 'modal-keys-list') {
                closeKeysListModal();
            }
        });
    }
    
    // Fermer le modal de validation de retour rapide en cliquant en dehors
    const modalQuickReturn = document.getElementById('modal-quick-return');
    if (modalQuickReturn) {
        modalQuickReturn.addEventListener('click', (e) => {
            if (e.target.id === 'modal-quick-return') {
                closeQuickReturnModal();
            }
        });
    }
});

// ==================== AFFICHAGE DES CLÉS PAR CATÉGORIE ====================

// Afficher les clés par catégorie dans un modal
function showKeysListByCategory(category) {
    const modal = document.getElementById('modal-keys-list');
    const title = document.getElementById('modal-keys-title');
    const content = document.getElementById('modal-keys-content');
    
    if (!modal || !title || !content) return;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Filtrer les clés selon la catégorie
    const activeKeys = keysDatabase.filter(k => !k.returnDate);
    let filteredKeys = [];
    let categoryTitle = '';
    let categoryIcon = '';
    
    if (category === 'all') {
        filteredKeys = activeKeys;
        categoryTitle = 'Toutes les Clés en Circulation';
        categoryIcon = '🔑';
    } else if (category === 'late1') {
        filteredKeys = activeKeys.filter(key => {
            const returnDate = new Date(key.expectedReturnDate);
            returnDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
            return diffDays >= 1 && diffDays < 3;
        });
        categoryTitle = 'Clés en Retard de 1 Jour';
        categoryIcon = '⚠️';
    } else if (category === 'late3') {
        filteredKeys = activeKeys.filter(key => {
            const returnDate = new Date(key.expectedReturnDate);
            returnDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
            return diffDays >= 3 && diffDays < 7;
        });
        categoryTitle = 'Clés en Retard de 3+ Jours';
        categoryIcon = '🚨';
    } else if (category === 'late7') {
        filteredKeys = activeKeys.filter(key => {
            const returnDate = new Date(key.expectedReturnDate);
            returnDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
            return diffDays >= 7;
        });
        categoryTitle = 'Clés en Retard de 7+ Jours';
        categoryIcon = '🔴';
    }
    
    // Mettre à jour le titre
    title.textContent = `${categoryIcon} ${categoryTitle}`;
    
    // Afficher les clés
    if (filteredKeys.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">Aucune clé dans cette catégorie</div>
            </div>
        `;
    } else {
        // Trier par date de retour prévue (les plus en retard en premier)
        filteredKeys.sort((a, b) => new Date(a.expectedReturnDate) - new Date(b.expectedReturnDate));
        
        content.innerHTML = filteredKeys.map(key => createDetailedKeyCard(key)).join('');
    }
    
    // Afficher le modal
    modal.classList.add('active');
}

// Créer une carte de clé détaillée avec informations de contact
function createDetailedKeyCard(key) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const returnDate = new Date(key.expectedReturnDate);
    returnDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-ok';
    let statusText = 'Dans les temps';
    let cardClass = '';
    
    if (diffDays >= 7) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours ⚠️`;
        cardClass = 'late-7';
    } else if (diffDays >= 3) {
        statusClass = 'status-alert';
        statusText = `Retard de ${diffDays} jours`;
        cardClass = 'late-3';
    } else if (diffDays >= 1) {
        statusClass = 'status-warning';
        statusText = `Retard de ${diffDays} jour(s)`;
        cardClass = 'late-1';
    }
    
    const departDateFormatted = new Date(key.departDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const expectedReturnFormatted = new Date(key.expectedReturnDate).toLocaleDateString('fr-FR');
    
    return `
        <div class="key-card ${cardClass}">
            <div class="key-card-header">
                <div class="key-card-title">
                    ${key.person.prenom} ${key.person.nom}
                    ${key.person.entreprise ? `(${key.person.entreprise})` : ''}
                </div>
                <div class="key-card-status ${statusClass}">${statusText}</div>
            </div>
            
            <!-- Informations de contact en évidence -->
            <div class="modal-key-contact">
                <h4>📞 Coordonnées</h4>
                <div class="contact-item">
                    <strong>📱 Téléphone :</strong> 
                    <a href="tel:${key.person.telephone}">${key.person.telephone}</a>
                </div>
                <div class="contact-item">
                    <strong>✉️ Email :</strong> 
                    <a href="mailto:${key.person.email}">${key.person.email}</a>
                </div>
                ${key.person.entreprise ? `
                <div class="contact-item">
                    <strong>🏢 Entreprise :</strong> ${key.person.entreprise}
                </div>
                ` : ''}
            </div>
            
            <div class="key-card-details">
                <div class="detail-item">
                    <div class="detail-label">Ex-locataire</div>
                    <div class="detail-value">${key.bien.exLocataire}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Adresse du bien</div>
                    <div class="detail-value">${key.bien.adresse}</div>
                </div>
                ${key.bien.reference ? `
                <div class="detail-item">
                    <div class="detail-label">Référence / Lot</div>
                    <div class="detail-value">${key.bien.reference}</div>
                </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Date de départ</div>
                    <div class="detail-value">${departDateFormatted}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Retour prévu</div>
                    <div class="detail-value">${expectedReturnFormatted}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Enregistré par</div>
                    <div class="detail-value">${key.registeredBy} (${key.registeredByTeam})</div>
                </div>
            </div>
            
            ${key.commentaires ? `
            <div class="detail-item" style="margin-top: 15px;">
                <div class="detail-label">Commentaires</div>
                <div class="detail-value">${key.commentaires}</div>
            </div>
            ` : ''}
            
            <div class="key-card-photo">
                <img src="${key.photo}" alt="Photo des clés" style="cursor: pointer;" onclick="showPhotoModal('${key.photo}')">
            </div>
            
            <!-- Boutons d'actions -->
            <div class="key-card-actions" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                ${diffDays >= 1 ? `
                <button class="btn-send-email" onclick="sendReminderEmail(${key.id}, event)">
                    📧 Envoyer un rappel
                </button>
                ` : ''}
                <button class="btn-quick-return" onclick="quickReturnKey(${key.id}, event)">
                    ✅ Retour de la Clé
                </button>
            </div>
        </div>
    `;
}

// Variable globale pour stocker l'ID de la clé en cours de retour
let currentKeyIdForReturn = null;

// Retour rapide d'une clé depuis le modal - Ouvre le formulaire de validation
function quickReturnKey(keyId, event) {
    event.stopPropagation();
    
    // Convertir en nombre si c'est une chaîne
    const numericKeyId = typeof keyId === 'string' ? parseInt(keyId) : keyId;
    
    const key = keysDatabase.find(k => k.id == numericKeyId); // Utiliser == pour comparaison souple
    if (!key) {
        alert('❌ Erreur : Clé introuvable.');
        return;
    }
    
    // Stocker l'ID de la clé
    currentKeyIdForReturn = numericKeyId;
    
    // Afficher les informations de la clé dans le modal
    const keySummary = document.getElementById('quick-return-key-info');
    if (keySummary) {
        keySummary.innerHTML = `
            <h4>Clé à rendre :</h4>
            <p><strong>Sortie par :</strong> ${key.person.prenom} ${key.person.nom} ${key.person.entreprise ? '(' + key.person.entreprise + ')' : ''}</p>
            <p><strong>Bien :</strong> ${key.bien.adresse}</p>
            <p><strong>Ex-locataire :</strong> ${key.bien.exLocataire}</p>
        `;
    }
    
    // Réinitialiser le formulaire
    const nomInput = document.getElementById('return-person-nom');
    const prenomInput = document.getElementById('return-person-prenom');
    const telephoneInput = document.getElementById('return-person-telephone');
    const teamSelect = document.getElementById('return-receptionnaire-team');
    const memberSelect = document.getElementById('return-receptionnaire-name');
    
    if (nomInput) nomInput.value = '';
    if (prenomInput) prenomInput.value = '';
    if (telephoneInput) telephoneInput.value = '';
    if (teamSelect) teamSelect.value = '';
    if (memberSelect) {
        memberSelect.value = '';
        memberSelect.disabled = true;
    }
    
    // Afficher le modal D'ABORD
    const modal = document.getElementById('modal-quick-return');
    console.log('Modal trouvé:', modal);
    
    if (modal) {
        modal.classList.add('active');
        console.log('Modal activé avec classe active');
        
        // Réinitialiser et initialiser la signature APRÈS l'affichage du modal
        // Délai pour laisser le modal se rendre complètement
        setTimeout(() => {
            console.log('=== INITIALISATION SIGNATURE RETOUR ===');
            const canvas = document.getElementById('signature-canvas-return');
            console.log('Canvas trouvé:', canvas);
            
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                console.log('Dimensions du canvas:', {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    visible: rect.width > 0 && rect.height > 0
                });
            }
            
            clearSignature('return');
            const result = initSignatureCanvas('signature-canvas-return', 'return');
            console.log('Résultat initSignatureCanvas:', result);
            console.log('signatureCanvases:', signatureCanvases);
            console.log('✅ Canvas de signature retour prêt à l\'utilisation');
        }, 300);
    } else {
        alert('❌ Erreur : Modal de retour introuvable.');
    }
}

// Charger les membres de l'équipe sélectionnée pour le réceptionnaire
function loadReceptionnaireMembers() {
    const teamSelect = document.getElementById('return-receptionnaire-team');
    const memberSelect = document.getElementById('return-receptionnaire-name');
    
    if (!teamSelect || !memberSelect) return;
    
    const selectedTeam = teamSelect.value;
    
    if (!selectedTeam) {
        memberSelect.disabled = true;
        memberSelect.innerHTML = '<option value="">-- D\'abord choisir une équipe --</option>';
        return;
    }
    
    // Activer le select et charger les membres
    memberSelect.disabled = false;
    memberSelect.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
    
    if (teams[selectedTeam] && teams[selectedTeam].members) {
        teams[selectedTeam].members.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            memberSelect.appendChild(option);
        });
    }
}

// Confirmer et enregistrer le retour avec les informations du formulaire
function confirmQuickReturn() {
    // Récupérer les valeurs du formulaire
    const personNom = document.getElementById('return-person-nom').value.trim();
    const personPrenom = document.getElementById('return-person-prenom').value.trim();
    const personTelephone = document.getElementById('return-person-telephone').value.trim();
    const receptionnaireTeam = document.getElementById('return-receptionnaire-team').value;
    const receptionnaireName = document.getElementById('return-receptionnaire-name').value;
    
    // Validation
    if (!personNom || !personPrenom || !personTelephone) {
        alert('⚠️ Veuillez renseigner toutes les informations de la personne qui ramène les clés.');
        return;
    }
    
    if (!receptionnaireTeam || !receptionnaireName) {
        alert('⚠️ Veuillez sélectionner l\'équipe et le membre qui réceptionne les clés.');
        return;
    }
    
    // Vérifier la signature
    if (isSignatureEmpty('return')) {
        alert('⚠️ La signature est obligatoire. Veuillez signer dans le cadre prévu.');
        return;
    }
    
    // Déterminer l'ID de la clé (depuis quickReturnKey ou openReturnModal)
    const keyId = currentKeyIdForReturn || (selectedKeyForReturn ? selectedKeyForReturn.id : null);
    
    // Trouver la clé
    const key = keysDatabase.find(k => k.id == keyId);
    if (!key) {
        alert('❌ Erreur : Clé introuvable.');
        return;
    }
    
    // Récupérer la signature
    const returnSignature = getSignatureData('return');
    
    // Enregistrer le retour avec toutes les informations
    key.returnDate = new Date().toISOString();
    key.returnedBy = receptionnaireName;
    key.returnedByTeam = teams[receptionnaireTeam].name;
    
    // Enregistrer les informations de la personne qui ramène
    key.returnedPersonInfo = {
        nom: personNom,
        prenom: personPrenom,
        telephone: personTelephone,
        signature: returnSignature // Ajout de la signature de retour
    };
    
    saveDatabase();
    
    // Fermer le modal de validation
    closeQuickReturnModal();
    
    // Trouver la catégorie actuelle pour rafraîchir la bonne liste (si appelé depuis les modals)
    const title = document.getElementById('modal-keys-title');
    if (title) {
        const titleText = title.textContent.toLowerCase();
        let category = 'all';
        
        if (titleText.includes('retard de 1')) {
            category = 'late1';
        } else if (titleText.includes('retard de 3')) {
            category = 'late3';
        } else if (titleText.includes('retard de 7')) {
            category = 'late7';
        }
        
        // Rafraîchir la liste du modal
        showKeysListByCategory(category);
    }
    
    // Si appelé depuis la page "Retour de clés", rafraîchir la recherche
    if (selectedKeyForReturn) {
        searchKeys();
    }
    
    // Mettre à jour les tableaux de bord
    updateDashboard();
    updateGlobalDashboard();
    
    // Message de confirmation
    showToast('✅ Clé rendue avec succès !');
    
    // Réinitialiser les variables
    currentKeyIdForReturn = null;
    selectedKeyForReturn = null;
}

// Fermer le modal de validation de retour rapide
function closeQuickReturnModal() {
    const modal = document.getElementById('modal-quick-return');
    if (modal) {
        modal.classList.remove('active');
    }
    currentKeyIdForReturn = null;
}

// Envoyer un email de rappel pour une clé en retard
function sendReminderEmail(keyId, event) {
    event.stopPropagation();
    
    // Convertir en nombre si nécessaire
    const numericKeyId = typeof keyId === 'string' ? parseInt(keyId) : keyId;
    
    // Trouver la clé
    const key = keysDatabase.find(k => k.id == numericKeyId);
    if (!key) {
        alert('❌ Erreur : Clé introuvable.');
        return;
    }
    
    // Calculer le nombre de jours de retard
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const returnDate = new Date(key.expectedReturnDate);
    returnDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
    
    // Déterminer le niveau d'urgence
    let urgenceLevel = '';
    let urgenceEmoji = '';
    let urgenceText = '';
    
    if (diffDays >= 7) {
        urgenceLevel = 'URGENT';
        urgenceEmoji = '🔴';
        urgenceText = `retard de ${diffDays} jours`;
    } else if (diffDays >= 3) {
        urgenceLevel = 'IMPORTANT';
        urgenceEmoji = '🚨';
        urgenceText = `retard de ${diffDays} jours`;
    } else if (diffDays >= 1) {
        urgenceLevel = 'Rappel';
        urgenceEmoji = '⚠️';
        urgenceText = `retard de ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    // Format de la date de retour prévue
    const expectedReturnFormatted = new Date(key.expectedReturnDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Générer l'objet de l'email
    const subject = `${urgenceEmoji} ${urgenceLevel} - Retour de clés attendu - ${key.bien.exLocataire}`;
    
    // Générer le corps de l'email
    const body = `Bonjour ${key.person.prenom} ${key.person.nom},

Nous vous contactons concernant les clés du bien suivant :

📍 Adresse du bien : ${key.bien.adresse}
🏠 Ex-locataire : ${key.bien.exLocataire}
${key.bien.reference ? `📋 Référence : ${key.bien.reference}\n` : ''}
📅 Date de retour prévue : ${expectedReturnFormatted}
${urgenceEmoji} Statut : ${urgenceText}

Les clés n'ont pas encore été restituées à notre agence.

Nous vous remercions de bien vouloir nous les retourner dans les plus brefs délais.

Si vous avez déjà restitué les clés ou si vous rencontrez un problème, merci de nous contacter rapidement.

Cordialement,
L'équipe OIKO GESTION

---
Pour toute question : ${key.registeredBy} - ${teams[Object.keys(teams).find(t => teams[t].name === key.registeredByTeam)]?.name || key.registeredByTeam}`;

    // Encoder pour URL (mailto)
    const mailtoLink = `mailto:${key.person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Ouvrir le client email
    window.location.href = mailtoLink;
    
    // Message de confirmation
    showToast('📧 Email de rappel ouvert dans votre client email');
}

// Afficher un message toast discret
function showToast(message, type = 'info') {
    // Créer le toast s'il n'existe pas
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    // Réinitialiser les classes
    toast.className = 'toast-notification';
    
    // Ajouter le type
    if (type && type !== 'info') {
        toast.classList.add(type);
    }
    
    // Définir le message
    toast.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Fermer le modal de liste des clés
function closeKeysListModal() {
    const modal = document.getElementById('modal-keys-list');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ====================================
// GESTION DU RÉPERTOIRE DE CONTACTS
// ====================================

// Afficher la page répertoire avec la liste des contacts
function displayRepertoire() {
    console.log('displayRepertoire appelée, nombre de contacts:', contactsDatabase.length);
    console.log('Contacts:', contactsDatabase);
    
    const list = document.getElementById('repertoire-list');
    
    if (!list) {
        console.error('Element repertoire-list non trouvé!');
        return;
    }
    
    if (!contactsDatabase || contactsDatabase.length === 0) {
        console.log('Aucun contact à afficher');
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📇</div><h3>Aucun contact dans le répertoire</h3><p>Cliquez sur Ajouter un contact pour commencer</p></div>';
        updateContactsCount();
        return;
    }
    
    // Trier par nom
    const sortedContacts = [...contactsDatabase].sort((a, b) => {
        return a.nom.localeCompare(b.nom, "fr");
    });
    
    let html = '';
    sortedContacts.forEach(contact => {
        const dateStr = new Date(contact.created_at).toLocaleDateString("fr-FR");
        
        html += '<div class="contact-card-compact" data-contact-id="' + contact.id + '">';
        
        // En-tête cliquable (toujours visible)
        html += '<div class="contact-header-compact" onclick="toggleContactDetails(' + contact.id + ')">';
        html += '<div class="contact-name-compact">';
        html += '<span class="contact-icon">👤</span>';
        html += '<strong>' + contact.prenom + ' ' + contact.nom + '</strong>';
        html += '</div>';
        html += '<span class="toggle-icon" id="toggle-' + contact.id + '">▼</span>';
        html += '</div>';
        
        // Détails (cachés par défaut)
        html += '<div class="contact-details" id="details-' + contact.id + '" style="display: none;">';
        
        if (contact.entreprise) {
            html += '<div class="contact-info"><span class="info-icon">🏢</span><span>' + contact.entreprise + '</span></div>';
        }
        
        html += '<div class="contact-info"><span class="info-icon">📞</span><span>' + contact.telephone + '</span></div>';
        
        if (contact.email) {
            html += '<div class="contact-info"><span class="info-icon">📧</span><span>' + contact.email + '</span></div>';
        }
        
        if (contact.notes) {
            html += '<div class="contact-notes"><span class="info-icon">📝</span><span>' + contact.notes + '</span></div>';
        }
        
        html += '<div class="contact-stats"><span class="stat-badge">📅 Créé le ' + dateStr + '</span></div>';
        
        // Actions (dans les détails)
        html += '<div class="contact-actions-bottom">';
        html += '<button class="btn-action-compact btn-edit" onclick="editContact(' + contact.id + ')"><span>✏️</span> Modifier</button>';
        html += '<button class="btn-action-compact btn-delete" onclick="deleteContact(' + contact.id + ')"><span>🗑️</span> Supprimer</button>';
        html += '</div>';
        
        html += '</div>'; // Fin contact-details
        html += '</div>'; // Fin contact-card-compact
    });
    
    list.innerHTML = html;
    updateContactsCount();
}

// Mettre à jour le compteur de contacts
function updateContactsCount() {
    const countElement = document.getElementById('repertoire-count');
    const count = contactsDatabase.length;
    
    if (countElement) {
        if (count === 0) {
            countElement.textContent = '0 contact';
        } else if (count === 1) {
            countElement.textContent = '1 contact';
        } else {
            countElement.textContent = count + ' contacts';
        }
    }
}

// Rechercher dans le répertoire
function searchRepertoire() {
    const searchInput = document.getElementById('repertoire-search');
    const query = searchInput.value.trim().toLowerCase();
    
    const list = document.getElementById('repertoire-list');
    
    if (!query) {
        displayRepertoire();
        return;
    }
    
    // Filtrer les contacts
    const filteredContacts = contactsDatabase.filter(contact => {
        const nomMatch = contact.nom.toLowerCase().includes(query);
        const prenomMatch = contact.prenom.toLowerCase().includes(query);
        const entrepriseMatch = contact.entreprise.toLowerCase().includes(query);
        const emailMatch = contact.email.toLowerCase().includes(query);
        const telMatch = contact.telephone.replace(/\s/g, '').includes(query.replace(/\s/g, ''));
        
        return nomMatch || prenomMatch || entrepriseMatch || emailMatch || telMatch;
    });
    
    if (filteredContacts.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Aucun résultat</h3><p>Aucun contact ne correspond à : ' + query + '</p></div>';
        return;
    }
    
    // Afficher les résultats
    let html = '';
    filteredContacts.forEach(contact => {
        const dateStr = new Date(contact.created_at).toLocaleDateString("fr-FR");
        
        html += '<div class="contact-card-compact" data-contact-id="' + contact.id + '">';
        
        // En-tête cliquable (toujours visible)
        html += '<div class="contact-header-compact" onclick="toggleContactDetails(' + contact.id + ')">';
        html += '<div class="contact-name-compact">';
        html += '<span class="contact-icon">👤</span>';
        html += '<strong>' + contact.prenom + ' ' + contact.nom + '</strong>';
        html += '</div>';
        html += '<span class="toggle-icon" id="toggle-' + contact.id + '">▼</span>';
        html += '</div>';
        
        // Détails (cachés par défaut)
        html += '<div class="contact-details" id="details-' + contact.id + '" style="display: none;">';
        
        if (contact.entreprise) {
            html += '<div class="contact-info"><span class="info-icon">🏢</span><span>' + contact.entreprise + '</span></div>';
        }
        
        html += '<div class="contact-info"><span class="info-icon">📞</span><span>' + contact.telephone + '</span></div>';
        
        if (contact.email) {
            html += '<div class="contact-info"><span class="info-icon">📧</span><span>' + contact.email + '</span></div>';
        }
        
        if (contact.notes) {
            html += '<div class="contact-notes"><span class="info-icon">📝</span><span>' + contact.notes + '</span></div>';
        }
        
        html += '<div class="contact-stats"><span class="stat-badge">📅 Créé le ' + dateStr + '</span></div>';
        
        // Actions (dans les détails)
        html += '<div class="contact-actions-bottom">';
        html += '<button class="btn-action-compact btn-edit" onclick="editContact(' + contact.id + ')"><span>✏️</span> Modifier</button>';
        html += '<button class="btn-action-compact btn-delete" onclick="deleteContact(' + contact.id + ')"><span>🗑️</span> Supprimer</button>';
        html += '</div>';
        
        html += '</div>'; // Fin contact-details
        html += '</div>'; // Fin contact-card-compact
    });
    
    list.innerHTML = html;
}

// Toggle les détails d'un contact (accordéon)
function toggleContactDetails(contactId) {
    const details = document.getElementById('details-' + contactId);
    const toggle = document.getElementById('toggle-' + contactId);
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        toggle.textContent = '▲';
        toggle.classList.add('open');
    } else {
        details.style.display = 'none';
        toggle.textContent = '▼';
        toggle.classList.remove('open');
    }
}

// Ouvrir le modal pour ajouter un contact
function openAddContactModal() {
    const modal = document.getElementById('modal-contact');
    const title = document.getElementById('modal-contact-title');
    const form = document.getElementById('contact-form');
    
    if (!modal || !form) {
        console.error('Erreur: Modal ou formulaire introuvable');
        return;
    }
    
    // Réinitialiser le formulaire
    form.reset();
    document.getElementById('modal-contact-id').value = '';
    
    // Changer le titre
    if (title) {
        title.textContent = '➕ Ajouter un Contact';
    }
    
    // Afficher le modal
    modal.classList.add('active');
}

// Fermer le modal contact
function closeContactModal() {
    const modal = document.getElementById('modal-contact');
    modal.classList.remove('active');
}

// Enregistrer un contact depuis le modal
function saveContactFromModal(event) {
    event.preventDefault();
    
    console.log('saveContactFromModal appelée');
    
    const nom = document.getElementById('modal-contact-nom').value.trim();
    const prenom = document.getElementById('modal-contact-prenom').value.trim();
    const entreprise = document.getElementById('modal-contact-entreprise').value.trim();
    const telephone = document.getElementById('modal-contact-telephone').value.trim();
    const email = document.getElementById('modal-contact-email').value.trim();
    const notes = document.getElementById('modal-contact-notes').value.trim();
    const contactId = document.getElementById('modal-contact-id').value;
    
    console.log('Données:', { nom, prenom, entreprise, telephone, email, contactId });
    
    // Validation
    if (!nom || !prenom || !telephone) {
        showToast('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
    }
    
    if (contactId) {
        // Modification d'un contact existant
        const contact = contactsDatabase.find(c => c.id == contactId);
        if (contact) {
            contact.nom = nom;
            contact.prenom = prenom;
            contact.entreprise = entreprise;
            contact.telephone = telephone;
            contact.email = email;
            contact.notes = notes;
            contact.updated_at = new Date().toISOString();
            
            console.log('Contact modifié:', contact);
            saveContacts();
            displayRepertoire();
            closeContactModal();
            showToast('✅ Contact modifié avec succès', 'success');
        }
    } else {
        // Vérifier si le contact existe déjà (nom + prénom + téléphone)
        const existingContact = contactsDatabase.find(c => 
            c.nom.toLowerCase() === nom.toLowerCase() && 
            c.prenom.toLowerCase() === prenom.toLowerCase() &&
            c.telephone === telephone
        );
        
        console.log('Contact existant trouvé?', existingContact);
        
        if (existingContact) {
            if (confirm("Un contact identique existe deja (meme nom, prenom et telephone).\n\nVoulez-vous quand meme l'ajouter ?")) {
                createNewContact(nom, prenom, entreprise, telephone, email, notes);
            } else {
                closeContactModal();
            }
        } else {
            createNewContact(nom, prenom, entreprise, telephone, email, notes);
        }
    }
}

// Créer un nouveau contact
function createNewContact(nom, prenom, entreprise, telephone, email, notes) {
    console.log('createNewContact appelée avec:', { nom, prenom, entreprise, telephone, email, notes });
    alert('createNewContact appelée!');
    
    const newContact = {
        id: Date.now(),
        nom: nom,
        prenom: prenom,
        entreprise: entreprise,
        telephone: telephone,
        email: email,
        notes: notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    console.log('Nouveau contact créé:', newContact);
    console.log('Nombre de contacts avant ajout:', contactsDatabase.length);
    
    contactsDatabase.push(newContact);
    
    console.log('Nombre de contacts après ajout:', contactsDatabase.length);
    console.log('Base de données complète:', contactsDatabase);
    
    alert('Contact ajouté! Total: ' + contactsDatabase.length);
    
    saveContacts();
    displayRepertoire();
    closeContactModal();
    showToast('✅ Contact ajouté avec succès au répertoire (' + contactsDatabase.length + ' contacts)', 'success');
}

// Modifier un contact
function editContact(contactId) {
    const contact = contactsDatabase.find(c => c.id == contactId);
    
    if (!contact) {
        showToast('❌ Contact introuvable', 'error');
        return;
    }
    
    // Remplir le formulaire
    document.getElementById('modal-contact-nom').value = contact.nom;
    document.getElementById('modal-contact-prenom').value = contact.prenom;
    document.getElementById('modal-contact-entreprise').value = contact.entreprise;
    document.getElementById('modal-contact-telephone').value = contact.telephone;
    document.getElementById('modal-contact-email').value = contact.email;
    document.getElementById('modal-contact-notes').value = contact.notes || '';
    document.getElementById('modal-contact-id').value = contact.id;
    
    // Changer le titre
    document.getElementById('modal-contact-title').textContent = '✏️ Modifier le Contact';
    
    // Afficher le modal
    document.getElementById('modal-contact').classList.add('active');
}

// Supprimer un contact
function deleteContact(contactId) {
    const contact = contactsDatabase.find(c => c.id == contactId);
    
    if (!contact) {
        showToast('❌ Contact introuvable', 'error');
        return;
    }
    
    const confirmMsg = "Etes-vous sur de vouloir supprimer le contact " + contact.prenom + " " + contact.nom + " ? Cette action est irreversible.";
    if (confirm(confirmMsg)) {
        contactsDatabase = contactsDatabase.filter(c => c.id != contactId);
        saveContacts();
        displayRepertoire();
        showToast('✅ Contact supprimé avec succès', 'success');
    }
}

// Enregistrer le contact actuel dans le répertoire (depuis formulaire départ/retour)
function saveCurrentContactToRepertoire(context) {
    console.log('saveCurrentContactToRepertoire appelée avec context:', context);
    alert('Fonction appelée pour : ' + context);
    
    let nom, prenom, entreprise, telephone, email;
    
    // Récupérer les valeurs selon le contexte
    if (context === 'depart') {
        nom = document.getElementById('nom').value.trim();
        prenom = document.getElementById('prenom').value.trim();
        entreprise = document.getElementById('entreprise').value.trim();
        telephone = document.getElementById('telephone').value.trim();
        email = document.getElementById('email').value.trim();
    } else if (context === 'return') {
        // IDs corrects pour le modal de retour
        nom = document.getElementById('return-person-nom').value.trim();
        prenom = document.getElementById('return-person-prenom').value.trim();
        entreprise = ''; // Pas d'entreprise dans le formulaire de retour
        telephone = document.getElementById('return-person-telephone').value.trim();
        email = ''; // Pas d'email dans le formulaire de retour
    }
    
    console.log('Données récupérées:', { nom, prenom, entreprise, telephone, email });
    
    // Vérifier que les champs obligatoires sont remplis
    if (!nom || !prenom || !telephone) {
        showToast('⚠️ Veuillez remplir au moins le nom, prénom et téléphone avant d\'enregistrer', 'warning');
        return;
    }
    
    // Vérifier si le contact existe déjà (nom + prénom + téléphone)
    const existingContact = contactsDatabase.find(c => 
        c.nom.toLowerCase() === nom.toLowerCase() && 
        c.prenom.toLowerCase() === prenom.toLowerCase() &&
        c.telephone === telephone
    );
    
    if (existingContact) {
        showToast('ℹ️ Ce contact existe déjà dans le répertoire', 'info');
        return;
    }
    
    // Créer le nouveau contact
    const newContact = {
        id: Date.now(),
        nom: nom,
        prenom: prenom,
        entreprise: entreprise,
        telephone: telephone,
        email: email,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    console.log('Nouveau contact créé:', newContact);
    
    // Ajouter au répertoire
    contactsDatabase.push(newContact);
    console.log('Contact ajouté. Total contacts:', contactsDatabase.length);
    
    // Sauvegarder
    saveContacts();
    
    // Notification de succès
    showToast('✅ Contact enregistré dans le répertoire (' + prenom + ' ' + nom + ')', 'success');
    
    console.log('Contact sauvegardé avec succès dans le répertoire');
}

// ====================================
// AUTO-COMPLÉTION DEPUIS LE RÉPERTOIRE
// ====================================

// Initialiser l'auto-complétion sur les champs de recherche
function initAutocomplete() {
    const searchFieldDepart = document.getElementById('contact-search-depart');
    const searchFieldReturn = document.getElementById('contact-search-return');
    
    if (searchFieldDepart) {
        searchFieldDepart.addEventListener('input', function(e) {
            handleAutocompleteSearch(e.target.value, 'depart');
        });
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.autocomplete-container')) {
                closeAutocompleteSuggestions('depart');
            }
        });
    }
    
    if (searchFieldReturn) {
        searchFieldReturn.addEventListener('input', function(e) {
            handleAutocompleteSearch(e.target.value, 'return');
        });
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.autocomplete-container')) {
                closeAutocompleteSuggestions('return');
            }
        });
    }
}

// Gérer la recherche auto-complétion
function handleAutocompleteSearch(query, context) {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Minimum 2 caractères
    if (trimmedQuery.length < 2) {
        closeAutocompleteSuggestions(context);
        return;
    }
    
    // Rechercher dans le répertoire
    const results = contactsDatabase.filter(contact => {
        const nomMatch = contact.nom.toLowerCase().includes(trimmedQuery);
        const prenomMatch = contact.prenom.toLowerCase().includes(trimmedQuery);
        const entrepriseMatch = contact.entreprise.toLowerCase().includes(trimmedQuery);
        
        return nomMatch || prenomMatch || entrepriseMatch;
    });
    
    displayAutocompleteSuggestions(results, context);
}

// Afficher les suggestions d'auto-complétion
function displayAutocompleteSuggestions(contacts, context) {
    const dropdown = document.getElementById('autocomplete-suggestions-' + context);
    
    if (!dropdown) return;
    
    if (contacts.length === 0) {
        dropdown.innerHTML = '<div class="suggestion-empty">Aucun contact trouvé dans le répertoire</div>';
        dropdown.classList.add('active');
        return;
    }
    
    let html = '';
    contacts.forEach(contact => {
        html += '<div class="suggestion-item" onclick="selectContactFromAutocomplete(' + contact.id + ', \'' + context + '\')">';
        html += '<div class="suggestion-name">' + contact.prenom + ' ' + contact.nom + '</div>';
        
        if (contact.entreprise) {
            html += '<div class="suggestion-company">' + contact.entreprise + '</div>';
        }
        
        html += '<div class="suggestion-details">';
        html += contact.telephone;
        if (contact.email) {
            html += ' • ' + contact.email;
        }
        html += '</div>';
        html += '</div>';
    });
    
    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

// Fermer les suggestions
function closeAutocompleteSuggestions(context) {
    const dropdown = document.getElementById('autocomplete-suggestions-' + context);
    if (dropdown) {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
    }
}

// Sélectionner un contact depuis l'auto-complétion
function selectContactFromAutocomplete(contactId, context) {
    const contact = contactsDatabase.find(c => c.id == contactId);
    
    if (!contact) {
        showToast('Contact introuvable', 'error');
        return;
    }
    
    // Remplir les champs selon le contexte
    if (context === 'depart') {
        document.getElementById('nom').value = contact.nom;
        document.getElementById('prenom').value = contact.prenom;
        document.getElementById('entreprise').value = contact.entreprise || '';
        document.getElementById('telephone').value = contact.telephone;
        document.getElementById('email').value = contact.email || '';
        
        // Vider le champ de recherche
        document.getElementById('contact-search-depart').value = '';
        
        showToast('✅ Coordonnées remplies depuis le répertoire', 'success');
    } else if (context === 'return') {
        // IDs corrects pour le modal de retour
        document.getElementById('return-person-nom').value = contact.nom;
        document.getElementById('return-person-prenom').value = contact.prenom;
        document.getElementById('return-person-telephone').value = contact.telephone;
        
        // Vider le champ de recherche
        document.getElementById('contact-search-return').value = '';
        
        showToast('✅ Coordonnées remplies depuis le répertoire', 'success');
    }
    
    // Fermer les suggestions
    closeAutocompleteSuggestions(context);
}
