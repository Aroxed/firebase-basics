// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const userSection = document.getElementById('user-section');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const errorMessage = document.getElementById('error-message');
const registerError = document.getElementById('register-error');
const notificationsContainer = document.getElementById('notifications');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const googleLoginBtn = document.getElementById('google-login-btn');
const googleRegisterBtn = document.getElementById('google-register-btn');
const loginEventsContainer = document.getElementById('login-events');

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

let loginEventsQuery = null;
let loginEventsHandler = null;
let loginEventsErrorHandler = null;

// Format timestamp to readable date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function displayLoginHistoryMessage(message, className = 'login-event') {
    loginEventsContainer.innerHTML = '';
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = message;
    loginEventsContainer.appendChild(messageElement);
}

// Display login event
function displayLoginEvent(loginEvent) {
    console.log('Displaying login event:', loginEvent);
    const eventElement = document.createElement('div');
    eventElement.className = 'login-event';

    const emailElement = document.createElement('div');
    emailElement.textContent = loginEvent.email || 'Unknown user';

    const timeElement = document.createElement('div');
    timeElement.className = 'time';
    timeElement.textContent = formatDate(loginEvent.timestamp);

    if (loginEvent.provider) {
        const providerElement = document.createElement('div');
        providerElement.className = 'time';
        providerElement.textContent = `Provider: ${loginEvent.provider}`;
        eventElement.append(emailElement, timeElement, providerElement);
    } else {
        eventElement.append(emailElement, timeElement);
    }

    loginEventsContainer.appendChild(eventElement);
}

async function saveUserProfile(user, options = {}) {
    const userRef = database.ref(`users/${user.uid}`);
    const userProfile = {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        lastLoginAt: firebase.database.ServerValue.TIMESTAMP
    };

    if (options.includeCreatedAt) {
        userProfile.createdAt = firebase.database.ServerValue.TIMESTAMP;
    }

    await userRef.update(userProfile);
}

async function saveUserProfileIfAllowed(user, options) {
    try {
        await saveUserProfile(user, options);
    } catch (error) {
        console.warn('Unable to save user profile:', error);
    }
}

async function saveLoginEvent(user, provider) {
    const loginEvent = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        email: user.email,
        provider
    };
    console.log('Saving login event:', loginEvent);
    const loginEventRef = await database.ref('loginEvents').push(loginEvent);
    console.log('Login event saved with key:', loginEventRef.key);
}

function showAuthError(error, target = errorMessage) {
    target.textContent = error.message;
}

function showAppError(error) {
    displayLoginHistoryMessage(error.message, 'login-event error');
    console.error(error);
}

function renderLoginEvents(snapshot) {
    console.log('Received login events snapshot:', snapshot.val());
    loginEventsContainer.innerHTML = '';

    if (!snapshot.exists()) {
        displayLoginHistoryMessage('No login events yet.');
        return;
    }

    const events = [];
    snapshot.forEach((childSnapshot) => {
        events.push(childSnapshot.val());
    });
    console.log('Processed events:', events);

    events.reverse().forEach(displayLoginEvent);
}

function subscribeToLoginHistory() {
    if (loginEventsQuery) {
        loginEventsQuery.off('value', loginEventsHandler);
    }

    loginEventsContainer.innerHTML = '';
    loginEventsQuery = database.ref('loginEvents')
        .orderByChild('timestamp')
        .limitToLast(10);
    loginEventsHandler = renderLoginEvents;
    loginEventsErrorHandler = (error) => {
        showAppError(new Error(`Unable to load login history: ${error.message}`));
    };

    console.log('Loading login events...');
    loginEventsQuery.on('value', loginEventsHandler, loginEventsErrorHandler);
}

// Toggle between login and register forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
    errorMessage.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    registerError.textContent = '';
});

// Request notification permission
async function requestNotificationPermission() {
    if (!messaging) {
        console.log('Push notifications are not supported in this browser');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await messaging.getToken();
            // Save the token to the database
            const user = auth.currentUser;
            if (user) {
                try {
                    await database.ref(`users/${user.uid}/fcmToken`).set(token);
                } catch (error) {
                    console.warn('Unable to save notification token:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Handle registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await saveUserProfileIfAllowed(user, { includeCreatedAt: true });
        await saveLoginEvent(user, 'password');
        
        // Request notification permission after successful registration
        await requestNotificationPermission();
        
        showUserSection(user);
    } catch (error) {
        showAuthError(error, registerError);
        showAppError(error);
    }
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await saveUserProfileIfAllowed(user);
        await saveLoginEvent(user, 'password');
        
        // Request notification permission after successful login
        await requestNotificationPermission();
        
        showUserSection(user);
    } catch (error) {
        showAuthError(error);
        showAppError(error);
    }
});

async function signInWithGoogle(targetError) {
    targetError.textContent = '';

    try {
        const userCredential = await auth.signInWithPopup(googleProvider);
        const user = userCredential.user;

        await saveUserProfileIfAllowed(user, {
            includeCreatedAt: userCredential.additionalUserInfo?.isNewUser
        });
        await saveLoginEvent(user, 'google.com');
        await requestNotificationPermission();

        showUserSection(user);
    } catch (error) {
        showAuthError(error, targetError);
        showAppError(error);
    }
}

googleLoginBtn.addEventListener('click', () => {
    signInWithGoogle(errorMessage);
});

googleRegisterBtn.addEventListener('click', () => {
    signInWithGoogle(registerError);
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showLoginSection();
    } catch (error) {
        showAuthError(error);
    }
});

// Show user section
function showUserSection(user) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = user.email;
    
    subscribeToLoginHistory();
}

// Show login section
function showLoginSection() {
    if (loginEventsQuery) {
        loginEventsQuery.off('value', loginEventsHandler);
        loginEventsQuery = null;
        loginEventsHandler = null;
        loginEventsErrorHandler = null;
    }

    userSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
    registerForm.reset();
    errorMessage.textContent = '';
    registerError.textContent = '';
}

// Handle auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        showUserSection(user);
    } else {
        showLoginSection();
    }
});

// Handle incoming messages if messaging is supported
if (messaging) {
    messaging.onMessage((payload) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = payload.notification.body;
        notificationsContainer.prepend(notification);
    });
}
