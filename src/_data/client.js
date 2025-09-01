module.exports = {
    name: "noblessa",
    email: "info@noblessa-usa.com",
    phoneForTel: "123-456-7890",
    phoneFormatted: "(123) 456-7890",
    address: {
        lineOne: "First Address Line",
        lineTwo: "Second Address Line",
        city: "City Name",
        state: "STATE",
        zip: "12345",
        country: "US",
        mapLink: "https://maps.app.goo.gl/TEdS5KoLC9ZcULuQ6",
    },
    socials: {
        facebook: "https://www.facebook.com/",
        instagram: "https://www.instagram.com/",
        linkedin: "https://www.linkedin.com/company/",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://noblessa-usa.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
