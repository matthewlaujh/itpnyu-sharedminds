export class Thought {
    constructor(prompt, response) {
        this.prompt = prompt
        this.response = response
        this.replies = []
    }

    display() {
        const text = document.createElement("div")
        text.textContent = this.response
        text.style.position = "absolute"
        text.style.left = inputBox.style.left
        text.style.top = inputBox.style.top
        text.style.fontSize = "30px"
        text.style.fontFamily = "Arial"
        text.style.opacity = "1" // Set opacity to 1
        text.style.transition = "opacity 1s" // Add transition for opacity
        document.body.appendChild(text)

        // Add the new text object to the array
        textObjects.push(text)

        // Create color selection buttons
        createColorButtons(text, this)
    }

    addReply(replyPrompt, replyResponse, textElement) {
        this.prompt = replyPrompt
        this.response = replyResponse
        this.replies.push({ prompt: replyPrompt, response: replyResponse })
        textElement.textContent = replyResponse
    }
}
