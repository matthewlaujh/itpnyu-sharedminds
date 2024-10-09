import { initFirebaseAuth } from "./firebase.js"

export function createUI() {
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

  // Create and append the Firebase sign-in container
  const authContainer = document.createElement("div")
  authContainer.id = "firebaseui-auth-container"
  document.body.appendChild(authContainer)

  // Initialize Firebase Auth UI
  initFirebaseAuthUI()
}

function initFirebaseAuthUI() {
  const authContainer = document.getElementById("firebaseui-auth-container")
  initFirebaseAuth()
}
