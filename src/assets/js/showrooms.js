// Showrooms page functionality with Leaflet integration
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    var map = L.map('showroom-map', {
        attributionControl: false,
        center: [36.7783, -119.4179], // Center of California
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB',
        subdomains: 'abcd',
        maxZoom: 18
    }).addTo(map);

    // Custom marker icon
    var customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin">
                 <div class="marker-inner"></div>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    // Showroom data
    var showrooms = [
        {
            name: 'Jupiter',
            address: '1405 FL A1AAlt #107, Jupiter, FL 33469',
            lat: 26.9342,
            lng: -80.0942,
            phone: '(561) 401-9866',
            hours: 'Mon-Fri: 10AM-5PM',
            mapUrl: 'https://maps.app.goo.gl/6GesrFPCpfVostMm6',
            image: '../../assets/images/showrooms/jupiteropt2.webp',
            features: [
                'Coastal Luxury Designs',
                'Outdoor Kitchen Solutions', 
                'Custom Design Services'
            ],
            location: 'jupiter'
        },
        {
            name: 'San Jose',
            address: '3109 Stevens Creek Blvd, San Jose, CA 95117',
            lat: 37.3382,
            lng: -121.8863,
            phone: '(408) 674-6493',
            hours: 'Mon-Fri: 9AM-5PM',
            mapUrl: 'https://maps.app.goo.gl/5NzkytGaHXwjnJjQ8',
            image: '../../assets/images/showrooms/sanjoseopt2.webp',
            features: [
                'Modern Design Collections',
                'Interactive Material Library',
                '3D Design Visualization'
            ],
            location: 'sanjose'
        },
        {
            name: 'Pasadena',
            address: '474 S Arroyo Pkwy, Pasadena, CA 91105',
            lat: 34.1478,
            lng: -118.1445,
            phone: '(626) 314-2994',
            hours: 'Mon-Sat: 10AM-5PM',
            mapUrl: 'https://maps.app.goo.gl/pTndTscfTQnXUz2F8',
            image: '../../assets/images/showrooms/pasadenaopt1.webp',
            features: [
                'Premium Designer Selections',
                'Full Kitchen & Bath Displays',
                'Expert Design Consultation'
            ],
            location: 'pasadena'
        }
    ];

    // Generate showroom cards dynamically
    function generateShowroomCards() {
        const showroomGrid = document.getElementById('showroom-grid');
        
        showrooms.forEach(function(showroom) {
            const cardHTML = `
                <div class="cs-showroom-card" data-location="${showroom.location}">
                    <div class="cs-card-header">
                        <h3 class="cs-card-title">${showroom.name} Showroom</h3>
                        <div class="cs-card-location">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            ${showroom.address}
                        </div>
                    </div>
                    <div class="cs-card-image">
                        <img src="${showroom.image}" alt="${showroom.name} Showroom" loading="lazy">
                    </div>
                    <div class="cs-card-body">
                        <div class="cs-card-info">
                            ${showroom.features.map(feature => `
                                <div class="cs-info-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="cs-card-contact">
                            <div class="cs-card-contact-item">
                                <span class="cs-contact-label">Phone:</span>
                                <a href="tel:${showroom.phone}" class="cs-contact-value">${showroom.phone}</a>
                            </div>
                            <div class="cs-card-contact-item">
                                <span class="cs-contact-label">Hours:</span>
                                <span class="cs-contact-value">${showroom.hours}</span>
                            </div>
                        </div>
                        <div class="cs-card-actions">
                            <a href="${showroom.mapUrl}" target="_blank" class="cs-action-btn cs-secondary">
                                View on Google
                            </a>
                            <button class="cs-action-btn cs-primary contact-modal-btn" data-showroom="${showroom.name}" data-phone="${showroom.phone}">
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            showroomGrid.innerHTML += cardHTML;
        });
    }

    // Generate cards when page loads
    generateShowroomCards();

    // Add markers to the map
    showrooms.forEach(function(showroom) {
        var marker = L.marker([showroom.lat, showroom.lng], {
            icon: customIcon
        }).addTo(map);

        // Create popup content
        var popupContent = `
            <div class="showroom-popup">
                <h3 class="popup-title">${showroom.name}</h3>
                <div class="popup-content">
                    <p class="popup-address"><strong>Address:</strong><br>${showroom.address}</p>
                    <p class="popup-phone"><strong>Phone:</strong><br>${showroom.phone}</p>
                    <p class="popup-hours"><strong>🕒 Hours:</strong><br>${showroom.hours}</p>
                    <div class="popup-buttons">
                        <a href="${showroom.mapUrl}" target="_blank" class="popup-btn">Get Directions</a>
                        <a href="tel:${showroom.phone}" class="popup-btn popup-btn-secondary">Call Now</a>
                    </div>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
    });

    // Fit map to show all markers
    var group = new L.featureGroup(showrooms.map(s => L.marker([s.lat, s.lng])));
    map.fitBounds(group.getBounds().pad(0.1));

    // Contact Modal Functionality
    const modal = document.getElementById('contact-modal');
    const modalShowroomName = document.getElementById('modal-showroom-name');
    const modalShowroomImage = document.getElementById('modal-showroom-image');
    const showroomInput = document.getElementById('showroom');
    const contactButtons = document.querySelectorAll('.contact-modal-btn');
    const closeModal = document.querySelector('.modal-close');
    const submitButton = document.getElementById('submit-contact-form');
    const contactForm = document.getElementById('contact-form');

    // Open modal when contact button is clicked
    contactButtons.forEach(button => {
        button.addEventListener('click', function() {
            const showroomName = this.getAttribute('data-showroom');
            modalShowroomName.textContent = showroomName;
            showroomInput.value = showroomName;
            
            // Find the corresponding showroom data and set the image
            const showroom = showrooms.find(s => s.name === showroomName);
            if (showroom) {
                modalShowroomImage.src = showroom.image;
                modalShowroomImage.alt = `${showroom.name} Showroom`;
            }
            
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        });
    });

    // Close modal
    function closeContactModal() {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        contactForm.reset();
    }

    closeModal.addEventListener('click', closeContactModal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeContactModal();
        }
    });

    // Reset field border color on input
    document.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', function() {
            this.style.borderColor = '#d1d5db';
        });
    });
});
