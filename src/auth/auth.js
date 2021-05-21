const AUTH_STORAGE_KEY = 'Firebase-Auth-Data'

export function currentUser() {
	const data = localStorage.getItem(AUTH_STORAGE_KEY)
	if (data) {
		const user = JSON.parse(data)
		user.tokenRefresh = refreshToken
		return user
	}
}

export function saveUser(userData) {
	const { tokenRefresh, ...data } = userData
	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
}

async function fetchRequest(request, accountKey, body, contentType) {
	const url = `https://identitytoolkit.googleapis.com/v1/${request}?key=${accountKey}`
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
			'Content-Type': contentType || 'application/json',
		},
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
	const data = await response.json()

	if (!response.ok) {
		// error
		throw data
	}
	return data
}

export async function signIn(email, password, apiKey) {
	const data = await fetchRequest('accounts:signInWithPassword', apiKey, { email, password, returnSecureToken: true })
	data.apiKey = apiKey
	saveUser(data)
	data.tokenRefresh = refreshToken
	return data
}

export function signOut() {
	localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function refreshToken() {
	const data = await fetchRequest('token', this.apiKey, `grant_type=refresh_token&refresh_token=${this.refreshToken}`, 'application/x-www-form-urlencoded')
	this.idToken = data.id_token
	this.refreshToken = data.refresh_token
	saveUser(this)
}

const auth = { currentUser, saveUser, signIn, signOut }
if (typeof window !== 'undefined') {
	window.smallfire = window.smallfire || {}
	window.smallfire['auth'] = auth
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = auth;
}
