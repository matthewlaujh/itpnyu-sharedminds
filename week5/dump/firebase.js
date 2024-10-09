import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js"
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js"
import { firebaseConfig } from "./firebaseConfig.js"

let myDBID
let authUser
let uiConfig
let db
let appName = "itpnyu-sharedminds-week5"

export function initFirebaseDB() {
  const app = initializeApp(firebaseConfig)
  db = getDatabase(app)
}

export function saveUserInputToFirebase(uid, input) {
  const userInputRef = ref(db, `users/${uid}/inputs`)
  const newInputRef = push(userInputRef)
  set(newInputRef, {
    input: input,
    timestamp: Date.now(),
  })
}

export function initFirebaseAuth() {
  firebase.initializeApp(firebaseConfig)
  //this allowed separate tabs to have separate logins
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  firebase.auth().onAuthStateChanged((firebaseAuthUser) => {
    console.log("my goodness there has been an auth change")
    document.getElementById("signOut").display = "block"
    const inputBox = document.getElementById("inputBox")
    if (!firebaseAuthUser) {
      document.getElementById("name").display = "none"
      document.getElementById("profile-image").display = "none"
      document.getElementById("signOut").style.display = "none"
      console.log("no valid login, sign in again?")
      var ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start("#firebaseui-auth-container", uiConfig)
      if (inputBox) {
        inputBox.disabled = true // Disable the input box
        inputBox.style.backgroundColor = "gray" // Set background color to gray
      }
    } else {
      console.log("we have a user", firebaseAuthUser)
      authUser = firebaseAuthUser

      document.getElementById("signOut").style.display = "block"
      localUserEmail = authUser.multiFactor.user.email
      myDBID = authUser.multiFactor.user.uid
      console.log("User", authUser, "myDBID", myDBID)
      document.getElementById("name").innerHTML =
        authUser.multiFactor.user.displayName
      if (authUser.multiFactor.user.photoURL != null)
        document.getElementById("profile-image").src =
          authUser.multiFactor.user.photoURL
      checkForUserInRegularDB(authUser.multiFactor.user)
      subscribeToUsers()
      if (inputBox) {
        inputBox.disabled = false // Enable the input box
        inputBox.style.backgroundColor = "white" // Set background color to white
      }
    }
  })
}

export function checkForUserInRegularDB(user) {
  //write a firebase query to do look for a uid in the database
  console.log("checkForUserInDB", user.uid)
  db = getDatabase()
  let UIDRef = ref(db, appName + "/users/" + user.uid + "/")

  onValue(UIDRef, (snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val())
      let data = snapshot.val()

      console.log("someone by that id in db", myDBID, data)
    } else {
      giveAuthUserRegularDBEntry(authUser)
    }
  })
}

export function giveAuthUserRegularDBEntry(authUser) {
  let testUserTemplate = {
    email: "dan@example.com",
    displayName: "Test User",
    photoURL: "emptyProfile.png",
  }
  console.log("Authuser but no user info in DB yet", authUser, testUserTemplate)
  if (!authUser.displayName) authUser.displayName = authUser.email.split("@")[0]
  let displayName = authUser.displayName ?? testUserTemplate.displayName
  let photoURL = authUser.photoURL ?? testUserTemplate.photoURL
  if (!authUser.displayName) authUser.displayName = testUserTemplate.displayName
  if (!authUser.photoURL) authUser.photoURL = testUserTemplate.photoURL

  const db = getDatabase()
  set(ref(db, appName + "/users/" + authUser.uid + "/"), {
    uid: authUser.uid,
    email: authUser.email,
    displayName: displayName,
    defaultProfileImage: photoURL,
    onlineStatus: "available",
  })
}
