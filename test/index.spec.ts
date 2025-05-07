// Make transactions tests run last by explicitly ordering the imports
import './APIgoods.spec.js';
import './APIhunters.spec.js';
import './APImerchants.spec.js';
// This will run last
import './APItransaction.spec.js';