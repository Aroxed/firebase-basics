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
const loginEventsContainer = document.getElementById('login-events');

// Format timestamp to readable date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Display login event
function displayLoginEvent(loginEvent) {
    console.log('Displaying login event:', loginEvent);
    const eventElement = document.createElement('div');
    eventElement.className = 'login-event';
    eventElement.innerHTML = `
        <div>${loginEvent.email}</div>
        <div class="time">${formatDate(loginEvent.timestamp)}</div>
    `;
    loginEventsContainer.prepend(eventElement);
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
                database.ref(`users/${user.uid}/fcmToken`).set(token);
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
        
        // Save initial user data to database
        await database.ref(`users/${user.uid}`).set({
            email: user.email,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Request notification permission after successful registration
        await requestNotificationPermission();
        
        showUserSection(user);
    } catch (error) {
        registerError.textContent = error.message;
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
        
        // Save login event to database
        const loginEvent = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            email: user.email
        };
        console.log('Saving login event:', loginEvent);
        const loginEventRef = await database.ref('loginEvents').push(loginEvent);
        console.log('Login event saved with key:', loginEventRef.key);
        
        // Request notification permission after successful login
        await requestNotificationPermission();
        
        showUserSection(user);
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showLoginSection();
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// Show user section
function showUserSection(user) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = user.email;
    
    // Clear previous login events
    loginEventsContainer.innerHTML = '';
    
    // Load and display login events
    console.log('Loading login events...');
    database.ref('loginEvents')
        .orderByChild('timestamp')
        .limitToLast(10)
        .on('value', (snapshot) => {
            console.log('Received login events snapshot:', snapshot.val());
            const events = [];
            snapshot.forEach((childSnapshot) => {
                events.push(childSnapshot.val());
            });
            console.log('Processed events:', events);
            // Display events in reverse chronological order
            events.reverse().forEach(displayLoginEvent);
        }, (error) => {
            console.error('Error loading login events:', error);
        });
}

// Show login section
function showLoginSection() {
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

// Listen for database changes
database.ref('loginEvents').on('child_added', (snapshot) => {
    const loginEvent = snapshot.val();
    console.log('New login event received:', loginEvent);
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `New login from ${loginEvent.email}`;
    notificationsContainer.prepend(notification);
}); 