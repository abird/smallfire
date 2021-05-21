## Firestore Database
Use the `getFirestoreDB` function to get a reference to the Firestore database you will be using. Then use that reference to access the database.

### **getFirestoreDB(database [, user, emulator])**
Specify the name of your Firestore database in `database` using your Project ID. The `user` and `emulator` values are optional.

If your database requires authorization to access, sign in a user and use the user data for the `user` value.

If you are testing using the Firestore emulator, set `emulator` to `true` or to the URL of the emulator.

``` javascript
const db = smallfile.getFirestoreDB('my-project-id')

const db = smallfile.getFirestoreDB('my-project-id', currentUser())

const db = smallfile.getFirestoreDB('my-project-id', user, true)
```
<br/>

## Database Functions

Several functions are available for accessing the database using the database reference. 

`documentPath` refers to the path of a document or collection. Collection and docment names are separated with "/". For example:

Path | Description
------------ | -------------
posts |	collection "posts"
posts/post1 | document "post1" in collection "posts"
posts/post1/comments | subcollection "comments" in document "post1"
posts/post1/comments/comment1 | document "comment1" in subcollection "comments"

<br/>

Most functions support an optional `options` object with additional parameters.

<br/>

### **get(documentPath [, options])**
Get a single document. Returns a promise for the document at the indicated path.

The `mask` option allows you to specify which values in the document to return instead of the entire document. `select` is an alias for `mask`.

Option | Description
------------ | -------------
mask (or select) |	Restrict which fields are returned using a single field name or an array of names  

<br/>

``` javascript
let post

db.get('posts/post1').then(data => post = data).catch(error => console.log("Error:", error))

const city = await db.get('cities/sd')

const city = await db.get('cities/sd', {mask:'name'})

const city = await db.get('cities/sd', {select:['name', 'state']})
```
<br/>

### **list(collectionPath [, options])**
Get a list of documents within a collection. Returns a promise for an object with two values:

`documents`:  a list of the returned documents

`nextPageToken`: token used to get additional documents when retrieving a partial list

Several options are available to get part of a list.


Option | Description
------------ | -------------
pageSize |	The maximum number of documents to return.
pageToken | The nextPageToken value returned from a previous list request, if any.
orderBy	| Sort results by a single field name or an array of names
mask (or select) | 	Restrict which fields are returned using a single field name or an array of names
showMissing	| If the list should show missing documents. A missing document is a document that does not exist but has sub-documents.

<br/>

``` javascript
const {documents} = await db.list('cities')

const {documents, nextPageToken} = await db.list('cities', {orderBy: 'name'})

const {documents, nextPageToken} = await db.list('cities', {orderBy: ['state', 'name'], mask:['name', 'state']})

const {documents, nextPageToken} = await db.list('cities', {pageSize: 5})

const {documents, nextPageToken} = await db.list('cities', {pageSize: 5, pageToken: nextPageToken})
```
<br/>

### **set(documentPath, value)**
Add a new document or complately replace an existing document. (To change only some values, use `update`.)

Returns a promise for the added or updated document.  

``` javascript
// adds or replaces the document at "cities/sd"
await db.set("cities/sd", { name:"San Diego", state:"CA", country:"USA", population:1307402 })
```
<br/>

### **update(documentPath, value)**
Updates fields in a document without changing any other existing fields.

``` javascript
// replaces the "population" fields in the document at "cities/sd" without overwriting any of the other fields
await db.update("cities/sd", { population:1423852 })

//To update a value in a nested object, use dot-notation.
await db.update("user/12345", { name.middle:"John"})
```
<br/>

### **delete(documentPath)**
Delete a document
``` javascript
db.delete("cities/sd")
```
<br/>

### **query(query [, options])**
Search for documents. Returns a promise for a list of documents.

These are the query for searching:

Option | Description
------------ | -------------
select | Restrict which fields are returned using a single field name or an array of names	
from | Name of the collection to query (required)
where | Filter which documents to return. (See the filter information below.)
orderBy	| Sort results by a single field name or an array of names. To sort a field in reverse order, prefix the field name with '-' (for example: '-age').
startAt, startAfter, endAt, endBefore | Start or end before or after this value from the field specified by `orderBy`. For example, if `orderBy` is 'name' and `startAt` is 'Los Angeles', the results will includes all cities including and after Los Angeles.
offset | The number of results to skip.
limit | The maximum number of results to return.  
<br/>

#### **Query Filters**
Specify query filters with an array consisting of the field name, operator, and value. Operators include `<`, `<=`, `==`, `=`, `>`, `>=`, `!=`, and `<>`. 

For example, ['name', '==', 'Los Angeles'] or ['population', '>', 1000000].

Additional operators include `array-contains`, `array-contains-any`, `in`, and `not-in`.

You can use multiple filters by adding 2 or more filters to an array. These filters are joined by the 'AND' operator.

``` javascript
db.query({select: ['title', 'description'], from: 'movies', where: [['year', '>', 1981], ['category', '==', 'drama']], orderBy:'title', limit: 10, offset:20})
```
<br/>

### **listen(documentPath, dataCallback, errorCallback)**
Listen for document changes at the indicated document path. The data callback function is called with the full document each time there is a change to the document. The data callback is also called with the initial value of the document.

The value returned by this function is a function that can be called to stop listening for document changes.

``` javascript
const stopListening = firestore.listen('cities/sd', data => updateCity(data), error => handleError(error))

// when finished listening for changes, call "stop" function
stopListening()
```

