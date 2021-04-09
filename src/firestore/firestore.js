import { docListen } from './listen'
import { docGet, docSet, docList, docUpdate, docDelete, docQuery } from './rest'

const dbobj = {
	// database functions
	listen: function (documentPath, datafn, errorfn) { return docListen(this.dbinfo, documentPath, datafn, errorfn) },
	get: function (documentPath, options) { return docGet(this.dbinfo, documentPath, options) },
	query: function (query, options) { return docQuery(this.dbinfo, query, options) },
	list: function (documentPath, options) { return docList(this.dbinfo, documentPath, options) },
	set: function (documentPath, value, options) { return docSet(this.dbinfo, documentPath, value, options) },
	update: function (documentPath, value, options) { return docUpdate(this.dbinfo, documentPath, value, options) },
	delete: function (documentPath, options) { return docDelete(this.dbinfo, documentPath, options) },
}

export function getFirestoreDB(database, auth, emulator) {
	const dbinfo = {
		host: 'https://firestore.googleapis.com',
		database,
		auth,
	}
	if (emulator === false) {
		// disable emulator
		dbinfo.host = 'https://firestore.googleapis.com'
	} else if (emulator && typeof emulator === 'string') {
		dbinfo.host = emulator.startsWith('http') ? emulator : `http://${emulator}`
	} else {
		dbinfo.host = 'http://localhost:8080'
	}
	return { ...dbobj, dbinfo }
}

if (typeof window !== 'undefined') {
	window.smallfire = window.smallfire || {}
	window.smallfire['getFirestoreDB'] = getFirestoreDB
}
