/* final_project.js
   Final Project
   Author: David Wu  
*/


// HTML Elements
const imageDisplay = document.getElementById('image-display')
const wordDisplay = document.getElementById('word-display');
const showHintButton = document.getElementById('btn-hint');
const hintDisplay = document.getElementById('hint-display');
const keyboardButtons = document.querySelectorAll(".key");
const guessesLeftMsg = document.getElementById('guesses-left')
const playAgainButton = document.getElementById('btn-play-again');

// Hangman Class
class Hangman {
    // Private properties
    #wordList;
    #selectedWord;
    #selectedHint;
    #hiddenWord;
    #maxGuesses;
    #guesses;
    #guessesLeft;
    #gameOver; 
    #currentImageIndex;
    #ImageIndexLimit;
    #timeoutHandler;

    constructor(wordList){
        // Hangman Variables
        this.#wordList = wordList;
        this.#selectedWord = "";
        this.#selectedHint = "";
        this.#hiddenWord = [];

        // Hangman Default Settings
        this.#maxGuesses = 6;
        this.#guesses = 0;
        this.#guessesLeft = this.#maxGuesses;
        this.#gameOver = false;

        // Animation Properties
        this.#currentImageIndex = 1;
        this.#ImageIndexLimit = 27;
        this.#timeoutHandler;
    }

    initializeGame(){
        // Choose random number up to a max of number of words in json data
        const randomIndex = Math.floor(Math.random() * this.#wordList.length);
        
        // Assign selected word and hint based on random number
        this.#selectedWord = this.#wordList[randomIndex].word.toUpperCase();
        this.#selectedHint = this.#wordList[randomIndex].hint;

        //Sanity Checks
        console.log(this.#selectedWord);
        console.log(this.#selectedHint);

        // Reset guesses
        this.#guesses = 0;
        this.#guessesLeft = this.#maxGuesses;

        // Reset keyboard
        keyboardButtons.forEach(function(button) {
            button.disabled = false;
        });

        // Generate hidden word
        this.#hiddenWord = this.#selectedWord.split("").map(function() {
            return "_";
        });

        // Display hidden word
        displayWord(this.#hiddenWord);

        // Remove Play Again Button
        playAgainButton.style.display = "none";

        // Show Hint button
        showHintButton.style.display = "block";

        // Set hint and hide it by default
        hintDisplay.innerHTML = `<p><b>Hint: </b>${this.#selectedHint}</p>`;
        hintDisplay.style.display = "none";

        // Display Number of Guesses Remaining
        guessesLeftMsg.innerHTML = `<p>You have ${this.#guessesLeft} guesses remaining.</p>`

        // Reset to Starting Image
        imageDisplay.src = `../images/0-star.jpeg`; 
        imageDisplay.alt = "0 Stars"

        // Reset wasted animation
        clearTimeout(this.#timeoutHandler);
        this.#currentImageIndex = 1;

        // Reset gameOver status
        this.#gameOver = false;
    }

    guessLetter(guessedLetter){
        // Prevents game from allowing further guesses when game is over
        if (this.#gameOver) {
            return;
        }

        // Check whether the letter exists in selectedWord. If so, iterate through each letter of hiddenWord and change _ to guessedLetter 
        if (this.#selectedWord.includes(guessedLetter)){
            for (let i = 0; i < this.#selectedWord.length; i++){
                if (this.#selectedWord[i] === guessedLetter){
                    this.#hiddenWord[i] = guessedLetter;
                }
            }

            // Update Display
            displayWord(this.#hiddenWord);
        }
        else {
            // Increase guesses counter
            this.#guesses++;

            // Update Image
            imageDisplay.src = `../images/${this.#guesses}-star.jpeg`; 
            imageDisplay.alt = `${this.#guesses} Stars`
        }
        // Check whether game is over
        this.checkGameStatus();
    }

    checkGameStatus(){
        // Update Number of Guesses Remaining
        this.#guessesLeft = this.#maxGuesses - this.#guesses;
        guessesLeftMsg.innerHTML = `<p>You have ${this.#guessesLeft} guess(es) remaining.</p>`

        // Check if hiddenWord is fully revealed (Win condition)
        if (!this.#hiddenWord.includes("_")){
            //Display Victory Image
            if(this.#guesses < 4){
                imageDisplay.src = `../images/victory.jpeg`; 
                imageDisplay.alt = `You Win!`
            }
            else{
                imageDisplay.src = `../images/victory-dmg.jpeg`; 
                imageDisplay.alt = `You Win!`
            }

            // Disable keyboard
            keyboardButtons.forEach(function(button) {
                button.disabled = true;
            });

            //Display Play Again
            playAgainButton.style.display = "block";

            // Set gameOver status to true
            this.#gameOver = true;
            return;
        }

        // Check if maxGuesses has been reached (Lose condition)
        if (this.#guesses >= this.#maxGuesses){
            //Display Wasted Image
            this.wastedAnimation(); 
            imageDisplay.alt = `Wasted!`
            
            //Display Play Again
            playAgainButton.style.display = "block";

            // Disable keyboard
            keyboardButtons.forEach(function(button) {
            button.disabled = true;
            });

            // Set gameOver status to true
            this.#gameOver = true;
            return;
        }
    }

    // Wasted Animation Function
    wastedAnimation() {
        // Stop animation when image limit is reached
        if (this.#currentImageIndex > this.#ImageIndexLimit) {
            clearTimeout(this.#timeoutHandler);
            return;
        }

        // Update image
        imageDisplay.src = `../images/wasted/wasted-${this.#currentImageIndex}.jpeg`;

        // Update image index
        this.#currentImageIndex++;

        // Schedule next frame
        this.#timeoutHandler = setTimeout(() => {
            this.wastedAnimation();
        }, 200);
    }
}

let hangmanGame;

// Fetch JSON file containing words and hints via fetch
fetch("json/words.json")
        .then(function(response){
            // Check if response is okay, return response into JSON object, if so. 
            if(response.ok){
                return response.json(); 
            }
        // Throw an error if the response isn't okay
        throw new Error("Unable to retrieve word list");
        })
        .then(function(jsonData){
            // Create and initialize new game  
            hangmanGame = new Hangman(jsonData);
            hangmanGame.initializeGame();
        })
        .catch(function(error){
            console.error("Fetch error:", error);
        });

// Display hidden word
function displayWord(hiddenWord) {

    // Clear existing word display
    wordDisplay.innerHTML = "";

    // Create individual span for each letter
    hiddenWord.forEach(function(letter) {

        const letterElement = document.createElement("span");

        letterElement.classList.add("letter");

        // Hide underscores while preserving the underline
        letterElement.textContent = letter;

        wordDisplay.appendChild(letterElement);
    });
} 

// Click functionality for Hint Button
showHintButton.addEventListener('click', function(){
    //Show Hint and hide hint button
    hintDisplay.style.display = "block";
    showHintButton.style.display = "none";
});

// Click functionality for Play Again Button
playAgainButton.addEventListener('click', function(){
    hangmanGame.initializeGame();
});

// Click functionality for keyboard keys
keyboardButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        // Get the letter from the clicked button
        const guessedLetter = button.textContent;

        // Disable button
        button.disabled = true;

        // Run guessletter given keyboard input
        hangmanGame.guessLetter(guessedLetter);
    });
});




/* AI Notes
Prompt: Can you correct my fetch code - https://chatgpt.com/s/t_6af4f070e20481918478496718c182a2
Prompt: what would be the best way to display the word in _ _ _ _ format? - https://chatgpt.com/s/t_6af556efa3a4819180a424f3c7902b3e
Prompt: without coding the entire section, give me the outline with the queryselectorall, alternatively, i can use jquery too, if it's easier - https://chatgpt.com/s/t_6af557674cc4819191223dafbe57f3d5
Prompt: here's my current js <pasted code>. what would be recommended for an object constructor and what should i put in it? - https://chatgpt.com/s/t_6afe8b82289481918e07900e324829ba
Prompt: i'm getting Uncaught SyntaxError: unexpected token: '{' final_project.js:32:28 - https://chatgpt.com/s/t_6afe8bbe17ac8191b84d677f0e209cc6
Prompt: any other major issues with the code? - https://chatgpt.com/s/t_6afe8fb614388191a3fc5a90006e7c29
 */