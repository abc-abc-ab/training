'use strict';
const d = document, t = window;
let interval = 0; // Holds the ID for setInterval

// Variables to manage the timer's state
let currentPhaseTitle = "";      // Current title of the phase (e.g., "Training", "Break")
let currentPhaseTime = 0;        // Remaining time for the current phase (in seconds)
let phaseCycleCount = 0;         // Cycle count for training/break phases (e.g., #1, #2...)
let isTrainingPhase = true;      // true if currently in training phase, false for break phase

// Independent variable for click count
let clickCount = 0; // Counts total clicks on the window

// Durations obtained from URL parameters
let trainingDuration = 0; // Training time (in seconds)
let breakDuration = 0;    // Break time (in seconds)

// DOM element references (to be obtained within DOMContentLoaded)
let titleElement;
let timeElement;
let clickCountElement;

/**
 * Event listener for when the DOM is fully loaded.
 * Initializes the timer, sets up event listeners, and starts the sequence.
 * @param {Event} e - The DOMContentLoaded event object.
 */
t.addEventListener("DOMContentLoaded", ((e) => {
    // Get references to HTML elements
    titleElement = d.getElementById("phaseTitle"); // Changed ID to phaseTitle for clarity
    timeElement = d.getElementById("timeDisplay");  // Changed ID to timeDisplay for clarity
    clickCountElement = d.getElementById("clickCountDisplay"); // Changed ID to clickCountDisplay for clarity

    // Get URL parameters
    const urlParams = new URLSearchParams(d.location.search);
    const paramTrainingTime = parseFloat(urlParams.get("time"));
    const paramBreakTime = parseFloat(urlParams.get("break"));

    // Convert to seconds and store in global variables
    trainingDuration = paramTrainingTime * 60;
    breakDuration = paramBreakTime * 60;

    // Validate parameters. Redirect if invalid or zero.
    if (isNaN(trainingDuration) || isNaN(breakDuration) || trainingDuration <= 0 || breakDuration <= 0) {
        d.location.href = "./"; // Redirect to root if parameters are invalid
        return; // Stop further execution
    }

    /**
     * Extends Number.prototype to pad single-digit numbers with a leading zero.
     * Note: Extending built-in prototypes can lead to conflicts.
     * Consider a utility function instead for larger projects.
     * @this {Number}
     * @returns {string} The number padded to two digits.
     */
    Object.defineProperty(Number.prototype, "PadTo2Digits",
        { value: function() {return String(this).padStart(2, "0"); }, writable: false
    });

    // Initialize timer state
    currentPhaseTitle = "Training"; // Start with Training
    currentPhaseTime = trainingDuration;
    phaseCycleCount = 1; // First training cycle
    isTrainingPhase = true;
    
    // Set initial display for click count
    if (clickCountElement) {
        clickCountElement.innerText = clickCount;
    }

    // Define display update function (closure for elements)
    const updateDisplayElements = () => {
        if (titleElement) {
            titleElement.innerText = `${currentPhaseTitle} #${phaseCycleCount}`;
        }
        if (timeElement) {
            timeElement.innerText = formatTime(currentPhaseTime);
        }
    };

    // Define the main countdown logic (closure for elements and update function)
    const CountDown = () => {
        currentPhaseTime -= 0.01;
        updateDisplayElements(); // Update display with new time

        if (currentPhaseTime <= 0) {
            currentPhaseTime = 0; // Ensure time doesn't go negative
            updateDisplayElements(); // Final display update for current phase
            t.clearInterval(interval); // Stop the timer
            interval = 0; // Reset interval ID

            // Toggle to the next phase
            togglePhase();
        }
    };

    // Define phase toggling logic (closure)
    const togglePhase = () => {
        if (isTrainingPhase) {
            // If current is training, switch to break
            currentPhaseTitle = "Break";
            currentPhaseTime = breakDuration;
            isTrainingPhase = false;
        } else {
            // If current is break, switch to training
            currentPhaseTitle = "Training";
            currentPhaseTime = trainingDuration;
            isTrainingPhase = true;
            phaseCycleCount++; // Increment cycle count when returning to training
        }

        // Start the timer for the next phase
        startTimerSequence();
    };

    // Define the sequence start logic (closure)
    const startTimerSequence = () => {
        if (interval) {
            t.clearInterval(interval); // Clear any existing timer
        }
        interval = t.setInterval(CountDown, 10); // Start new timer
        console.log(`Timer started: ${currentPhaseTitle} #${phaseCycleCount}, remaining time: ${currentPhaseTime.toFixed(2)}s`);
    };

    // Event listener for window clicks to update click count
    t.addEventListener("click", (e) => {
        if (clickCountElement) {
            clickCountElement.innerText = ++clickCount;
        }
    });

    // Initial display update before starting the timer
    updateDisplayElements();

    // Automatically start the timer sequence on page load (from navigation)
    startTimerSequence();

    // Replace browser history state to clean up URL parameters
    t.history.replaceState("", "", "./timer.html?");
}));

/**
 * Formats time from seconds into MM:SS.ms (minutes:seconds.centiseconds) string.
 * This function is global as it doesn't depend on DOM elements directly.
 * @param {number} timeInSeconds - Time to format, in seconds.
 * @returns {string} Formatted time string (e.g., "01:30.50").
 */
function formatTime(timeInSeconds) {
    const totalCentiseconds = Math.max(0, Math.floor(timeInSeconds * 100)); // Ensure non-negative and integer centiseconds
    const minutes = Math.floor(totalCentiseconds / (60 * 100));
    const seconds = Math.floor((totalCentiseconds % (60 * 100)) / 100);
    const centiseconds = totalCentiseconds % 100;

    // Assuming Number.prototype.PadTo2Digits is defined
    return `${Number(minutes).PadTo2Digits()}:${Number(seconds).PadTo2Digits()}.${Number(centiseconds).PadTo2Digits()}`;
}