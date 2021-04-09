# SmallFire

SmallFire is a Javascript client for accessing Firestore and Firebase realtime databases. It is a much smaller replacement for the the basic functionality of the official Firebase SDK libraries. Compare sizes below:

Library | Firebase SDK | SmallFire
--- | ---: | ---:
Firebase core | 7 KB | 
Auth | 56 KB | 0.7 KB
Firestore | 90 KB | 2.9 KB
Firebase RTDB | 51 KB | 1.0 KB
Full Library | 204 KB | 3.9 KB

<br/>
If you are developing a light-weight web app that uses Firestore and or Firebase realtime database, this can greatly reduce the size of your downloads resulting in faster app startup.

There are three library modules that can be loaded separately: `auth`, `firestore`, `firebase`, or loaded in a combined bundle: `smallfire`. The `auth` module supports only email/password authentcation and is only necessary when dealing with non-public data.

These features are supported with the `firestore` module for the Firestore database:

Feature | Description
------------ | -------------
`get` | get a single document
`list` | list some or all documents in a collection
`set` | replace the value of a document or create a new one
`update` | update fields in a document
`delete` | delete a document
`query` | get documents based on a query
`listen` | get a document and listen for realtime updates

<br/>
These features are supported with the `firebase` module for the Firebase realtime database:

Feature | Description
------------ | -------------
`get` | read data
`set` | write data replacing existing data
`update` | write data merging with existing data
`push` | add to list with a unique key
`delete` | delete data
`listen` | read data and get realtime updates

<br/><br/>
## Installation
<br/>

### Script Tag
The simplest way to add SmallFire to your web app is to add the following script tag to your `<head>` or `<body>` section:

```
<script src="https://unpkg.com/smallfire/smallfire.js"></script>
```

You can also add modules individually:
```
<script src="https://unpkg.com/smallfire/auth.js"></script>
<script src="https://unpkg.com/smallfire/firebase.js"></script>
<script src="https://unpkg.com/smallfire/firestore.js"></script>
```

Then access the SmallFire functions using the `smallfire` global variable:

``` javascript
smallfire.auth.currentUser()
smallfire.auth.signIn()
smallfire.auth.signOut()
smallfire.getFirestoreDB()
smallfire.getFirebaseDB()
```
or
``` javascript
const { auth, getFirestoreDB, getFirebaseDB } = window
```
<br/>

### Node
If you are using a Node build environment such as with Javascript libraries React or Vue, install SmallFire from NPM:

```
npm install smallfire
```

Then import the SmallFire functions:

``` javascript
import { auth, getFirestoreDB, getFirebaseDB } from smallfire
```
or import separately:
``` javascript
import { auth } from smallfire/auth
import { getFirebaseDB } from smallfire/firebase
import { getFirestoreDB } from smallfire/firestore
```
<br/>

## Documentation
Please see individual module documentation here:

[Authentication](./docs/auth.md)

[Firebase realtime database](./docs/firebase.md)

[Firestore database](./docs/firestore.md)
