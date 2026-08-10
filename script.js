/* ==========================================================================
   MAA SAI METAL INDUSTRIES - JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    // 2. Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', () => {
            navbar.classList.toggle('active');
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu on clicking link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                if (hamburger.querySelector('i')) {
                    hamburger.querySelector('i').classList.add('fa-bars');
                    hamburger.querySelector('i').classList.remove('fa-times');
                }
            });
        });
    }

    // 3. Dark Mode Toggle
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = darkToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // 4. Counter Animation for Stats
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    const startCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const speed = target / 50; // Controls animation speed

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.stats-bar');
        if (statsSection) {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight;

            if (sectionPos < screenPos && !animated) {
                animated = true;
                startCounters();
            }
        }
    });

    // 5. Facility Tabs Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 6. Gallery Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 7. Lightbox Modal Logic
    const modal = document.getElementById('galleryModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalVisual = document.getElementById('modalVisual');
    const modalClose = document.querySelector('.modal-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.getAttribute('data-title');
            const placeholderContent = item.querySelector('.gallery-placeholder').innerHTML;

            modalTitle.innerText = title;
            modalVisual.innerHTML = `<div class="gallery-placeholder" style="height:250px;">${placeholderContent}</div>`;
            modal.style.display = 'flex';
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 8. Contact Form Submission Handling
    const contactForm = document.getElementById('mainContactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            formFeedback.style.color = '#10b981';
            formFeedback.innerText = 'Thank you! Your quotation request has been received. Our sales engineering team will reach out within 24 hours.';
            contactForm.reset();

            setTimeout(() => {
                formFeedback.innerText = '';
            }, 5000);
        });
    }

    // 9. Back to Top Button
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});