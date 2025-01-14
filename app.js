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
stats.textContent = 'No happy moments recorded yet today';
document.querySelector('.container').appendChild(stats);

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

// Handle button press start
happyButton.addEventListener('mousedown', (e) => {
    pressStartTime = new Date();
    createRipple(e);
    telegram.HapticFeedback.impactOccurred('light');
});

// Handle button release
happyButton.addEventListener('mouseup', () => {
    const pressDuration = new Date() - pressStartTime;
    const happiness = Math.min(pressDuration / 1000, 5);
    
    // Different haptic feedback based on duration
    if (happiness < 1) {
        telegram.HapticFeedback.impactOccurred('light');
    } else if (happiness < 3) {
        telegram.HapticFeedback.impactOccurred('medium');
    } else {
        telegram.HapticFeedback.impactOccurred('heavy');
    }
    
    // Update background color
    orangeIntensity = Math.min(orangeIntensity + (happiness * 2), 100);
    body.style.backgroundColor = `rgb(255, ${255 - orangeIntensity * 1.5}, ${255 - orangeIntensity * 2})`;
    
    // Update emoji based on press duration
    const smiley = document.querySelector('.smiley');
    if (happiness < 1) {
        smiley.textContent = '😊';
    } else if (happiness < 3) {
        smiley.textContent = '😃';
    } else {
        smiley.textContent = '🤗';
    }

    // Update stats
    happyMomentsCount++;
    updateStats(happiness);
});

function updateStats(happiness) {
    const intensity = happiness < 1 ? 'small' : happiness < 3 ? 'medium' : 'big';
    stats.textContent = `${happyMomentsCount} happy ${happyMomentsCount === 1 ? 'moment' : 'moments'} today (last one was ${intensity})`;
    
    // Show popup for significant moments
    if (happiness >= 3) {
        telegram.HapticFeedback.notificationOccurred('success');
        telegram.showPopup({
            title: '🌟 Wonderful Moment!',
            message: 'You just recorded a very happy moment. Keep spreading joy!',
            buttons: [{type: 'ok'}]
        });
    }
}

// Add touch support for mobile devices
happyButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressStartTime = new Date();
    createRipple(e.touches[0]);
    telegram.HapticFeedback.impactOccurred('light');
});

happyButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    const pressDuration = new Date() - pressStartTime;
    const happiness = Math.min(pressDuration / 1000, 5);
    
    if (happiness < 1) {
        telegram.HapticFeedback.impactOccurred('light');
    } else if (happiness < 3) {
        telegram.HapticFeedback.impactOccurred('medium');
    } else {
        telegram.HapticFeedback.impactOccurred('heavy');
    }
    
    orangeIntensity = Math.min(orangeIntensity + (happiness * 2), 100);
    body.style.backgroundColor = `rgb(255, ${255 - orangeIntensity * 1.5}, ${255 - orangeIntensity * 2})`;
    
    updateStats(happiness);
}); 