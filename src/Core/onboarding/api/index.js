// Uncomment these if you want to remove firebase and add your own custom backend:
// import {authManager} from './local/localAuthManager';
// export { authManager };

// Uncomment these if you want to use our mongo + nodejs custom backend:
// import {authManager} from './backend/authManager';
// export { authManager };


// Remove these lines if you want to remove firebase and add your own custom backend:
import authManager from './firebase/firebaseAuthManager'

console.log('api/index.js: exporting authManager', authManager)
export { authManager }
