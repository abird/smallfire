function decodeValue(item) {
	const [type] = Object.keys(item)
	const value = item[type]
	switch (type) {
		case 'mapValue': return decodeObj(value.fields)
		case 'arrayValue': return value.values.map(item => decodeValue(item))
		case 'integerValue': return +value
		case 'timestampValue': return new Date(value)
		default: return value
	}
}

function decodeObj(data) {
	const obj = {}
	for (const prop of Object.keys(data)) {
		obj[prop] = decodeValue(data[prop])
	}
	return obj
}

export function decodeDoc(document) {
	if (Array.isArray(document)) {
		return document.map(item => decodeDoc(item))
	} else if (document.fields) {
		return decodeObj(document.fields)
	} else if (document.documents) {
		const documents = document.documents.map(doc => decodeDoc(doc))
		return { documents, nextPageToken: document.nextPageToken }
	} else if (document.document) {
		return decodeDoc(document.document)
	}
}

export function encodeValue(value) {
	const type = typeof value
	if (type === 'number') {
		return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
	}
	if (type === 'boolean') {
		return { booleanValue: value }
	}
	if (value === null) {
		return { nullValue: null }
	}
	if (value instanceof Date) {
		return { timestampValue: value.toISOString() }
	}
	if (type === 'string') {
		return (value.match(/projects\/.*?\/databases\/.*?\/documents\//)) ? { referenceValue: value } : { stringValue: value }
	}
	if (Array.isArray(value)) {
		return { arrayValue: { values: value.map(item => encodeValue(item)) } }
	}
	if (value.latitude && value.longitude && Object.keys(value).length === 2) {
		return { geoPointValue: value }
	}
	return { mapValue: encodeObj(value) }
}

function encodeObj(obj) {
	const fields = {}
	for (const prop of Object.keys(obj)) {
		fields[prop] = encodeValue(obj[prop])
	}
	return { fields }
}

export function encodeDoc(value) {
	return encodeObj(value)
}
