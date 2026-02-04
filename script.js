const TOTAL_FRAMES = 122;

// config
const PATH_VITE = 'hero';
const PATH_LOCAL = 'public/hero';

// State
let basePath = PATH_VITE; // Default to Vite/Vercel path
let images = [];
let currentFrame = 0;
let canvas = null;
let ctx = null;
let animationReqId = null;
let lastFrameTime = 0;
const FPS = 13;
const frameInterval = 1000 / FPS;

document.addEventListener('DOMContentLoaded', () => {
    console.log('UNIVERSE system online.');

    // Initialize Hero Animation with Path Autodetection
    initHeroAnimation();

    // Initialize Scroll Animations
    initScrollAnimations();

    // Initialize Custom Cursor
    initCursor();

    // Initialize Custom Cursor
    initCursor();
});



function initCursor() {
    const star = document.getElementById('cursor-star');
    const sparkle = document.getElementById('cursor-sparkle');

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Immediate move for star
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Delayed/Lerped move for sparkle could be done via requestAnimationFrame,
        // but simple CSS 'left/top' transition lag matches strict follow.
        // For smoother physics we'd use JS. Let's do direct assignment + CSS transition for now
        // or direct assignment without transition if we want instant.
        // User asked for "sparkling around it", so let's make it follow closely.

        // To get a slight delay effect without complex JS loop, we can use a small delay in CSS check or just trail it.
        // Let's stick to direct movement for responsiveness, using CSS animation for the spin/pulse.
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
    });

    // Hover interactions
    const interactiveElements = document.querySelectorAll('a, button, .btn, .feature-card, .testimonial-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
    });
}

function initHeroAnimation() {
    const container = document.getElementById('hero-background');
    if (!container) return;

    // Create Canvas
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Initial Resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Try detecting correct path before preloading all
    detectPathAndStart();
}

function detectPathAndStart() {
    // Try Vite path first, then Local
    const testImg = new Image();
    testImg.src = `${PATH_VITE}/ezgif-frame-001.jpg`;

    testImg.onload = () => {
        console.log('Path detection: Vite/Root style detected (hero/).');
        basePath = PATH_VITE;
        preloadImages(startAnimation);
    };

    testImg.onerror = () => {
        console.log('Path detection: Vite path failed. Trying public/...');
        // Try fallback
        const testImg2 = new Image();
        testImg2.src = `${PATH_LOCAL}/ezgif-frame-001.jpg`;

        testImg2.onload = () => {
            console.log('Path detection: Local/Public style detected (public/hero/).');
            basePath = PATH_LOCAL;
            preloadImages(startAnimation);
        };

        testImg2.onerror = () => {
            console.error('CRITICAL ERROR: Could not load frames from ANY path.');
        };
    };
}

function resizeCanvas() {
    if (!canvas) return;
    const container = document.getElementById('hero-background');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Re-draw immediately if not animating yet/paused to prevent blank screen
    if (images.length > 0) {
        renderFrame(currentFrame);
    }
}

function preloadImages(callback) {
    const FRAME_PATH = (index) => `${basePath}/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
    let loadedCount = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = () => {
            loadedCount++;
            if (loadedCount === TOTAL_FRAMES) {
                callback();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            loadedCount++; // Count error as load to avoid hanging
            if (loadedCount === TOTAL_FRAMES) callback();
        };
        images.push(img);
    }
}

function startAnimation() {
    lastFrameTime = performance.now();
    animate();
}

function animate(currentTime) {
    const elapsed = currentTime - lastFrameTime;

    if (elapsed > frameInterval) {
        lastFrameTime = currentTime - (elapsed % frameInterval);

        renderFrame(currentFrame);

        if (currentFrame >= TOTAL_FRAMES - 1) {
            return; // Stop animation after last frame
        }
        currentFrame++;
    }

    animationReqId = requestAnimationFrame(animate);
}

function renderFrame(frameIndex) {
    if (!images[frameIndex] || !ctx || !canvas) return;

    const img = images[frameIndex];

    // Simulate 'object-fit: cover'
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img,
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .hero-content');

    const style = document.createElement('style');
    style.innerHTML = `
        .feature-card, .testimonial-card, .hero-content {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    animatedElements.forEach(el => observer.observe(el));
}
