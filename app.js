let pressStartTime;
let orangeIntensity = 0;
let happyMomentsCount = 0;

// Initialize Telegram WebApp
const telegram = window.Telegram.WebApp;
telegram.ready();

// Set up the main theme
telegram.setHeaderColor('secondary_bg_color');
telegram.expand(); // Make app full height

const happyButton = document.getElementById('happyButton');
const body = document.body;

// Create stats display
const stats = document.createElement('div');
stats.className = 'stats';
stats.textContent = 'Loading...';
document.querySelector('.container').appendChild(stats);

// Initialize CloudStorage
async function initializeData() {
    try {
        // Get stored data using cloud storage
        const cloudData = await telegram.CloudStorage.getItem('happyData');
        console.log('Loaded cloud data:', cloudData); // Debug log
        
        if (cloudData) {
            const parsedData = JSON.parse(cloudData);
            happyMomentsCount = parseInt(parsedData.count) || 0;
            orangeIntensity = parseFloat(parsedData.intensity) || 0;
            
            // Update UI with stored data
            updateStats({ happiness: 0 });
            if (orangeIntensity > 0) {
                body.style.backgroundColor = `rgb(255, ${255 - orangeIntensity * 1.5}, ${255 - orangeIntensity * 2})`;
            }
            console.log('Initialized with count:', happyMomentsCount); // Debug log
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to CloudStorage
async function saveData() {
    try {
        const data = JSON.stringify({
            count: happyMomentsCount,
            intensity: orangeIntensity,
            lastUpdated: new Date().toISOString()
        });
        await telegram.CloudStorage.setItem('happyData', data);
        console.log('Saved data:', data); // Debug log
    } catch (error) {
        console.error('Error saving data:', error);
        // Show error to user
        telegram.showPopup({
            title: 'Error Saving',
            message: 'Could not save your happy moment. Please try again.',
            buttons: [{type: 'ok'}]
        });
    }
}

// Function to create ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

function updateStats(happiness) {
    const intensity = happiness < 1 ? 'small' : happiness < 3 ? 'medium' : 'big';
    stats.textContent = `${happyMomentsCount} happy ${happyMomentsCount === 1 ? 'moment' : 'moments'} today (last one was ${intensity})`;
    
    if (happiness >= 3) {
        telegram.HapticFeedback.notificationOccurred('success');
        telegram.showPopup({
            title: '🌟 Wonderful Moment!',
            message: 'You just recorded a very happy moment. Keep spreading joy!',
            buttons: [{type: 'ok'}]
        });
    }
}

function updateEmoji(happiness) {
    const smiley = document.querySelector('.smiley');
    if (happiness < 1) {
        smiley.textContent = '😊';
    } else if (happiness < 3) {
        smiley.textContent = '😃';
    } else {
        smiley.textContent = '🤗';
    }
}

function updateBackground(happiness) {
    orangeIntensity = Math.min(orangeIntensity + (happiness * 2), 100);
    body.style.backgroundColor = `rgb(255, ${255 - orangeIntensity * 1.5}, ${255 - orangeIntensity * 2})`;
}

function handleStart(event) {
    event.preventDefault();
    pressStartTime = Date.now();
    createRipple(event.touches ? event.touches[0] : event);
    telegram.HapticFeedback.notificationOccurred('warning');
}

async function handleEnd(event) {
    event.preventDefault();
    if (!pressStartTime) return;

    const pressDuration = (Date.now() - pressStartTime) / 1000;
    const happiness = Math.min(pressDuration, 5);

    // Haptic feedback
    if (happiness < 1) {
        telegram.HapticFeedback.notificationOccurred('warning');
    } else if (happiness < 3) {
        telegram.HapticFeedback.notificationOccurred('success');
    } else {
        telegram.HapticFeedback.notificationOccurred('success');
        setTimeout(() => telegram.HapticFeedback.notificationOccurred('success'), 150);
    }

    updateEmoji(happiness);
    updateBackground(happiness);
    
    // Increment counter and update stats
    happyMomentsCount++;
    updateStats(happiness);
    
    // Save data after each interaction
    await saveData(); // Wait for save to complete
    console.log('Saved count:', happyMomentsCount); // Debug log
    
    pressStartTime = null;
}

// Wait for Telegram.WebApp to be ready before initializing
telegram.onEvent('viewportChanged', async () => {
    if (telegram.isExpanded) {
        await initializeData();
    }
});

// Initialize immediately as well
initializeData().then(() => {
    console.log('Initial loading complete');
});

// Remove any existing listeners first
happyButton.replaceWith(happyButton.cloneNode(true));
// Get the new button reference
const newButton = document.querySelector('.happy-button');

// Add event listeners for both touch and mouse events
newButton.addEventListener('touchstart', handleStart, { passive: false });
newButton.addEventListener('touchend', handleEnd, { passive: false });
newButton.addEventListener('touchcancel', handleEnd, { passive: false });

newButton.addEventListener('mousedown', handleStart);
newButton.addEventListener('mouseup', handleEnd);
newButton.addEventListener('mouseleave', handleEnd);

// Prevent scrolling while pressing the button
document.body.addEventListener('touchmove', (e) => {
    if (pressStartTime) {
        e.preventDefault();
    }
}, { passive: false }); 