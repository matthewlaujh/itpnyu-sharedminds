// Set the proxy URL for the Replicate API
const replicateProxy = "https://replicate-api-proxy.glitch.me"

// Create a canvas element and set its attributes and styles
const canvas = document.createElement("canvas")
canvas.setAttribute("id", "myCanvas")
canvas.style.position = "absolute"
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.left = "0"
canvas.style.top = "0"
canvas.style.width = "100%"
canvas.style.height = "100%"
canvas.style.backgroundColor = "#f0f0f0"
document.body.appendChild(canvas)

// Create an input box element and set its attributes and styles
const inputBox = document.createElement("input")
inputBox.setAttribute("type", "text")
inputBox.setAttribute("id", "inputBox")
inputBox.setAttribute("placeholder", "Enter new thought")
inputBox.setAttribute("autocomplete", "off") // Disable dropdown showing past inputs
inputBox.style.position = "fixed"
inputBox.style.width = "60%"
inputBox.style.padding = "10px"
inputBox.style.left = "2%"
inputBox.style.top = "2%"
inputBox.style.zIndex = "100"
inputBox.style.fontSize = "1rem"
inputBox.style.fontFamily = "Arial"
inputBox.style.border = "none"
inputBox.style.borderBottom = "2px solid #696969"
inputBox.style.color = "#696969"
inputBox.style.backgroundColor = "transparent"
inputBox.style.outline = "none" // Remove the default outline
inputBox.style.caretColor = "transparent" // Hide the caret
inputBox.addEventListener("focus", () => {
  inputBox.style.caretColor = "#696969" // Show the caret when focused
  inputBox.classList.add("pulsing-caret") // Add pulsing caret effect
})
inputBox.addEventListener("blur", () => {
  inputBox.style.caretColor = "transparent" // Hide the caret when blurred
  inputBox.classList.remove("pulsing-caret") // Remove pulsing caret effect
})
document.body.appendChild(inputBox)

const styleSheet = document.createElement("style")
styleSheet.textContent = `
@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0.3; }
}

.fading-text {
  animation-fill-mode: forwards;
}`
document.head.appendChild(styleSheet)
// Create a container for the buttons
const buttonContainer = document.createElement("div")
buttonContainer.style.position = "fixed"
buttonContainer.style.left = "2%"
buttonContainer.style.top = `${
  inputBox.offsetHeight + window.innerHeight * 0.03 + 2
}px` // Position below the input box with 1% gap
buttonContainer.style.zIndex = "100"
buttonContainer.style.display = "flex"
document.body.appendChild(buttonContainer)

// Array to store text objects
const textObjects = []
let countdownInterval

// Function to create a button
function createButton(color) {
  const button = document.createElement("button")
  button.style.backgroundColor = color
  const buttonHeight = inputBox.offsetHeight
  const buttonWidth = (buttonHeight / 2) * 3
  button.style.width = `${buttonWidth}px`
  button.style.height = `${buttonHeight}px`
  button.style.margin = "5px"
  button.style.border = "2px solid #696969"
  button.style.cursor = "pointer"
  buttonContainer.appendChild(button)
  return button
}

// Create buttons with pastel colors
const colors = [
  "#FFA07A", // Strongest Pastel Orange
  "#FFB07A", // Lighter Pastel Orange
  "#FFC07A", // Lighter Pastel Orange
  "#FFD07A", // Lighter Pastel Orange
  "#FFE07A", // Lighter Pastel Orange
  "#FFF07A", // Lighter Pastel Orange
  "#FFF5A0", // Lighter Pastel Orange
  "#FFFAC0", // Lighter Pastel Orange
  "#FFFDE0", // Lightest Pastel Orange
  "#f0f0f0", // Grey
]
const lifespans = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
const fadeDurations = [6, 11, 16, 21, 26, 31, 36, 41, 46, 51]
const buttons = colors.map(createButton)

// Class to represent a Thought
class Thought {
  constructor(prompt, response, colorIndex, initialInput) {
    this.prompt = prompt
    this.response = response
    this.replies = []
    this.textElement = null // Store a reference to the text element
    this.container = null // Store a reference to the container element
    this.countdownDuration = (colorIndex + 1) * 5000 // Set countdown duration based on color
    this.lifespan = lifespans[colorIndex] // Set lifespan based on color
    this.colorIndex = colorIndex // Store the color index
    this.timestamp = new Date().toLocaleString() // Store the timestamp
    this.initialInput = initialInput // Store the initial input value
  }

  // Method to display the thought
  display() {
    // Create a container div for the thought
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "2%"
    container.style.width = "96%"
    container.style.border = "2px solid #696969"
    container.style.padding = "10px"
    container.style.boxSizing = "border-box"
    container.style.color = "#696969"
    container.style.backgroundColor = colors[this.colorIndex] // Set initial background color

    // Create a div element to display the timestamp and initial input
    const timestamp = document.createElement("div")
    timestamp.textContent = `Thought: ${this.timestamp} - "${this.initialInput}"`
    timestamp.style.fontSize = "1rem"
    timestamp.style.fontFamily = "Arial"
    timestamp.style.color = "#696969"
    timestamp.style.marginBottom = "10px" // Same vertical distance as reply input box
    container.appendChild(timestamp)

    // Create a div element to display the response
    const text = document.createElement("div")
    text.textContent = this.response
    text.style.fontSize = "1rem"
    text.style.fontFamily = "Arial"
    text.style.color = "#696969"
    this.setFadeOutAnimation(text) // Set fade-out animation
    container.appendChild(text)

    // Store a reference to the text element
    this.textElement = text

    // Create a reply box element and set its attributes and styles
    const replyBox = document.createElement("input")
    replyBox.setAttribute("type", "text")
    replyBox.setAttribute("placeholder", "Reply to thought")
    replyBox.style.width = "100%" // Set width to match the thought container
    replyBox.style.marginTop = "10px"
    replyBox.style.fontSize = "1rem"
    replyBox.style.fontFamily = "Arial"
    replyBox.style.border = "none"
    replyBox.style.borderBottom = "2px solid #696969"
    replyBox.style.color = "#696969"
    replyBox.style.backgroundColor = "transparent"
    replyBox.style.outline = "none" // Remove the default outline
    replyBox.style.caretColor = "transparent" // Hide the caret
    replyBox.addEventListener("focus", () => {
      replyBox.style.caretColor = "#696969" // Show the caret when focused
      replyBox.classList.add("pulsing-caret") // Add pulsing caret effect
      this.stopCountdown() // Stop countdown when typing
      this.stopFadeOutAnimation(this.textElement) // Stop fade-out animation when typing
    })
    replyBox.addEventListener("blur", () => {
      replyBox.style.caretColor = "transparent" // Hide the caret when blurred
      replyBox.classList.remove("pulsing-caret") // Remove pulsing caret effect
      this.startCountdown() // Restart countdown when typing stops
      this.setFadeOutAnimation(this.textElement) // Restart fade-out animation when typing stops
    })
    container.appendChild(replyBox)

    // Create a remove button
    const removeButton = document.createElement("button")
    removeButton.textContent = "x"
    removeButton.style.position = "absolute"
    removeButton.style.top = "10px"
    removeButton.style.right = "10px"
    removeButton.style.border = "none"
    removeButton.style.backgroundColor = "transparent"
    removeButton.style.color = "#696969"
    removeButton.style.cursor = "pointer"
    removeButton.style.fontSize = "1rem" // Same size as the thought text
    removeButton.style.height = replyBox.offsetHeight + "px" // Set height to match reply input box
    removeButton.addEventListener("click", () => {
      this.container.remove()
      const index = textObjects.indexOf(this.container)
      if (index > -1) {
        textObjects.splice(index, 1)
      }
      updateThoughtPositions()
    })
    container.appendChild(removeButton)

    // Add the new text object to the array
    textObjects.push(container)

    // Append the container to the document body
    document.body.appendChild(container)

    // Store a reference to the container element
    this.container = container

    // Update the positions of all thought boxes
    updateThoughtPositions()

    // Start the countdown for the next question
    this.startCountdown()
  }

  // Method to add a reply to the thought
  addReply(replyPrompt, replyResponse) {
    this.replies.push({ prompt: replyPrompt, response: replyResponse })
    this.textElement.textContent = replyResponse
    this.setFadeOutAnimation(this.textElement) // Restart fade-out animation
  }

  // Method to set the fade-out animation
  setFadeOutAnimation(element) {
    element.style.animation = "none" // Reset animation
    element.offsetHeight // Trigger reflow
    element.style.animation = `fadeOut ${
      fadeDurations[this.colorIndex]
    }s linear forwards` // Set fade-out animation
  }

  // Method to stop the fade-out animation
  stopFadeOutAnimation(element) {
    element.style.animation = "none" // Stop animation
  }

  // Method to start a countdown and ask for words again
  startCountdown() {
    this.stopCountdown() // Ensure any existing countdown is stopped
    this.countdownInterval = setTimeout(async () => {
      this.lifespan -= 1 // Decrement lifespan
      if (this.lifespan <= 0) {
        if (this.colorIndex < colors.length - 1) {
          // Move to the next color
          this.colorIndex += 1
          this.container.style.backgroundColor = colors[this.colorIndex]
          this.lifespan = lifespans[this.colorIndex]
          this.countdownDuration = (this.colorIndex + 1) * 5000
        } else {
          // Remove the thought if it reaches the last color
          this.container.remove()
          const index = textObjects.indexOf(this.container)
          if (index > -1) {
            textObjects.splice(index, 1)
          }
          return
        }
      }

      const replyPrompt = `Only reply to the response, everything else in background information and context for you, read and act accordingly but do not acknowledge it in the response. This was my original thought "${this.prompt}". This is a reply to a thought I had ${this.response}, write a response to the reply that I got to keep a conversation going this should be coming from me in a similar style to the original thought. The response should be non-definitive and ambiguous so as to keep the thought spiral going. The response should not be longer than a sentence.`
      const replyGeneratedText = await askForWords(replyPrompt)
      if (replyGeneratedText) {
        // Update the current thought with the new response
        this.addReply(replyPrompt, replyGeneratedText)
        console.log(
          "Updated Thought object JSON:",
          JSON.stringify(this, null, 2)
        ) // Log the updated Thought object as JSON
      } else {
        console.error("Generated reply text is null")
      }

      // Restart the fade-out animation
      this.setFadeOutAnimation(this.textElement)

      // Restart the countdown
      this.startCountdown()
      updateThoughtPositions()
    }, this.countdownDuration) // Use the countdown duration set by the button
  }

  // Method to stop the countdown
  stopCountdown() {
    clearTimeout(this.countdownInterval)
  }
}

// Function to update the positions of all thought boxes
function updateThoughtPositions() {
  let topPosition =
    inputBox.offsetHeight +
    buttonContainer.offsetHeight +
    window.innerHeight * 0.045 // Start 2% below the input box and button container
  textObjects.forEach((container) => {
    container.style.top = `${topPosition}px`
    topPosition += container.offsetHeight + window.innerHeight * 0.02 // 2% space between each thought
  })
}

// Add event listeners to the input box buttons
buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const inputValue = inputBox.value
    console.log("Input value:", inputValue)

    // Call askForWords with the input value
    const promptText = `Only reply to the thought, everything else in background information and context for you, read and act accordingly but do not acknowledge it in the response.These is a thought I had "${inputValue}". Ask me a follow up question to dig deeper into my thoughts. Only ask one question, only ask the question, everything else is unnecessary, the question should not be longer than a sentence. There should not be any filler context text. The response should be non-definitive and ambiguous so as to keep the thought spiral going. Keep it casual and conversational.`
    askForWords(promptText).then((generatedText) => {
      // Create a new Thought object and display it
      if (generatedText) {
        const thought = new Thought(
          promptText,
          generatedText,
          index,
          inputValue
        )
        thought.display()
        console.log("Thought object JSON:", JSON.stringify(thought, null, 2)) // Log the Thought object as JSON
      } else {
        console.error("Generated text is null")
      }

      // Clear the input box
      inputBox.value = ""
    })
  })
})

// Function to call the Replicate API and get a response
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
    // console.log("API response JSON:", JSON.stringify(proxy_said, null, 2)) // Log the JSON response

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
