import { decodeDoc } from './values'

const FirestoreHost = 'https://firestore.googleapis.com'
let TargetId = 0

function randomNumber() {
	return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random())).toString(36)
}

function getURL(host, query) {
	return `${FirestoreHost}/google.firestore.v1.Firestore/Listen/channel?${query}`
}

async function fetchRequest(channel, query, body, headers) {
	const { host, auth } = channel
	const url = getURL(host, query)
	const fetchOptions = {
		method: body ? 'POST' : 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
		},
	}
	if (auth) {
		fetchOptions.headers.Authorization = `Bearer ${auth.idToken}`
	}
	if (body) {
		fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
	}
	if (headers) {
		Object.assign(fetchOptions.headers, headers);
	}

	let response = await fetch(url, fetchOptions);

	if (!response.ok) {
		if (auth && response.status === 401) {
			// invalid id token, try refreshing the id token and try again
			await auth.tokenRefresh()
			return await fetchRequest(channel, query, body, headers)
		} else {
			// throw error
			throw response.statusText
		}
	}

	return response
}

async function openChannel(channel, finishfn) {
	channel.targetId = TargetId += 2
	const query = `database=projects/${channel.database}/databases/(default)&VER=8&RID=${channel.RID++}&CVER=22&X-HTTP-Session-Id=gsessionid&$httpHeaders=X-Goog-Api-Client:gl-js/ fire/8.3.1
Content-Type:text/plain
&zx=${randomNumber()}&t=1`
	const body = encodeURI(`count=1&ofs=0&req0___data__={"database":"projects/${channel.database}/databases/(default)","addTarget":{"documents":{"documents":["projects/${channel.database}/databases/(default)/documents/${channel.documentPath}"]},"targetId":${channel.targetId}}}`)
	const response = await fetchRequest(channel, query, body, { 'Content-Type': 'application/x-www-form-urlencoded' })

	const headers = response.headers
	channel.sessionId = headers.get('x-http-session-id')
	const text = await response.text()
	const data = JSON.parse(text.split('\n')[1])
	channel.SID = data[0][1][1]
	finishfn && finishfn()
}

function processRequests(text, datafn) {
	let error
	const processRequest = request => {
		if (['noop', 'close'].includes(request)) return // known constant requests

		if (request.documentChange) {
			const document = request.documentChange.document
			const data = decodeDoc(document)
			datafn && datafn(data)
		} else if (request.targetChange) {
			const { targetChange } = request
			if (targetChange.targetChangeType === "REMOVE" && targetChange.cause && targetChange.cause.code === 7) {
				error = 'permission'
			}

		} else if (request.__sm__) {
			const reqError = request.__sm__.status[0][0].error
			if (reqError && reqError.code === 401) {
				error = 'refresh'
			}
		} else {
			console.log("Unknown request:", request)
		}
	}
	const requests = JSON.parse(text)
	let AID = 0, request
	for ([AID, request] of requests) {
		if (Array.isArray(request)) {
			for (const requestItem of request) {
				processRequest(requestItem)
			}
		} else {
			processRequest(request)
		}
	}
	return { AID, error }
}

async function readChannel(channel, datafn, errorfn) {
	const query = `database=projects/${channel.database}/databases/(default)&gsessionid=${channel.sessionId}&VER=8&RID=rpc&SID=${channel.SID}&AID=${channel.AID}&TYPE=xmlhttp&zx=${randomNumber()}&t=1`
	const utf8Decoder = new TextDecoder("utf-8");
	const response = await fetchRequest(channel, query)

	// console.dir({ response })
	if (response.body) {
		const reader = response.body.getReader();
		let done, value, chunkLen = 0, chunk = '';
		while (!done) {
			({ value, done } = await reader.read());
			if (!done) {
				value = value ? utf8Decoder.decode(value, { stream: true }) : "";
				while (value.length) {
					if (!chunkLen) {
						// get chunk length
						const index = value.indexOf('\n');
						chunkLen = +value.slice(0, index)
						value = value.slice(index + 1)
					}
					if (chunkLen <= value.length) {
						chunk = value.slice(0, chunkLen)
						value = value.slice(chunkLen);
						// console.log("Process chunk:", chunk)
						const { AID, error } = processRequests(chunk, datafn)
						channel.AID = AID
						chunkLen = 0
						chunk = ''
						if (error) {
							const oldChannel = { ...channel }
							await closeChannel(oldChannel)
							// need to refresh token and start again
							if (error === 'permission') {
								// no authentication
								errorfn && errorfn("Missing or insufficient permissions")
							} else if (error === 'refresh') {
								await channel.auth.tokenRefresh()
								channel.AID = 0
								channel.RID = Math.round(Math.random() * 64000)
								openChannel(channel, () => readChannel(channel, datafn))
							}
							reader.releaseLock()
							return
						}
					} else {
						chunk += value
					}
				}
			}
		}

		if (!channel.closed) {
			// stop reader
			reader.releaseLock()
			// read some more
			readChannel(channel, datafn)
		}

	} else {
		errorfn && errorfn(response.statusText)
	}
}

async function closeChannel(channel) {
	if (!channel.closed) {
		const query = `database=projects/${channel.database}/databases/(default)&VER=8&gsessionid=${channel.sessionId}&SID=${channel.SID}&RID=${channel.RID++}&AID=${channel.AID}&zx=${randomNumber()}&t=1`
		const body = `count=1&ofs=1&req0___data__={"database":"projects/${channel.database}/databases/(default)","removeTarget":${channel.targetId}}`
		await fetchRequest(channel, query, body, { 'Content-Type': 'application/x-www-form-urlencoded' })
		channel.closed = true;
	}
}

export function docListen(dbinfo, documentPath, datafn, errorfn) {
	const channel = { ...dbinfo, documentPath, AID: 0, RID: Math.round(Math.random() * 64000) }
	try {
		openChannel(channel, () => readChannel(channel, datafn, errorfn))
	}
	catch (error) {
		errorfn && errorfn(error)
	}
	return () => closeChannel(channel)
}
