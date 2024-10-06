document.addEventListener("DOMContentLoaded", () => {
    // Initialize Locomotive Scroll
    const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true
    });

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    scroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("[data-scroll-container]", {
        scrollTop(value) {
            return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        },
        pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
    });

    ScrollTrigger.addEventListener("refresh", () => scroll.update());

    ScrollTrigger.refresh();

    // Navigation Background Change on Scroll
    const nav = document.querySelector('nav');
    scroll.on('scroll', (instance) => {
        if (instance.scroll.y > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 100
            },
            "color": {
                "value": "#ffffff"
            },
            "opacity": {
                "value": 0.5
            },
            "size": {
                "value": 3
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "speed": 2
            }
        }
    });

    // Fade-in animation for sections
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                scroller: '[data-scroll-container]',
                start: 'top 80%',
                end: 'bottom 60%',
                toggleActions: 'play none none none',
                // Remove 'scrub' to prevent the animation from being tied to scroll position
            }
        });
    });
});
