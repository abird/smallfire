
const dbobj = {
	// database functions
	get: function (dataPath, options) { return fetchRequest(this.dbinfo, { dataPath, options }) },
	set: function (dataPath, value, options) { return fetchRequest(this.dbinfo, { dataPath, method: 'PUT', value, options }) },
	update: function (dataPath, value, options) { return fetchRequest(this.dbinfo, { dataPath, method: 'PATCH', value, options }) },
	push: function (dataPath, value, options) { return fetchRequest(this.dbinfo, { dataPath, method: 'POST', value, options }) },
	delete: function (dataPath, options) { return fetchRequest(this.dbinfo, { dataPath, method: 'DELETE', options }) },
	listen: function (dataPath, datafn, options) {
		const url = getURL(this.dbinfo, { dataPath, options })
		let currentData, evtSource, evtSourceTime

		const refreshToken = async () => {
			await this.dbinfo.auth.tokenRefresh()
			setupEvtSource()
		}

		const updateData = (dataText, merge) => {
			const { path, data } = JSON.parse(dataText)
			const steps = path.split('/').filter(step => step.length)
			const last = steps.pop()
			let loc = currentData
			steps.forEach(step =>
				(loc[step] = loc[step] || {}) && (loc = loc[step]))
			if (merge) {
				if (last) {
					loc = loc[last]
				}
				Object.assign(loc, data)
			} else {
				if (last) {
					if (data !== null) {
						loc[last] = data
					} else {
						delete loc[last]
					}
				} else {
					currentData = data
				}
			}
			datafn(currentData, path, data)
		}

		const setupEvtSource = () => {
			evtSource = new EventSource(url);
			evtSource.onerror = function () {
				if (new Date() - evtSourceTime > 2000) {
					// error is likely an expired token, refresh
					refreshToken()
				} else {
					// unfortunately, we don't know exact error
					throwError('Error opening connection')
				}
			}

			// Event listeners. We don't handle "keep-alive" and "cancel"
			evtSource.addEventListener("put", e => updateData(e.data))
			evtSource.addEventListener("patch", e => updateData(e.data, true))
			evtSource.addEventListener("auth_revoked", e => refreshToken())

			evtSourceTime = new Date()
		}
		setupEvtSource()
		return () => evtSource.close()
	},
}

export function getFirebaseDB(database, auth, region) {
	const dbinfo = {
		host: 'firebaseio.com',
		database,
		auth,
	}
	if (region) {
		const regionMap = {
			us: 'firebaseio.com',
			europe: 'europe-west1.firebasedatabase.app',
			asia: 'asia-southeast1.firebasedatabase.app',
			'us-central1': 'firebaseio.com',
			'europe-west1': 'europe-west1.firebasedatabase.app',
			'asia-southeast1': 'asia-southeast1.firebasedatabase.app',
		}
		dbinfo.host = regionMap[region] || region
	}
	return { ...dbobj, dbinfo }
}

const throwError = error => { throw error }

function getURL(dbinfo, { dataPath, options }) {
	const { host, database, auth } = dbinfo
	if (options) {
		// put string values in quotes
		Object.keys(options).map(function (key) {
			const value = options[key]
			if (typeof value === 'string' && !value.match(/^".*"$/)) {
				options[key] = `"${value}"`
			}
		});
	}
	const searchParams = new URLSearchParams(options)
	if (auth) {
		searchParams.append('auth', auth.idToken)
	}
	let parmsString = searchParams.toString()
	return `https://${database}.${host}/${dataPath}.json${parmsString ? '?' + parmsString : ''}`
}

async function fetchRequest(dbinfo, { dataPath, method, value, options, headers }) {
	const url = getURL(dbinfo, { dataPath, options })
	const fetchOptions = {
		method: method || 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
		},
	}
	if (value) {
		fetchOptions.body = JSON.stringify(value)
	}
	if (headers) {
		Object.assign(fetchOptions.headers, headers)
	}

	let response = await fetch(url, fetchOptions);
	let data = await response.json()

	if (!response.ok) {
		const auth = dbinfo.auth
		if (auth && response.status === 401) {
			// invalid id token, try refreshing the id token and try again
			await auth.tokenRefresh()
			return await fetchRequest(dbinfo, { dataPath, method, value, options })
		} else {
			// throw error
			throwError(data.error)
		}
	}

	return data
}

if (typeof window !== 'undefined') {
	window.smallfire = window.smallfire || {}
	window.smallfire['getFirebaseDB'] = getFirebaseDB
}
