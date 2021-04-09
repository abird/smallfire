import { decodeDoc, encodeDoc, encodeValue } from './values'

function getURL(dbinfo, documentPath, options) {
	if (!documentPath.startsWith(':')) {
		documentPath = '/' + documentPath
	}
	let url = `${dbinfo.host}/v1/projects/${dbinfo.database}/databases/(default)/documents${documentPath}`
	if (options) {
		// add options as query parameters
		const params = new URLSearchParams()
		Object.entries(options).map(([key, value]) => {
			if (['mask', 'updateMask', 'select', 'project'].includes(key)) {
				if (['select', 'project'].includes(key)) {
					// 'select' and 'project' are aliases for 'mask'
					key = 'mask'
				}
				if (!Array.isArray(value)) {
					value = [value]
				}
				value.map(item => params.append(`${key}.fieldPaths`, item))
			} else {
				params.append(key, value)
			}
		})
		url = `${url}?${params.toString()}`
	}
	return url
}

const throwError = error => { throw error }

async function fetchRequest(dbinfo, documentPath, options, method, value) {
	const url = getURL(dbinfo, documentPath, options)
	const fetchOptions = {
		method: method || 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
		},
	}
	const auth = dbinfo.auth
	if (auth) {
		fetchOptions.headers.Authorization = `Bearer ${auth.idToken}`
	}
	if (value) {
		fetchOptions.body = JSON.stringify(value)
	}

	let response = await fetch(url, fetchOptions);
	let data = await response.json()

	if (!response.ok) {
		if (Array.isArray(data)) {
			data = data[0]
		}
		if (auth && data.error.code === 401) {
			// invalid id token, try refreshing the id token and try again
			await auth.tokenRefresh()
			return await fetchRequest(dbinfo, documentPath, options, method, value)
		} else {
			// throw error
			throwError(data)
		}
	}

	return decodeDoc(data)
}

const isDoc = documentPath => !(documentPath.split('/').length & 1)

export const docGet = async (dbinfo, documentPath, options) =>
	isDoc(documentPath)
		? fetchRequest(dbinfo, documentPath, options)
		: throwError('Collection specified. Use "list" to get list of documents.');

export const docList = async (dbinfo, documentPath, options) =>
	!isDoc(documentPath)
		? fetchRequest(dbinfo, documentPath, options)
		: throwError('Document specified. Use "get" to get document.');


export const docSet = async (dbinfo, documentPath, value, options) => fetchRequest(dbinfo, documentPath, options, 'PATCH', encodeDoc(value))

export const docUpdate = async (dbinfo, documentPath, value, options = {}) => {
	// add all values to updateMask
	const updateMask = []
	const addMasks = (map, path) => {
		Object.entries(map).map(([key, value]) => {
			if (value.constructor.name === 'Object') {
				addMasks(value, `${path}${key}.`)
			} else {
				updateMask.push(path + key)
			}
		})
	}
	addMasks(value, '')
	options.updateMask = updateMask
	return fetchRequest(dbinfo, documentPath, options, 'PATCH', encodeDoc(value));
}

export const docDelete = async (dbinfo, documentPath, options) => fetchRequest(dbinfo, documentPath, options, 'DELETE')

const assertArray = (value, name) => {
	if (!Array.isArray(value)) {
		throwError(`"${name}" value must be an array`)
	}
}

const getOpValue = op => {
	const opMap = {
		'<': 'LESS_THAN',
		'<=': 'LESS_THAN_OR_EQUAL',
		'==': 'EQUAL',
		'=': 'EQUAL',
		'>': 'GREATER_THAN',
		'>=': 'GREATER_THAN_OR_EQUAL',
		'!=': 'NOT_EQUAL',
		'<>': 'NOT_EQUAL'
	}
	return opMap[op] || op.toUpperCase().replace(/\-/g, '_')
}

const getWhere = where => {
	assertArray(where, 'where')
	if (Array.isArray(where[0])) {
		// array of where values (composite filter)
		return { compositeFilter: { op: "AND", filters: where.map(item => getWhere(item)) } }
	}

	// single where value
	const [field, op, value] = where
	if (!op) {
		throwError('"where" array needs 2 or 3 value')
	}
	const type = value ? 'fieldFilter' : 'unaryFilter'
	const opValue = getOpValue(op)
	if (!opValue) {
		throwError(`Invalid operator in where: ${op}`)
	}
	const filter = { field: { fieldPath: field }, op: opValue }
	if (value) {
		filter.value = encodeValue(value)
	}
	return { [type]: filter }
}

export const docQuery = async (dbinfo, query, options) => {
	const queryData = {}
	Object.entries(query).map(([key, value]) => {
		const isArray = Array.isArray(value)
		switch (key) {
			case 'select':
				value = { fields: isArray ? value.map(item => ({ fieldPath: item })) : [{ fieldPath: value }] }
				break;
			case 'from':
				value = isArray ? value.map(item => ({ collectionId: item })) : [{ collectionId: value }]
				break;
			case 'where':
				value = getWhere(value)
				break;
			case 'orderBy':
				const getOrderBy = orderBy => {
					let result = {}
					if (orderBy.startsWith('-')) {
						orderBy = orderBy.slice(1)
						result.direction = 'DESCENDING'
					}
					result.field = { fieldPath: orderBy }
					return result
				}
				value = isArray ? value.map(item => getOrderBy(item)) : [getOrderBy(value)]
				break;
			case 'startAt':
			case 'startAfter':
			case 'endAt':
			case 'endBefore':
				value = { values: [encodeValue(value)], before: ['startAt', 'endBefore'].includes(key) }
				key = key.replace(/After|Before/, 'At')
				break;
			default:
				value = encodeValue(value)
				break;
		}
		queryData[key] = value
	})
	return fetchRequest(dbinfo, ':runQuery', options, 'POST', { structuredQuery: queryData })
}