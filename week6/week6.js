// Code is largely from Dano's example + using copilot to autofill and edit / write new features.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js"
import {
  getDatabase,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
  push,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js"
import { firebaseConfig } from "./firebaseConfig.js"

const replicateProxy = "https://replicate-api-proxy.glitch.me"

let distances = []
const authContainer = document.createElement("div")
const logString = ""

let myDBID
let authUser
let uiConfig
let loggedIn = false
let localUserEmail = "no email"
let db
let appName = "itpnyu-sharedminds-week6"
let allText = {}

authContainer.id = "firebaseui-auth-container"

initFirebase()
createUI()

function initFirebase() {
  initFirebaseDB()
  initFirebaseAuthUI()
}

function initFirebaseAuthUI() {
  initFirebaseAuth()
}

uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      authUser = authResult
      console.log("successfully logged in", authResult.user.email)
      if (loggedIn) location.reload() //reboot if this is a change.
      return false
    },
    uiShown: function () {
      document.getElementById("loader").style.display = "none"
    },
  },
  signInFlow: "popup",
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  tosUrl: "<your-tos-url>",
  privacyPolicyUrl: "<your-privacy-policy-url>",
}

function initFirebaseAuth() {
  firebase.initializeApp(firebaseConfig)
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  firebase.auth().onAuthStateChanged((firebaseAuthUser) => {
    console.log("my goodness there has been an auth change")
    const themeInputField = document.getElementById("themeInputField")
    const inputField = document.getElementById("inputField")
    const askButton = document.getElementById("askButton")
    const signOutButton = document.getElementById("signOut")

    if (!firebaseAuthUser) {
      document.getElementById("name").style.display = "none"
      document.getElementById("profile-image").style.display = "none"
      signOutButton.style.display = "none"
      console.log("no valid login, sign in again?")
      var ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start("#firebaseui-auth-container", uiConfig)

      if (themeInputField) {
        themeInputField.disabled = true
        themeInputField.style.backgroundColor = "gray"
      }
      if (inputField) {
        inputField.disabled = true
        inputField.style.backgroundColor = "gray"
      }
      if (askButton) {
        askButton.disabled = true
      }
    } else {
      console.log("we have a user", firebaseAuthUser)
      authUser = firebaseAuthUser

      signOutButton.style.display = "block"
      localUserEmail = authUser.multiFactor.user.email
      myDBID = authUser.multiFactor.user.uid
      console.log("User", authUser, "myDBID", myDBID)
      document.getElementById("name").innerHTML =
        authUser.multiFactor.user.displayName
      if (authUser.multiFactor.user.photoURL != null)
        document.getElementById("profile-image").src =
          authUser.multiFactor.user.photoURL
      checkForUserInRegularDB(authUser)

      if (themeInputField) {
        themeInputField.disabled = false
        themeInputField.style.backgroundColor = "white"
      }
      if (inputField) {
        inputField.disabled = false
        inputField.style.backgroundColor = "white"
      }
      if (askButton) {
        askButton.disabled = false
      }
    }
  })
}

document.getElementById("signOut").addEventListener("click", function () {
  firebase
    .auth()
    .signOut()
    .then(function () {
      console.log("User signed out")
      location.reload()
    })
    .catch(function (error) {
      console.log("Error:", error)
    })
})

export function checkForUserInRegularDB(user) {
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

function initFirebaseDB() {
  const app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  let folder = "texts"
  const commentsRef = ref(db, appName + "/" + folder + "/")
  onChildAdded(commentsRef, (data) => {
    allText[data.key] = data.val()
    console.log("added", data.key, data.val())
    drawAll()
  })
  onChildChanged(commentsRef, (data) => {
    allText[data.key] = data.val()
    console.log("changed", data.key, data.val())
    drawAll()
  })
  onChildRemoved(commentsRef, (data) => {
    console.log("removed", data.key)
    delete allText[data.key]
    drawAll()
  })
}

function saveResultToFirebase(result) {
  const user = firebase.auth().currentUser
  if (user) {
    let timestamp = new Date().toISOString()
    timestamp = timestamp.replace(/[:.]/g, "-") // Replace ":" and "." with "-"

    const resultRef = ref(
      db,
      `itpnyu-sharedminds-week6/${user.uid}/${timestamp}`
    )
    set(resultRef, result)
      .then(() => {
        console.log("Result saved to Firebase.")
      })
      .catch((error) => {
        console.error("Error saving result to Firebase:", error)
      })
  } else {
    console.error("No user is signed in. Cannot save result.")
  }
}

function createUI() {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas")
    canvas.width = 1080 / 2
    canvas.height = 1920 / 2
    document.body.appendChild(canvas)
    const ctx = canvas.getContext("2d")

    // Create the theme input field
    const themeInputField = document.createElement("input")
    themeInputField.type = "text"
    themeInputField.placeholder = "THEME: Time"
    themeInputField.style.width = "100px"
    themeInputField.id = "themeInputField"
    document.body.appendChild(themeInputField)

    // Create the existing input field
    const inputField = document.createElement("input")
    inputField.type = "text"
    inputField.placeholder =
      "TEXT: Time is interesting in the sense that yes it’s hard to doubt that it exists but to some sense of it (this might sound rambl-y but bear with me) like the unit of measurement is human defined and when it’s human defined we create the constructs that is it measurement, days, minutes, seconds…etc but how did we come to define that and why did we fix on that subdivision, same as how Dan O’ talked about infinity in class and how we stopped counting at some point, we can sub divide time (or any unit of measurement in this sense) infinitely and where would we end up a second could be divided by 2, 10, 100, 1000 but that would be so quick, a second is already so quick and time would have passed but would time have passed? Not sure where this ramble was going but I think it ended up somewhere. Atleast for me I definitely am a different person over time, I don’t even think I was the same person I was 5 minutes ago. The likelihood of a thought defining my personality is so high, the personality I give off depends on my mood at the time and my mood depends on what’s going through my mind. A thought is so quick to shut me down or bring me up. Sure I have some predefined set personalities but which one shows at which time is highly dependent on mood and thought. I could be having a good time at a party and then have a random thought cycle through and instantly crash and become socially paralysed. I could be focusing in class or in a state of flow while working but if some stressful thought creeps in I could end up losing that state of flow and lose productivity for the rest of the day. And I don’t think that it’s just the thought that is a factor, it’s the impact of the thought and the significance of the moment I was in as well. Was i enjoying myself? Was I happy? What the thought was? Previously I mentioned that I had a way of weighing my thoughts and that very much comes into play here. The crash I experience is proportional to the weightage of that thought and the moment I was having. Other people are definitely trying to determine my next thought, not to link back to design again every week, but so much of design practice is controlling the flow of communication and making people look at things in a certain way or have flow of information that make sense to people to think about. Design choices are usually always made to control flow and influence thought. And as design permeates daily life, these choices are everywhere so someone in an office somewhere with illustrator open is most definitely trying to determine my next thought. My thoughts should never be public, twitter (x) was the worst thing ever to be invented hahaha just kidding not really, I guess getting into real or fake social media life is a whole other thing but I guess in this sense are memories thoughts? Are they interchangeable or are they complimentary to each other. I think (social) media is a good way of sharing memories but horrible for sharing thoughts. But they don’t even have to be digital media, I don’t even want to write my thoughts down on paper. So what does that say about my thoughts. Do I just have good memories but bad thoughts?"
    inputField.style.width = "550px"
    inputField.id = "inputField"
    document.body.appendChild(inputField)

    // Create the button
    const button = document.createElement("button")
    button.innerText = "Ask"
    button.id = "askButton"
    button.addEventListener("click", () => {
      if (themeInputField.value.trim() === "") {
        alert("Please enter a theme first.")
      } else {
        askForEmbeddings(inputField.value)
      }
    })
    document.body.appendChild(button)

    // Create the sign-out button
    const signOutButton = document.createElement("button")
    signOutButton.innerText = "Sign Out"
    signOutButton.id = "signOut"
    signOutButton.style.display = "none"
    document.body.appendChild(signOutButton)

    function draw(distances, theme) {
      const lineHeight = 18
      const margin = 0.1
      let contentHeight = 0

      if (distances && distances.length > 0) {
        distances.forEach(({ phrase, vector }) => {
          const lines = Math.ceil(
            ctx.measureText(phrase).width / (canvas.width - 40)
          )
          contentHeight += lines * lineHeight
        })
      }

      contentHeight += lineHeight
      contentHeight *= 1 + margin
      canvas.height = contentHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = "18px Arial"
      ctx.fillStyle = "black"
      ctx.fillText(theme, 20, 30)

      let yPosition = 40
      const maxWidth = canvas.width - 40

      if (distances && distances.length > 0) {
        distances.forEach(({ phrase, vector, cdist }) => {
          const lineHeight = vector[0] * 100
          const opacity = vector[1]
          const distanceFromTop = 30 + cdist * 100
          ctx.globalAlpha = opacity

          let words = phrase.split(" ")
          let line = ""
          let xPosition = 20

          words.forEach((word) => {
            let testLine = line + word + " "
            let testWidth = ctx.measureText(testLine).width
            if (testWidth > maxWidth) {
              ctx.fillText(line, xPosition, yPosition + distanceFromTop)
              line = word + " "
              yPosition += lineHeight
            } else {
              line = testLine
            }
          })

          ctx.fillText(line, xPosition, yPosition + distanceFromTop)
          yPosition += lineHeight
        })
        ctx.globalAlpha = 1.0
      }
    }

    async function askForEmbeddings(p_prompt) {
      let promptInLines = p_prompt.replace(/([,.?!])\s+/g, "\n")
      let data = {
        version:
          "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
        input: {
          inputs: promptInLines,
        },
      }
      console.log(
        "Asking for Embedding Similarities From Replicate via Proxy",
        data
      )
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      const url = replicateProxy + "/create_n_get/"
      console.log("url", url, "options", options)
      const raw = await fetch(url, options)
      const proxy_said = await raw.json()
      let output = proxy_said.output
      console.log("Proxy Returned", output)

      // Initialize distances array
      let distances = []

      let firstOne = {
        input: themeInputField.value,
        embedding: await getWordEmbedding(themeInputField.value),
      }

      for (let i = 0; i < output.length; i++) {
        let thisOne = output[i]
        let cdist = cosineSimilarity(firstOne.embedding, thisOne.embedding)
        distances.push({
          reference: firstOne.input,
          phrase: thisOne.input,
          vector: thisOne.embedding,
          cdist: cdist,
        })
        console.log(firstOne.input, thisOne.input, thisOne.embedding, cdist)
      }

      // Call the draw function with the populated distances array and theme
      draw(distances, themeInputField.value)

      // Convert the canvas to a data URL
      const canvas = document.querySelector("canvas")
      const imageDataURL = canvas.toDataURL("image/png")

      // Save the result to Firebase
      saveResultToFirebase({
        theme: themeInputField.value,
        input: p_prompt,
        image: imageDataURL,
        embeddings: distances,
      })
    }

    async function getWordEmbedding(word) {
      let data = {
        version:
          "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
        input: {
          inputs: word,
        },
      }
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      const url = replicateProxy + "/create_n_get/"
      const raw = await fetch(url, options)
      const proxy_said = await raw.json()
      return proxy_said.output[0].embedding
    }

    function cosineSimilarity(vecA, vecB) {
      return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB))
    }

    function dotProduct(vecA, vecB) {
      let product = 0
      for (let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i]
      }
      return product
    }

    function magnitude(vec) {
      let sum = 0
      for (let i = 0; i < vec.length; i++) {
        sum += vec[i] * vec[i]
      }
      return Math.sqrt(sum)
    }
  })
}
