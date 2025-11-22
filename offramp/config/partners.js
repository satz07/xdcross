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
function getPartner(partnerId) {
  console.log("1",partnerId)
  console.log("2",partners)
  const partner = partners[partnerId];
  console.log("3",partner)
  if (!partner) {
    console.log(`[getPartner] Partner '${partnerId}' not found in partners config`);
    return null;
  }
  
  if (!partner.enabled) {
    console.log(`[getPartner] Partner '${partnerId}' is disabled`);
    return null;
  }
  
  if (!partner.apiKey || !partner.secret) {
    console.log(`[getPartner] Partner '${partnerId}' missing API key or secret`);
    console.log(`[getPartner] API Key exists: ${!!partner.apiKey}, Secret exists: ${!!partner.secret}`);
    console.log(`[getPartner] COINS_API_KEY from env: ${!!process.env.COINS_API_KEY}`);
    console.log(`[getPartner] COINS_API_SECRET from env: ${!!process.env.COINS_API_SECRET}`);
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

