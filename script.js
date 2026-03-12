import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Auth State Global UI Update ---
    const updateAuthUI = async (session) => {
        const unauthElements = document.querySelectorAll('.auth-unauthenticated');
        const authElements = document.querySelectorAll('.auth-authenticated');
        const userNameDisplays = document.querySelectorAll('#nav-user-name');

        if (session) {
            // User is logged in
            unauthElements.forEach(el => el.style.display = 'none');
            authElements.forEach(el => el.style.display = 'inline-block'); // or whatever display is appropriate

            // Fetch and display user's name if available
            const { data: { user } } = await supabase.auth.getUser();
            const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Buddy';

            userNameDisplays.forEach(el => {
                el.innerHTML = `${fullName}`;
            });
        } else {
            // User is logged out
            unauthElements.forEach(el => el.style.display = 'inline-block');
            authElements.forEach(el => el.style.display = 'none');
            userNameDisplays.forEach(el => el.textContent = '');
        }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session);
    });

    // Listen for state changes
    supabase.auth.onAuthStateChange((_event, session) => {
        updateAuthUI(session);
    });

    // Logout logic
    const logoutBtns = document.querySelectorAll('#logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(`Error logging out: ${error.message}`);
            } else {
                window.location.href = 'index.html'; // Redirect to home on logout
            }
        });
    });

    // --- Profile Dropdown Toggle Logic ---
    const profileContainers = document.querySelectorAll('.profile-dropdown-container');
    profileContainers.forEach(container => {
        const btn = container.querySelector('.profile-btn');
        const content = container.querySelector('.profile-dropdown-content');
        if (btn && content) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents document click from immediately closing it

                // Close other open dropdowns first (if any)
                document.querySelectorAll('.profile-dropdown-content.show').forEach(openContent => {
                    if (openContent !== content) openContent.classList.remove('show');
                });

                content.classList.toggle('show');
            });
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        profileContainers.forEach(container => {
            const content = container.querySelector('.profile-dropdown-content');
            if (content && content.classList.contains('show') && !container.contains(e.target)) {
                content.classList.remove('show');
            }
        });
    });

    // --- Password Visibility Toggle Logic ---
    const togglePasswordBtns = document.querySelectorAll('.pwd-toggle-btn');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input && (input.type === 'password' || input.type === 'text')) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                // Toggle SVG icon (eye vs eye-off)
                if (isPassword) {
                    btn.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
                } else {
                    btn.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                }
            }
        });
    });

    // --- Utils & Setup ---

    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate GSAP with Lenis
    gsap.registerPlugin(ScrollTrigger);

    // Connect GSAP ScrollTrigger to Lenis
    // (Usually not strictly needed for basic ScrollTrigger unless using ScrollSmoother, 
    // but good practice to keep them synced if pinning is involved. 
    // For now, standard ScrollTrigger works fine with Lenis as Lenis just translates the scroll.)

    // 2. GSAP Animations vs IntersectionObserver
    const fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length > 0) {
        fadeElements.forEach(el => {
            // Use GSAP 'fromTo' with autoAlpha for correct visibility handling
            gsap.fromTo(el,
                { autoAlpha: 0, y: 30 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    autoAlpha: 1, // Handles opacity + visibility
                    y: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        });
    }

    // --- Video Autoplay & Parallax (GSAP) ---
    const heroVideo = document.getElementById('hero-video');
    const heroOverlay = document.querySelector('.hero-content-overlay');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const loader = document.getElementById('loader');

    if (loader) {
        const progressBar = document.getElementById('loader-progress-bar');
        const loaderText = document.getElementById('loader-text');
        const loaderBear = document.getElementById('loader-bear');

        const goofyLines = [
            "Fluffing the teddies...",
            "Checking hug quotas...",
            "Polishing button eyes...",
            "Measuring cuddle radius...",
            "Stitching with love...",
            "Waking up the bears..."
        ];

        // Text cycling animation
        // Text cycling
        if (loaderText) {
            let lineIndex = 0;
            setInterval(() => {
                lineIndex = (lineIndex + 1) % goofyLines.length;
                loaderText.textContent = goofyLines[lineIndex];
            }, 800);
        }

        // Typography Loader Animation
        const loaderBrand = document.querySelector('.loader-brand');

        if (loaderBrand) {
            gsap.to(loaderBrand, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                delay: 0.2
            });
        }

        const removeLoader = () => {
            if (!loader.classList.contains('removing')) {
                loader.classList.add('removing');

                gsap.to(loader, {
                    autoAlpha: 0,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        if (loader.parentNode) loader.remove();
                        if (heroOverlay && scrollIndicator) {
                            gsap.to([heroOverlay, scrollIndicator], {
                                autoAlpha: 1,
                                y: 0,
                                duration: 1.5,
                                ease: 'power3.out',
                                stagger: 0.2
                            });
                        }
                    }
                });
            }
        };

        // Progress Bar & Logic
        const tl = gsap.timeline({
            onComplete: () => {
                // Determine if we can close (video ready or no video)
                if (!heroVideo || heroVideo.readyState >= 3) {
                    removeLoader();
                } else {
                    // Wait for video, but cap it at +1s
                    setTimeout(removeLoader, 1000);
                    // Also listen for event just in case
                    heroVideo.addEventListener('loadeddata', removeLoader);
                }
            }
        });

        if (progressBar) {
            tl.to(progressBar, {
                width: '100%',
                duration: 2.2,
                ease: "power1.inOut"
            });
        }

        // If video takes way too long, force remove
        setTimeout(removeLoader, 4000);
    }

    // Fade out scroll indicator on scroll
    if (scrollIndicator) {
        gsap.to(scrollIndicator, {
            autoAlpha: 0,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '10% top',
                scrub: true
            }
        });
    }

    if (heroVideo) {
        // GSAP Parallax
        gsap.set(heroVideo, { xPercent: -50, yPercent: -50 });

        gsap.to(heroVideo, {
            yPercent: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // --- Navigation Reveal (GSAP) ---
    const header = document.getElementById('header');

    // Explicit trigger for entire body/document to ensure scroll position tracking
    if (header) {
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top -100', // Show after 100px scroll
            toggleClass: { targets: header, className: 'header-visible' },
        });
    }

    // Smooth Scroll for Anchors (Delegated to Lenis)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target);
            }
        });
    });

    // --- Feature Cards Spotlight Effect ---
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set CSS variables for the spotlight position
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Testimonial Staggered Entrance ---
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 0) {
        gsap.set(testimonials, { autoAlpha: 0, y: 50, scale: 0.9 });

        ScrollTrigger.batch(testimonials, {
            start: "top 85%",
            onEnter: batch => gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                stagger: 0.15,
                duration: 0.8,
                ease: "back.out(1.7)",
                overwrite: true
            }),
            once: true // Only animate once
        });
    }

    // --- PDP Logic (Single Product Page) ---
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const mainImage = document.getElementById('main-product-image');
    const colorNameDisplay = document.getElementById('selected-color-name');

    // Shop Page Entry Animation
    const productContainer = document.querySelector('.product-container');
    if (productContainer) {
        // Kill generic ScrollTriggers for these specific elements to avoid conflict
        const shopFadeElements = productContainer.querySelectorAll('.fade-in');
        shopFadeElements.forEach(el => {
            const st = ScrollTrigger.getById(el); // If I assigned IDs... (I didn't, but generic ones might exist)
            // Actually, easier to just manually override by running a timeline immediately
            // GSAP overwrites should handle it if we set overwrite: true
        });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Ensure elements are invisible initially (handled by CSS .fade-in, but let's be sure)
        gsap.set('.product-gallery, .product-details', { autoAlpha: 0, y: 30 });

        tl.to('.product-gallery', {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            overwrite: true // Override the generic scrolltrigger
        })
            .to('.product-details', {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                overwrite: true
            }, "-=0.8"); // Stagger slightly overlap
    }

    if (colorSwatches.length > 0 && mainImage) {
        // Map color codes to filenames
        const colorMap = {
            'og': 'ted_og.jpg',
            'blue': 'ted_blue.png',
            'brown': 'ted_brown.png',
            'lime': 'ted_lime.png',
            'peach': 'ted_peach.png',
            'pink': 'ted_pink.png'
        };

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                // Update Active State
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');

                // Update Text
                const name = swatch.getAttribute('data-name');
                if (colorNameDisplay) colorNameDisplay.textContent = name;

                // Update Image with Fade Effect
                const colorKey = swatch.getAttribute('data-color');
                const newSrc = `images/colors/${colorMap[colorKey]}`;

                // Quick fade out/in
                mainImage.style.opacity = '0.8';
                setTimeout(() => {
                    mainImage.src = newSrc;
                    mainImage.style.opacity = '1';
                }, 150);
            });
        });
    }

    // Quantity Selector
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.getElementById('qty-minus');
    const btnPlus = document.getElementById('qty-plus');

    if (qtyInput && btnMinus && btnPlus) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) qtyInput.value = val - 1;
        });
        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < 10) qtyInput.value = val + 1;
        });
    }

    // --- Cart Persistence & Logic ---
    const CART_KEY = 'tedbud_cart';

    // Helper: Get Cart
    const getCart = () => {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    // Helper: Save Cart
    const saveCart = (cart) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
    };

    // Helper: Update Header Count
    const updateCartCount = () => {
        const cart = getCart();
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

        const cartCounters = document.querySelectorAll('.cart-count');
        cartCounters.forEach(counter => {
            counter.textContent = totalQty;

            // Optional: Bounce animation on update
            if (totalQty > 0 && gsap) {
                gsap.fromTo(counter, { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 });
            }
        });
    };

    // Initialize Count on Load
    updateCartCount();

    // Map color codes to filenames (Available in upper scope, handled here for Cart logic consistency if needed)
    const colorMap = {
        'og': 'ted_og.jpg',
        'blue': 'ted_blue.png',
        'brown': 'ted_brown.png',
        'lime': 'ted_lime.png',
        'peach': 'ted_peach.png',
        'pink': 'ted_pink.png'
    };


    // Add to Cart Logic (Shop Page)
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('qty-input');
            const qty = parseInt(qtyInput ? qtyInput.value : 1);

            // Get Selected Attributes
            const activeSwatch = document.querySelector('.color-swatch.active');
            const colorKey = activeSwatch ? activeSwatch.getAttribute('data-color') : 'og';
            const colorName = activeSwatch ? activeSwatch.getAttribute('data-name') : 'Classic Orange';

            const cart = getCart();

            // Generate ID based on color
            const existingItemIndex = cart.findIndex(item => item.colorKey === colorKey);

            if (existingItemIndex > -1) {
                // Update quantity
                cart[existingItemIndex].quantity += qty;
            } else {
                // Add new item
                cart.push({
                    id: colorKey,
                    name: 'The Original TedBud',
                    color: colorName,
                    colorKey: colorKey,
                    price: 59.00,
                    quantity: qty,
                    image: `images/colors/${colorMap[colorKey]}`
                });
            }

            saveCart(cart);

            saveCart(cart);

            // Visual feedback with GSAP TextPlugin
            const originalText = "Add to Buddy Bag";

            // Register Plugin (safe to call multiple times)
            gsap.registerPlugin(TextPlugin);

            // Create a timeline for the sequence
            const tl = gsap.timeline();

            // Step 1: "Adding..." state
            tl.to(addToCartBtn, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            })
                .to(addToCartBtn, {
                    text: "Adding...",
                    backgroundColor: '#FFA500', // Intermediate orange
                    borderColor: '#FFA500',
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                })
                // Step 2: "Added! ✓" state (simulated delay)
                .to(addToCartBtn, {
                    text: "Added! ✓",
                    backgroundColor: '#4CAF50', // Success green
                    borderColor: '#4CAF50',
                    scale: 1.05,
                    duration: 0.3,
                    delay: 0.6, // Wait a bit to show "Adding..."
                    ease: "back.out(1.7)"
                })
                // Step 3: Pulse Nav Cart Icon
                .call(() => {
                    const cartIcons = document.querySelectorAll('.cart-link');
                    cartIcons.forEach(icon => {
                        gsap.fromTo(icon, { scale: 1 }, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
                    });
                })
                // Step 4: Revert after delay
                .to(addToCartBtn, {
                    text: originalText,
                    backgroundColor: '', // Revert to CSS default
                    borderColor: '',
                    scale: 1,
                    duration: 0.4,
                    delay: 2,
                    ease: "power2.in"
                });
        });
    }

    // --- Cart Page Rendering Logic ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMsg = document.getElementById('empty-cart-message');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');

    if (cartItemsContainer) {
        const renderCart = () => {
            const cart = getCart();

            // Calculate Total
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '';
                cartItemsContainer.appendChild(emptyCartMsg);
                emptyCartMsg.style.display = 'block';
                if (cartSubtotal) cartSubtotal.textContent = '$0.00';
                if (cartTotal) cartTotal.textContent = '$0.00';
                return;
            }

            // Clear container (except empty msg template if we wanted to keep it, but relying on re-append)
            cartItemsContainer.innerHTML = '';

            cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-color">Color: ${item.color}</div>
                        <div class="cart-item-controls">
                             <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                             <div class="quantity-display">
                                <button class="qty-btn-sm minus" data-index="${index}">−</button>
                                <span class="qty-num">${item.quantity}</span>
                                <button class="qty-btn-sm plus" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            // Update Summaries
            if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
            if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;

            // Attach Listeners (Remove, Plus, Minus)
            const handleCartAction = (action, index) => {
                const currentCart = getCart();
                if (action === 'remove') {
                    currentCart.splice(index, 1);
                } else if (action === 'plus') {
                    if (currentCart[index].quantity < 10) currentCart[index].quantity++;
                } else if (action === 'minus') {
                    if (currentCart[index].quantity > 1) {
                        currentCart[index].quantity--;
                    } else {
                        // Optional: Remove if minus at 1? Or just do nothing?
                        // User usually expects remove btn for removal. I'll stop at 1.
                    }
                }
                saveCart(currentCart);
                renderCart(); // Re-render
            };

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleCartAction('remove', parseInt(e.target.getAttribute('data-index'))));
            });

            document.querySelectorAll('.qty-btn-sm.plus').forEach(btn => {
                btn.addEventListener('click', (e) => handleCartAction('plus', parseInt(e.target.getAttribute('data-index'))));
            });

            document.querySelectorAll('.qty-btn-sm.minus').forEach(btn => {
                btn.addEventListener('click', (e) => handleCartAction('minus', parseInt(e.target.getAttribute('data-index'))));
            });
        };

        renderCart();
    }

    // --- Global Click Spark Effect ---
    document.addEventListener('click', (e) => {
        const sparkCount = 8;
        const colors = ['#fa8112', '#f4f1ea', '#ff9f43']; // Theme colors (Orange, Cream, Light Orange)

        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.classList.add('click-spark');
            document.body.appendChild(spark);

            // Randomize Color
            spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // Initial Position (centered on click)
            const size = Math.random() * 8 + 4; // 4px to 12px
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.left = `${e.clientX}px`;
            spark.style.top = `${e.clientY + window.scrollY}px`; // Account for scroll
            spark.style.position = 'absolute';
            spark.style.borderRadius = '50%';
            spark.style.pointerEvents = 'none';
            spark.style.zIndex = '9999';

            // Physics
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 30; // Radius distance

            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity;

            // Animate
            gsap.to(spark, {
                x: destX,
                y: destY,
                opacity: 0,
                scale: 0,
                duration: 0.5,
                ease: "power2.out",
                onComplete: () => spark.remove()
            });
        }
    }); // Close click listener

    // --- Logo Loop / Marquee Animation ---
    // --- Logo Loop / Marquee Animation ---
    const initLogoLoop = () => {
        const loopTrack = document.querySelector('.logo-loop-track');
        if (!loopTrack) return;

        // Prevent re-init
        if (loopTrack.dataset.init === 'true') return;
        loopTrack.dataset.init = 'true';

        // 1. Capture Originals
        const originalItems = Array.from(loopTrack.children);
        if (originalItems.length === 0) return;

        // 2. Clear Track
        loopTrack.innerHTML = '';

        // 3. Create a "Unit" that fills the screen + buffer
        const unitFragment = document.createDocumentFragment();
        // Start with one set
        originalItems.forEach(item => unitFragment.appendChild(item.cloneNode(true)));
        loopTrack.appendChild(unitFragment);

        // Add more sets until we cover 120% of screen width (min 4 sets for safety on load)
        const ensureCoverage = () => {
            while (loopTrack.scrollWidth < window.innerWidth * 1.5 || loopTrack.children.length < originalItems.length * 4) {
                originalItems.forEach(item => loopTrack.appendChild(item.cloneNode(true)));
            }
        };
        ensureCoverage();

        // 4. Now we have one 'Unit' (A). We need [A][A] to loop seamless from 0 to -50%.
        // But wait, xPercent -50 moves the MAIN element. 
        // If track is [A] and we move -50%, we show half of A.
        // We need the content to be [A][A]. 
        // So we clone the ENTIRE current content of loopTrack.

        const currentChildren = Array.from(loopTrack.children);
        currentChildren.forEach(child => {
            loopTrack.appendChild(child.cloneNode(true));
        });

        // Now loopTrack has [A][A]. (Doubled). 
        // Total width is 2 * Width(A).
        // Animated xPercent: -50 moves it by Width(A).
        // At start: Shows [First Half of A] (on screen) ... offscreen [Second Half A] [First Half A copy] ...
        // At -50%: Shows [First Half A copy].
        // Visual is identical.

        // 5. Animate
        // Duration needs to be based on width to keep constant speed.
        const calculateDuration = () => {
            const totalWidth = loopTrack.scrollWidth;
            const moveWidth = totalWidth / 2; // We move -50%
            const speed = 80; // pixels per second
            return moveWidth / speed;
        };

        const duration = calculateDuration();

        const loopAnim = gsap.to(loopTrack, {
            xPercent: -50, // Move exactly half its total width
            ease: "none",
            duration: duration || 20, // Fallback safe
            repeat: -1,
        });

        // Hover Effect
        const loopSection = document.querySelector('.logo-loop-section');
        if (loopSection) {
            loopSection.onmouseenter = () => gsap.to(loopAnim, { timeScale: 0, duration: 0.5 });
            loopSection.onmouseleave = () => gsap.to(loopAnim, { timeScale: 1, duration: 0.5 });
        }

        // Resize Listener to ensure coverage?
        // If screen grows huge, we might need more items. 
        // For now, simpler is better. We added coverage * 1.5 or 4 sets.
    };

    // Initialize on load to ensure images have dimensions for math? 
    // xPercent doesn't need pixel dimensions immediately, but scrollWidth check does.
    if (document.readyState === 'complete') {
        initLogoLoop();
    } else {
        window.addEventListener('load', initLogoLoop);
    }

    // --- Mock Auth Logic & Validation ---
    const allowedDomains = ['gmail.com', 'hotmail.com', 'nmims.in', 'nmims.edu.in', 'yahoo.com'];

    const validateEmail = (email) => {
        const domain = email.split('@')[1];
        return domain && allowedDomains.includes(domain);
    };

    const validatePassword = (password) => {
        // Uppercase, Number, Special Character
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasNumber && hasSpecial;
    };

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!validateEmail(email)) {
                alert(`Invalid email domain.\nAllowed: ${allowedDomains.join(', ')}`);
                return;
            }

            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Signing in...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            btn.disabled = false;

            if (error) {
                alert(`Error signing in: ${error.message}`);
                btn.textContent = originalText;
                btn.style.opacity = '1';
            } else {
                alert('Successfully signed in!');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                window.location.href = 'index.html';
            }
        });
    }

    // ==========================================
    // PASSWORD STRENGTH METER v3
    // ==========================================

    (function initPasswordStrengthV3() {
        const passwordInput = document.getElementById('password');
        const segments = document.querySelectorAll('.pwd-segment');
        const strengthText = document.getElementById('pwd-strength-text');
        const reqItems = document.querySelectorAll('.pwd-req-item');

        if (!passwordInput || segments.length === 0) return;

        // Define requirements
        const requirements = {
            length: (pwd) => pwd.length >= 8,
            uppercase: (pwd) => /[A-Z]/.test(pwd),
            number: (pwd) => /\d/.test(pwd),
            special: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
        };

        // Update on input (catches typing, paste, autofill)
        passwordInput.addEventListener('input', updateStrength);

        function updateStrength() {
            const pwd = passwordInput.value;

            // Check each requirement
            const results = {};
            let passedCount = 0;

            for (const [key, test] of Object.entries(requirements)) {
                const passed = test(pwd);
                results[key] = passed;
                if (passed) passedCount++;
            }

            // Update requirement checklist
            updateChecklist(results);

            // Update meter
            updateMeter(passedCount, pwd.length);
        }

        function updateChecklist(results) {
            reqItems.forEach(item => {
                const reqKey = item.getAttribute('data-req');
                const checkSpan = item.querySelector('.pwd-check');

                if (results[reqKey]) {
                    item.classList.add('met');
                    checkSpan.textContent = '✓';
                } else {
                    item.classList.remove('met');
                    checkSpan.textContent = '○';
                }
            });
        }

        function updateMeter(passed, length) {
            // Clear all states
            segments.forEach(seg => {
                seg.className = 'pwd-segment';
            });
            strengthText.className = 'pwd-strength-text';

            if (length === 0) {
                strengthText.textContent = 'Enter password';
                return;
            }

            // Calculate strength level (1-4 based on requirements passed)
            // Always show at least 1 segment when there's any input
            let level = passed;
            if (level === 0) level = 1; // Show at least "Too weak" when typing

            // Fill segments based on level
            const states = ['', 'active', 'weak', 'fair', 'strong']; // index 1-4
            const labels = ['', 'Too weak', 'Weak', 'Fair', 'Strong!'];
            const stateClass = states[level] || 'active';
            const labelText = labels[level] || 'Too weak';

            // Activate segments up to current level
            for (let i = 0; i < level && i < segments.length; i++) {
                segments[i].classList.add(stateClass);
            }

            // Update text
            strengthText.textContent = labelText;
            strengthText.classList.add(stateClass);
        }
    })();

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            const confirmPass = document.getElementById('confirm-password').value;

            // Email Validation
            if (!validateEmail(email)) {
                alert(`Invalid email domain.\nAllowed: ${allowedDomains.join(', ')}`);
                return;
            }

            // Password Validation
            if (!validatePassword(pass)) {
                alert('Password must contain:\n- At least one uppercase letter\n- At least one number\n- At least one special character');
                return;
            }

            if (pass !== confirmPass) {
                alert('Passwords do not match!');
                return;
            }

            const btn = registerForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Creating Account...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: pass,
                options: {
                    data: {
                        full_name: fullname
                    }
                }
            });

            btn.disabled = false;

            if (error) {
                alert(`Error creating account: ${error.message}`);
                btn.textContent = originalText;
                btn.style.opacity = '1';
            } else {
                alert('Account created successfully! Check your email to verify.');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                window.location.href = 'login.html';
            }
        });
    }

    // --- Password Reset Logic ---
    const resetRequestForm = document.getElementById('reset-request-form');
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            const btn = resetRequestForm.querySelector('button');
            const msgEl = document.getElementById('reset-request-msg');
            
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            console.log('Attempting password reset for:', email);
            console.log('Redirect URL:', `${window.location.origin}/update-password.html`);
            
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password.html`,
            });

            console.log('Reset response data:', data);
            console.log('Reset response error:', error);
            
            btn.textContent = 'Send Reset Link';
            btn.style.opacity = '1';
            btn.disabled = false;
            
            msgEl.style.display = 'block';
            if (error) {
                msgEl.style.color = '#ff4d4f'; 
                msgEl.textContent = `Error: ${error.message}`;
                console.error('Reset error details:', JSON.stringify(error));
            } else {
                msgEl.style.color = '#4CAF50'; 
                msgEl.textContent = 'Check your email for the reset link!';
            }
        });
    }

    const updatePasswordForm = document.getElementById('update-password-form');
    if (updatePasswordForm) {
        
        // Supabase sends the user back with an access token in the URL hash.
        // We need to listen for the PASSWORD_RECOVERY event to know they arrived from an email.
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // The user is now temporarily logged in so they can update their password
                console.log("Password recovery mode active.");
            }
        });

        // Check if we arrived here with an error in the hash
        const hash = window.location.hash;
        if (hash && hash.includes('error_description')) {
            const params = new URLSearchParams(hash.substring(1));
            const msgEl = document.getElementById('update-pwd-msg');
            msgEl.style.display = 'block';
            msgEl.style.color = '#ff4d4f';
            msgEl.textContent = decodeURIComponent(params.get('error_description').replace(/\+/g, ' '));
        }

        updatePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const btn = updatePasswordForm.querySelector('button');
            const msgEl = document.getElementById('update-pwd-msg');
            
            // Re-use existing validation if it's available in scope
            if (typeof validatePassword === 'function' && !validatePassword(newPassword)) {
                msgEl.style.display = 'block';
                msgEl.style.color = '#ff4d4f';
                msgEl.innerHTML = 'Password must contain:<br>- At least one uppercase letter<br>- At least one number<br>- At least one special character';
                return;
            }
            
            btn.textContent = 'Updating...';
            btn.style.opacity = '0.8';
            btn.disabled = true;
            
            // The user must be authenticated (which they are via the hash token) to update their password
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            
            btn.textContent = 'Update Password';
            btn.style.opacity = '1';
            btn.disabled = false;
            
            msgEl.style.display = 'block';
            if (error) {
                msgEl.style.color = '#ff4d4f';
                msgEl.textContent = `Error: ${error.message}`;
            } else {
                msgEl.style.color = '#4CAF50';
                msgEl.textContent = 'Password updated successfully! Redirecting to login...';
                
                // Sign them out so they have to log in with the new password (optional but good practice)
                await supabase.auth.signOut();
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }

}); // Close DOMContentLoaded
