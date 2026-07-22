/**
 * Firebase web config for Dr.Swift public site (project: drswift-platform).
 * Authorized domain: drswift.in — Google provider enabled in Firebase Auth.
 */
window.DRSWIFT_FIREBASE_CONFIG = {
  appId: "1:798173384741:web:72c0e11a3f811aef6cefcc",
  apiKey: "AIzaSyAnE4oPO9vxVoS493P0gPZcB4b5hYVdMKA",
  // Same-origin authDomain + Worker proxy of /__/auth → avoids partitioned storage errors
  authDomain: "drswift.in",
  projectId: "drswift-platform",
  storageBucket: "drswift-platform.firebasestorage.app",
  messagingSenderId: "798173384741",
};
