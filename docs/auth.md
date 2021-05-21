

## Authentication
If you you need to authorize users to access the database, read this section.

The following functions are available from the `smallfile.auth` global variable or from `auth` when importing from the NPM module.

### **currentUser()**
Returns the user that is currently signed in or null if a user is not signed in. You can also get the user's display name if that has been added to the user profile.

User data is stored in localStorage so the user remains signed in without having to supply the email and password each time.

``` javascript
const user = smallfile.auth.currentUser()
const name = user.displayName
const email = user.email

const db = smallfire.getFirebaseDB('my-app', smallfie.auth.currentUser())
```

### **signIn(email, password, apiKey)**
Signs in using an email and password. The `apiKey` parameter is the Web API key that can be found in the project settings in the Firebase console. The user data, the same as currentUser(), is returned.

``` javascript
let user
smallfire.auth.signIn('john@example.com', 'johnspassword', '<project-api-key>')
	.then(data => user = data)
	.catch(error => {
		if (error.error.message === 'EMAIL_NOT_FOUND') {
			console.log('Invalid email address')
		} else if (error.error.message === 'INVALID_PASSWORD') {
			console.log('Invalid password')
		}
	})
```
``` javascript
let user = await smallfire.auth.signIn('john@example.com', 'johnspassword', '<project-api-key>')
```

### **signOut()**
Remove user data from localStorage so the user is no longer automatically signed in.
``` javascript
smallfire.auth.signOut()
```
