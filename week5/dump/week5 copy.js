let myDBID


// Get the input box and the canvas element
const canvas = document.createElement("canvas")
canvas.setAttribute("id", "myCanvas")
canvas.style.position = "absolute"
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.left = "0"
canvas.style.top = "0"
canvas.style.width = "100%"
canvas.style.height = "100%"
document.body.appendChild(canvas)

const inputBox = document.createElement("input")
inputBox.setAttribute("type", "text")
inputBox.setAttribute("id", "inputBox")
inputBox.setAttribute("placeholder", "Enter text here")
inputBox.style.position = "absolute"
inputBox.style.left = "50%"
inputBox.style.top = "50%"
inputBox.style.transform = "translate(-50%, -50%)"
inputBox.style.zIndex = "100"
inputBox.style.fontSize = "30px"
inputBox.style.fontFamily = "Arial"
document.body.appendChild(inputBox)

// Store text objects
const textObjects = []

// Function to move the input box to a random position
function moveInputToRandomPosition() {
  let randomX, randomY
  let isValidPosition = false

  // Keep generating random positions until a valid one is found
  while (!isValidPosition) {
    randomX = Math.floor(
      Math.random() * (window.innerWidth - inputBox.offsetWidth)
    )
    randomY = Math.floor(
      Math.random() * (window.innerHeight - inputBox.offsetHeight)
    )

    isValidPosition = true
    // Check for overlap with existing text objects
    for (const textObject of textObjects) {
      if (textObject instanceof HTMLElement) {
        // Ensure it's a valid DOM element
        const textRect = textObject.getBoundingClientRect()
        if (
          randomX < textRect.right &&
          randomX + inputBox.offsetWidth > textRect.left &&
          randomY < textRect.bottom &&
          randomY + inputBox.offsetHeight > textRect.top
        ) {
          isValidPosition = false
          break
        }
      }
    }
  }

  inputBox.style.left = randomX + "px"
  inputBox.style.top = randomY + "px"
}

// Add event listener to the input box
inputBox.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    const inputValue = inputBox.value
    console.log("Input value:", inputValue)
    // setInFirebase('Input', inputValue);

    // Call askForWords with the input value
    const promptText = `These are my thoughts ${inputValue}. Ask me a follow up question to dig deeper into my thoughts. Only ask one question, only ask the question, everything else is unnecessary.`
    const generatedText = await askForWords(promptText)
    console.log("Generated text:", generatedText)
    // setInFirebase('Response, outputValue')

    // Create a new Thought object and display it
    if (generatedText) {
      const thought = new Thought(promptText, generatedText)
      console.log("Thought object JSON:", JSON.stringify(thought, null, 2)) // Log the Thought object as JSON
      thought.display()
      // setInFirebase("Thought", thought)
    } else {
      console.error("Generated text is null")
    }

    inputBox.value = ""
    moveInputToRandomPosition()
  }
})

async function askForWords(p_prompt) {
  const data = {
    version: "35042c9a33ac8fd5e29e27fb3197f33aa483f72c2ce3b0b9d201155c7fd2a287",
    input: {
      prompt: p_prompt,
    },
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  }

  const url = replicateProxy + "/create_n_get/"

  try {
    const words_response = await fetch(url, options)
    if (!words_response.ok) {
      throw new Error(`HTTP error! status: ${words_response.status}`)
    }
    const proxy_said = await words_response.json()
    console.log("API response JSON:", JSON.stringify(proxy_said, null, 2)) // Log the JSON response

    if (!proxy_said.output || proxy_said.output.length === 0) {
      return null
    } else {
      return proxy_said.output.join("")
    }
  } catch (error) {
    console.error("Error fetching words:", error)
    return null
  }
}

// Function to create color selection buttons
function createColorButtons(textElement, thought) {
  const colorOptions = [
    "red",
    "green",
    "blue",
    "orange",
    "purple",
    "yellow",
    "pink",
    "cyan",
    "magenta",
    "black",
  ] // Example colors
  const buttonContainer = document.createElement("div")
  buttonContainer.style.position = "absolute"
  buttonContainer.style.left = textElement.style.left

  // Calculate the top position to be right below the text
  const textRect = textElement.getBoundingClientRect()
  buttonContainer.style.top = textRect.bottom + "px"

  colorOptions.forEach((color) => {
    const colorButton = document.createElement("button")
    colorButton.textContent = color
    colorButton.style.backgroundColor = color

    // Add event listener to the color button
    colorButton.addEventListener("click", () => {
      textElement.style.color = color

      // Hide the color buttons
      buttonContainer.style.display = "none"

      saveTextObjectToFirebase(textObjects[textObjects.length - 1], thought) // Save to Firebase

      // Start fading out the text after a delay
      startFadingText(textElement, color)

      // Create reply input box
      createReplyInputBox(textElement, thought)
    })

    buttonContainer.appendChild(colorButton)
  })

  document.body.appendChild(buttonContainer)
}

// Function to start fading out the text
function startFadingText(textElement, color) {
  // Counter for red text fade times
  let redFadeCounter = 0

  // Calculate the delay based on the color
  let delay
  if (color === "red") {
    delay = 1000 // 1 second
  } else if (color === "green") {
    delay = 2000 // 2 seconds
  } else if (color === "blue") {
    delay = 3000 // 3 seconds
  } else if (color === "orange") {
    delay = 4000 // 4 seconds
  } else if (color === "purple") {
    delay = 5000 // 5 seconds
  } else if (color === "yellow") {
    delay = 6000 // 6 seconds
  } else if (color === "pink") {
    delay = 7000 // 7 seconds
  } else if (color === "cyan") {
    delay = 8000 // 8 seconds
  } else if (color === "magenta") {
    delay = 9000 // 9 seconds
  } else {
    delay = 10000 // 10 seconds
  }

  // Start fading out the text after the calculated delay
  setTimeout(() => {
    textElement.style.opacity = "0"

    // Wait for the same amount of time while the text is at zero opacity
    setTimeout(() => {
      if (color !== "black") {
        if (color === "red") {
          redFadeCounter++
          if (redFadeCounter >= 3) {
            // Remove the text element after fading 3 times
            textElement.remove()
            return
          }
        }

        // Reset the text to 100% opacity
        textElement.style.opacity = "1"

        // Start fading out the text again
        startFadingText(textElement, color)
      }
    }, delay)
  }, delay)
}

// Function to create reply input box
function createReplyInputBox(textElement, thought) {
  const replyInputBox = document.createElement("input")
  replyInputBox.setAttribute("type", "text")
  replyInputBox.setAttribute("placeholder", "Reply here")
  replyInputBox.style.position = "absolute"
  replyInputBox.style.left = textElement.style.left

  // Calculate the top position to be right below the text
  const textRect = textElement.getBoundingClientRect()
  replyInputBox.style.top = textRect.bottom + "px"
  replyInputBox.style.fontSize = "20px"
  replyInputBox.style.fontFamily = "Arial"

  // Add event listener to the reply input box
  replyInputBox.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const replyValue = replyInputBox.value
      console.log("Reply value:", replyValue)

      // Call askForWords with the reply value
      const replyPrompt = `These are my thoughts ${replyValue}. Ask me a follow up question to dig deeper into my thoughts. Only ask one question, only ask the question, everything else is unnecessary.`
      const replyGeneratedText = await askForWords(replyPrompt)
      console.log("Reply generated text:", replyGeneratedText)

      // Add the reply to the Thought object and update the displayed text
      if (replyGeneratedText) {
        thought.addReply(replyPrompt, replyGeneratedText, textElement)
        console.log(
          "Updated Thought object JSON:",
          JSON.stringify(thought, null, 2)
        ) // Log the updated Thought object as JSON
      } else {
        console.error("Reply generated text is null")
      }

      replyInputBox.value = ""
    }
  })

  document.body.appendChild(replyInputBox)
}

// Helper function to get RGB components from color name
function getColorComponents(colorName) {
  const tempElement = document.createElement("div")
  tempElement.style.color = colorName
  document.body.appendChild(tempElement)
  const computedStyle = getComputedStyle(tempElement)
  const rgbString = computedStyle.color // e.g., "rgb(255, 0, 0)"
  document.body.removeChild(tempElement) // Clean up
  const rgbValues = rgbString.slice(4, -1).split(",").map(Number)
  return rgbValues // Returns [255, 0, 0] for "red"
}

// AUTH STUFF
let authUser

let uiConfig
let loggedIn = false

let localUserEmail = "no email"

uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      authUser = authResult
      console.log("succesfuly logged in", authResult.user.email)
      if (loggedIn) location.reload() //reboot if this is a change.
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return false
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none"
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  tosUrl: "<your-tos-url>",
  privacyPolicyUrl: "<your-privacy-policy-url>",
}

function connectToFirebaseAuth() {
  firebase.initializeApp(firebaseConfig)
  //this allowed seperate tabs to have seperate logins
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  firebase.auth().onAuthStateChanged((firebaseAuthUser) => {
    console.log("my goodness there has been an auth change")
    document.getElementById("signOut").display = "block"
    if (!firebaseAuthUser) {
      document.getElementById("name").display = "none"
      document.getElementById("profile-image").display = "none"
      document.getElementById("signOut").style.display = "none"
      console.log("no valid login, sign in again?")
      var ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start("#firebaseui-auth-container", uiConfig)
    } else {
      console.log("we have a user", firebaseAuthUser)
      authUser = firebaseAuthUser

      document.getElementById("signOut").style.display = "block"
      localUserEmail = authUser.multiFactor.user.email
      myDBID = authUser.multiFactor.user.uid
      console.log("authUser", authUser, "myDBID", myDBID)
      document.getElementById("name").innerHTML =
        authUser.multiFactor.user.displayName
      if (authUser.multiFactor.user.photoURL != null)
        document.getElementById("profile-image").src =
          authUser.multiFactor.user.photoURL
      checkForUserInRegularDB(authUser.multiFactor.user)
      subscribeToUsers()
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

function checkForUserInRegularDB(user) {
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

function giveAuthUserRegularDBEntry(authUser) {
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
