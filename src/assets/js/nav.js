// add classes for mobile navigation toggling
    var CSbody = document.querySelector("body");
    const CSnavbarMenu = document.querySelector("#cs-navigation");
    const CShamburgerMenu = document.querySelector("#cs-navigation .cs-toggle");

    CShamburgerMenu.addEventListener('click', function() {
        CShamburgerMenu.classList.toggle("cs-active");
        CSnavbarMenu.classList.toggle("cs-active");
        CSbody.classList.toggle("cs-open");
        // run the function to check the aria-expanded value
        ariaExpanded();
    });

    // checks the value of aria expanded on the cs-ul and changes it accordingly whether it is expanded or not 
    function ariaExpanded() {
        const csUL = document.querySelector('#cs-expanded');
        const csExpanded = csUL.getAttribute('aria-expanded');

        if (csExpanded === 'false') {
            csUL.setAttribute('aria-expanded', 'true');
        } else {
            csUL.setAttribute('aria-expanded', 'false');
        }
    }

    
    // This script adds a class to the body after scrolling 100px
    // and we used these body.scroll styles to create some on scroll 
    // animations with the navbar
    
    document.addEventListener('scroll', (e) => { 
        const scroll = document.documentElement.scrollTop;
        if(scroll >= 100){
    document.querySelector('body').classList.add('scroll')
        } else {
        document.querySelector('body').classList.remove('scroll')
        }
    });

    // mobile nav toggle code
    const dropDowns = Array.from(document.querySelectorAll('#cs-navigation .cs-dropdown'));
    for (const item of dropDowns) {
        const button = item.querySelector('.cs-li-link[aria-expanded]');
        const dropdownMenu = item.querySelector('.cs-drop-ul');
        
        const toggleDropdown = (forceClose = false) => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const shouldClose = forceClose || isExpanded;
            
            // Toggle the dropdown state
            item.classList.toggle('cs-active', !shouldClose);
            
            // Update aria attributes
            button.setAttribute('aria-expanded', !shouldClose);
            dropdownMenu.setAttribute('aria-hidden', shouldClose);
        }
        
        // Add click listener to the button
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown();
            });
            
            // Add keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDropdown();
                } else if (e.key === 'Escape') {
                    toggleDropdown(true); // Force close
                }
            });
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#cs-navigation .cs-dropdown')) {
            dropDowns.forEach(item => {
                const button = item.querySelector('.cs-li-link[aria-expanded]');
                const dropdownMenu = item.querySelector('.cs-drop-ul');
                if (button && dropdownMenu) {
                    item.classList.remove('cs-active');
                    button.setAttribute('aria-expanded', 'false');
                    dropdownMenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    });
                                