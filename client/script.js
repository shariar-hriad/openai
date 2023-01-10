import { v4 as uuid } from 'uuid'
import './style.css'

import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.'

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = ''
        }
    }, 300)
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

function chatStripe(isAi, value, id) {
    return `
      <div class='wrapper ${isAi && 'ai'}'>
        <div class='chat'>
          <div class='profile'>
            <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
          </div>
          <div class='message' id='${id}'>${value}</div>
        </div>
      </div>
    `
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // User's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // Clear the textarea input
    form.reset()

    // Bot's chatstripe
    const id = uuid()
    chatContainer.innerHTML += chatStripe(true, '', id)

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight

    // Specific message div
    const messageDiv = document.getElementById(id)

    // messageDiv.innerHTML = '...'
    loader(messageDiv)

    const response = await fetch('https://openai-kub4.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
        }),
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if (response.ok) {
        const data = await response.json()
        const parsedData = data.bot.trim()

        typeText(messageDiv, parsedData)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
