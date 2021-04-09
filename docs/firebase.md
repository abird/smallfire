## Firebase Realtime Database
Use the `getFirebaseDB` function to get a reference to the Firebase database you will be using. Then use that reference to access the database.

### **getFirebaseDB(database [, user, region])**
Specify the name of your Firebase database in `database`. The `user` and `region` values are optional.

If your database requires authorization to access, sign in a user and use the user data for the `user` value.

If your database is in a region other than the default `us-central1` region, you can specify either `europe-west1` or `asia-southeast1` or specify a Firebase host name.


``` javascript
const db = smallfile.getFirebaseDB('my-project-id')

const db = smallfile.getFirebaseDB('my-project-id', currentUser())

const db = smallfile.getFirebaseDB('my-project-id', user, 'europe-west1')

const db = smallfile.getFirebaseDB('my-project-id', user, 'asia-southeast1.firebasedatabase.app')
```
<br/>

## Database Functions

Several functions are available for accessing the database using the database reference. 

`dataPath` refers to the path into the database. Each level is separated with "/".

Most functions support an optional `options` object with additional parameters.

<br/>

### **get(dataPath [, options])**
Read data. Returns a promise for the data at the indicated path.

A few options are available to sort and filter the data. Many of these option require setting up an index in the database.

Option | Description
------------ | -------------
orderBy	| Order by '$key', '$value', '$priority' or a child key
limitToFirst | Number of children to limit at start
limitToLast | Number of children to limit at end
startAt | Value to start at
endAt | Value to end at
equalTo | Equal to value

<br/>

``` javascript
const city = await db.get('cities/sd')

const dinosaurs = await db.get('dinosaurs', {orderBy:'$key', startAt:'a', endAt:'m'})

const dinosaurs = await db.get('dinosaurs', {orderBy:'weight', limitToLast:2})

const scores = await db.get('scores', {orderBy:'$value', startAt:50})
```
<br/>

### **set(dataPath, value)**
Add or completely replace data. To change only some values, use `update` instead.

Returns a promise for the added or updated data.  

``` javascript
// adds or replaces the data at "cities/sd"
await db.set("cities/sd", { name:"San Diego", state:"CA", country:"USA", population:1307402 })
```
<br/>

### **update(dataPath, value)**
Updates fields without changing any other existing fields.

Returns a promise for the updated data.  

``` javascript
// replaces the "population" fields in the data at "cities/sd" without overwriting any of the other fields
await db.update("cities/sd", { population:1423852 })
```
<br/>

### **push(dataPath, value)**
Append data to a list by generating a unique key that will be in sorted order. 

Returns a promise for the key of the added value.  

``` javascript
// adds or replaces the data at "cities/sd"
const postKey = await db.push("posts", {title:"Stuff", msg:"Hello world"})
```
<br/>

### **delete(dataPath)**
Delete data at dataPath
``` javascript
db.delete("cities/sd")
```
<br/>

### **listen(dataPath, dataCallback)**
Listen for data changes at the indicated data path. The data callback function is called with the full data each time there is a change to the data including the initial value. There are three parameters to the callback function: 

`currentData`: the value of the data updated with these changes

`path`: the path for these changes

`changeData`: value of the changes

The value returned by this function is a function that can be called to stop listening for data changes.

``` javascript
const stopListening = firebase.listen('cities/sd', (data, path, changes) => updateCity(data, path, changes), error => handleError(error))

// when finished listening for changes, call "stop" function
stopListening()
```
