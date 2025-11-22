/**
 * Partner Configuration
 * Abstracts partner details from end users
 */

const partners = {
  id0001: {
    name: 'Coins.ph',
    baseUrl: 'https://api.pro.coins.ph',
    apiKey: process.env.COINS_API_KEY,
    secret: process.env.COINS_API_SECRET,
    enabled: true
  },
  // Add more partners here
  // partner2: {
  //   name: 'Partner 2',
  //   baseUrl: 'https://api.partner2.com',
  //   apiKey: process.env.PARTNER2_API_KEY,
  //   secret: process.env.PARTNER2_API_SECRET,
  //   enabled: true
  // }
};

/**
 * Get partner configuration by ID
 * @param {string} partnerId - Partner identifier (default: 'id0001')
 * @returns {Object|null} Partner configuration or null if not found
 */
function getPartner(partnerId = 'id0001') {
  const partner = partners[partnerId];
  
  if (!partner) {
    return null;
  }
  
  if (!partner.enabled) {
    return null;
  }
  
  if (!partner.apiKey || !partner.secret) {
    return null;
  }
  
  return partner;
}

/**
 * Get all enabled partners
 * @returns {Array} List of enabled partner IDs
 */
function getEnabledPartners() {
  return Object.keys(partners).filter(id => {
    const partner = partners[id];
    return partner && partner.enabled && partner.apiKey && partner.secret;
  });
}

module.exports = {
  partners,
  getPartner,
  getEnabledPartners
};

