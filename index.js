
import { getFirestoreDB } from './src/firestore/firestore'
import { getFirebaseDB } from './src/firebase/firebase'
import { currentUser, saveUser, signIn, signOut } from './src/auth/auth'

if (typeof module !== 'undefined' && module.exports) {
	module.exports = { auth: { currentUser, saveUser, signIn, signOut }, getFirestoreDB, getFirebaseDB };
}
