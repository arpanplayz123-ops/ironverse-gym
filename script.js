/* ==========================================================================
   IRONVERSE GYM - INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. THREE.JS 3D SCENE SETUP WITH FALLBACK
    // ----------------------------------------------------------------------
    let scene, camera, renderer, mainMesh, ring1, ring2, particles;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const canvas = document.getElementById('hero-canvas');

    function init3D() {
        if (!window.THREE || !canvas) {
            document.body.classList.add('no-webgl');
            return;
        }

        try {
            // Scene Setup
            scene = new THREE.Scene();

            // Camera Setup
            camera = new THREE.PerspectiveCamera(
                60, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            camera.position.z = 7;

            // Renderer Setup
            renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                alpha: true, 
                antialias: true 
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Central Metallic Torus Knot
            const geometry = new THREE.TorusKnotGeometry(1.6, 0.45, 128, 32);
            const material = new THREE.MeshStandardMaterial({
                color: 0x11111a,
                metalness: 0.95,
                roughness: 0.15,
                wireframe: false
            });
            mainMesh = new THREE.Mesh(geometry, material);
            scene.add(mainMesh);

            // Inner & Outer Glowing Rings
            const ringGeo1 = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
            const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
            ring1 = new THREE.Mesh(ringGeo1, ringMat1);
            ring1.rotation.x = Math.PI / 3;
            scene.add(ring1);

            const ringGeo2 = new THREE.TorusGeometry(3.3, 0.015, 16, 100);
            const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.4 });
            ring2 = new THREE.Mesh(ringGeo2, ringMat2);
            ring2.rotation.y = Math.PI / 4;
            scene.add(ring2);

            // Floating Particle Field
            const particleCount = 250;
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 18;
            }

            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particleMat = new THREE.PointsMaterial({
                color: 0x00f0ff,
                size: 0.04,
                transparent: true,
                opacity: 0.8
            });
            particles = new THREE.Points(particleGeo, particleMat);
            scene.add(particles);

            // Cinematic Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const blueLight = new THREE.PointLight(0x00f0ff, 3, 20);
            blueLight.position.set(5, 5, 5);
            scene.add(blueLight);

            const deepLight = new THREE.PointLight(0x0044ff, 4, 20);
            deepLight.position.set(-5, -5, -2);
            scene.add(deepLight);

            // Event Listeners for Interaction & Resizing
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('mousemove', onMouseMove);

            // Start Loop
            animate();

        } catch (e) {
            console.warn("WebGL initialization failed, applying fallback theme.", e);
            document.body.classList.add('no-webgl');
        }
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e) {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    }

    function animate() {
        requestAnimationFrame(animate);

        // Smooth rotation interpolation
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        if (mainMesh) {
            mainMesh.rotation.x += 0.005;
            mainMesh.rotation.y += 0.008;
            mainMesh.rotation.x += targetY;
            mainMesh.rotation.y += targetX;
        }

        if (ring1) {
            ring1.rotation.z -= 0.003;
            ring1.rotation.x += 0.002;
        }

        if (ring2) {
            ring2.rotation.z += 0.004;
        }

        if (particles) {
            particles.rotation.y -= 0.001;
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    init3D();

    // ----------------------------------------------------------------------
    // 2. NAVBAR SCROLL EFFECT & MOBILE MENU TOGGLE
    // ----------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // ----------------------------------------------------------------------
    // 3. ANIMATED STATISTICS COUNTER
    // ----------------------------------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    function runCounters() {
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            let current = 0;
            const increment = target / 40;

            const updateCount = () => {
                current += increment;
                if (current < target) {
                    stat.innerText = Math.ceil(current);
                    setTimeout(updateCount, 30);
                } else {
                    stat.innerText = target;
                }
            };
            updateCount();
        });
    }

    // Trigger stats when scrolling to Hero
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                runCounters();
                animatedStats = true;
            }
        });
    }, { threshold: 0.5 });

    const heroSection = document.getElementById('home');
    if (heroSection) heroObserver.observe(heroSection);

    // ----------------------------------------------------------------------
    // 4. 3D CARD TILT EFFECT
    // ----------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 12;
            const rotateY = (x / rect.width) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // ----------------------------------------------------------------------
    // 5. FREE AI FITNESS ASSISTANT ENGINE (LOCAL KEYWORD MATCHING)
    // ----------------------------------------------------------------------
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionChips = document.querySelectorAll('.chip');

    const aiKnowledge = [
        {
            keywords: ['beginner', 'start', 'new'],
            response: "Welcome! For beginners, we recommend a 3-day full-body split: Day 1: Squats & Push-ups, Day 2: Rest/Mobility, Day 3: Deadlifts & Rows. Focus on form over weight!"
        },
        {
            keywords: ['push-up', 'push up', 'chest'],
            response: "To improve push-ups: Maintain a rigid plank core, pull shoulders down away from ears, and lower your chest until elbows hit a 45-degree angle. Try eccentric slow lowers!"
        },
        {
            keywords: ['recommendation', 'today', 'do'],
            response: "Today's Recommended Workout: 4 Sets of Barbell Back Squats, 3 Sets of Incline Dumbbell Press, 3 Sets of Lat Pulldowns, finished with 10 mins High Intensity Interval Cardio."
        },
        {
            keywords: ['protein', 'diet', 'nutrition', 'eat'],
            response: "Optimal hypertrophy guideline: Aim for 1.6 to 2.2 grams of protein per kilogram of body weight daily, distributed across 3 to 4 balanced meals."
        },
        {
            keywords: ['hi', 'hello', 'hey'],
            response: "Greetings athlete! Ask me anything about programming, form, exercise splits, or nutrition."
        }
    ];

    function addChatMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processAiResponse(userQuery) {
        const lowerQuery = userQuery.toLowerCase();
        let matchedResponse = "That's a great fitness query! I recommend focusing on progressive overload, adequate hydration, and aiming for 7-8 hours of recovery sleep.";

        for (const item of aiKnowledge) {
            if (item.keywords.some(keyword => lowerQuery.includes(keyword))) {
                matchedResponse = item.response;
                break;
            }
        }

        setTimeout(() => {
            addChatMessage(matchedResponse, 'bot');
        }, 400);
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            addChatMessage(text, 'user');
            chatInput.value = '';
            processAiResponse(text);
        });
    }

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            addChatMessage(query, 'user');
            processAiResponse(query);
        });
    });

    // ----------------------------------------------------------------------
    // 6. INTERACTIVE PROGRESS DASHBOARD (LOCALSTORAGE)
    // ----------------------------------------------------------------------
    const defaultStats = { streak: 5, workouts: 14, time: 420, goal: 20 };
    
    function loadDashboardData() {
        const saved = localStorage.getItem('ironverse_dashboard_data');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    function updateDashboardUI(data) {
        document.getElementById('dash-streak').innerText = data.streak;
        document.getElementById('dash-count').innerText = data.workouts;
        document.getElementById('dash-time').innerText = data.time;

        const percentage = Math.min(100, Math.round((data.workouts / data.goal) * 100));
        document.getElementById('dash-percentage').innerText = `${percentage}%`;
        document.getElementById('dash-bar').style.width = `${percentage}%`;
    }

    let currentDashboardData = loadDashboardData();
    updateDashboardUI(currentDashboardData);

    const btnLogWorkout = document.getElementById('btn-log-workout');
    const btnResetStats = document.getElementById('btn-reset-stats');

    if (btnLogWorkout) {
        btnLogWorkout.addEventListener('click', () => {
            currentDashboardData.streak += 1;
            currentDashboardData.workouts += 1;
            currentDashboardData.time += 45;
            
            localStorage.setItem('ironverse_dashboard_data', JSON.stringify(currentDashboardData));
            updateDashboardUI(currentDashboardData);
            showToast('Workout Logged successfully! (+45 Mins)');
        });
    }

    if (btnResetStats) {
        btnResetStats.addEventListener('click', () => {
            currentDashboardData = { ...defaultStats };
            localStorage.setItem('ironverse_dashboard_data', JSON.stringify(currentDashboardData));
            updateDashboardUI(currentDashboardData);
            showToast('Dashboard reset to default.');
        });
    }

    // ----------------------------------------------------------------------
    // 7. MEMBERSHIP MODAL SYSTEM
    // ----------------------------------------------------------------------
    const modal = document.getElementById('membership-modal');
    const modalClose = document.getElementById('modal-close');
    const selectedPlanName = document.getElementById('selected-plan-name');
    const modalForm = document.getElementById('modal-form');

    document.querySelectorAll('.open-membership-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.getAttribute('data-plan') || 'PRO';
            if (selectedPlanName) selectedPlanName.innerText = plan;
            if (modal) modal.classList.add('active');
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            modal.classList.remove('active');
            modalForm.reset();
            showToast('Registration complete! Welcome to IRONVERSE.');
        });
    }

    // ----------------------------------------------------------------------
    // 8. CONTACT FORM HANDLING
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.reset();
            showToast('Message sent successfully!');
        });
    }

    // ----------------------------------------------------------------------
    // 9. TOAST NOTIFICATION HELPERS & BACK TO TOP BUTTON
    // ----------------------------------------------------------------------
    const toast = document.getElementById('toast');

    function showToast(message) {
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
                              
