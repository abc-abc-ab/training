'use strict';
const d = document, t = window; // Shorthand for document and window
let interval = 0; // Holds the ID for setInterval, allows clearing the timer

// Variables to manage the timer's state
let currentPhaseTitle = "";      // Current title of the phase (e.g., "Training", "Break", "Completed")
let currentPhaseTime = 0;        // Remaining time for the current phase (in seconds)
let phaseCycleCount = 0;         // Current cycle number for the training/break sequence (e.g., #1, #2...)
let isTrainingPhase = true;      // Flag: true if currently in training phase, false for break phase

// Independent variable for click count
let clickCount = 0; // Counts total clicks on the window during a training phase

// Durations obtained from URL parameters
let trainingDuration = 0; // Configured training time (in seconds)
let breakDuration = 0;    // Configured break time (in seconds)
let totalTrainingCycles = 0; // Total number of training cycles to perform

// DOM element references (declared to be accessible globally, assigned within DOMContentLoaded)
let titleElement;
let timeElement;
let clickCountElement;

/**
 * Event listener for when the DOM is fully loaded.
 * This is the entry point for initializing the timer,
 * setting up event listeners, and starting the sequence.
 * @param {Event} e - The DOMContentLoaded event object.
 */
t.addEventListener("DOMContentLoaded", ((e) => {
    // 1. Get references to HTML elements using their specific IDs.
    // These IDs should match those defined in your timer.html file.
    titleElement = d.getElementById("phaseTitle");
    timeElement = d.getElementById("timeDisplay");
    clickCountElement = d.getElementById("clickCountDisplay");

    // 2. Parse URL parameters for training duration, break duration, and total cycles.
    const urlParams = new URLSearchParams(d.location.search);
    const paramTrainingTime = parseFloat(urlParams.get("time"));
    const paramBreakTime = parseFloat(urlParams.get("break"));
    const paramTrainingCycles = parseInt(urlParams.get("times")); // Get total training cycles

    // 3. Convert input minutes to seconds for internal use.
    trainingDuration = paramTrainingTime * 60;
    breakDuration = paramBreakTime * 60;
    totalTrainingCycles = paramTrainingCycles; // Store total cycles

    // 4. Validate parameters. If any are invalid (not a number, zero, or negative),
    // redirect the user back to the setup page (e.g., index.html).
    if (isNaN(trainingDuration) || isNaN(breakDuration) || isNaN(totalTrainingCycles) ||
        trainingDuration <= 0 || breakDuration <= 0 || totalTrainingCycles <= 0) {
        d.location.href = "./"; // Redirect to the root (assuming it's your setup page)
        return; // Stop further execution if redirection occurs
    }

    /**
     * Extends Number.prototype to pad single-digit numbers with a leading zero.
     * This makes time formatting like "05" instead of "5".
     * NOTE: Extending built-in prototypes can sometimes lead to conflicts in larger projects.
     * For isolated scripts, it's often acceptable.
     * @this {Number}
     * @returns {string} The number padded to two digits.
     */
    Object.defineProperty(Number.prototype, "PadTo2Digits",
        { value: function() {return String(this).padStart(2, "0"); }, writable: false
    });

    // 5. Initialize the timer's starting state.
    currentPhaseTitle = "Training"; // The first phase is always Training
    currentPhaseTime = trainingDuration; // Set initial time to training duration
    phaseCycleCount = 1; // Start with the first training cycle
    isTrainingPhase = true; // Confirm we are in the training phase
    
    // 6. Set the initial display for the click count, usually 0.
    if (clickCountElement) {
        clickCountElement.innerText = clickCount;
    }

    /**
     * Updates the main display elements (title and time).
     * This function is defined inside DOMContentLoaded to form a closure,
     * allowing it to directly access `titleElement` and `timeElement`.
     */
    const updateDisplayElements = () => {
        if (titleElement) {
            titleElement.innerText = `${currentPhaseTitle} #${phaseCycleCount}`;
        }
        if (timeElement) {
            timeElement.innerText = formatTime(currentPhaseTime);
        }
    };

    /**
     * The core countdown logic, executed repeatedly by setInterval.
     * Decrements time, updates display, and handles phase transitions.
     * This function also uses a closure to access shared state and `updateDisplayElements`.
     */
    const CountDown = () => {
        currentPhaseTime -= 0.01; // Decrement time by 0.01 seconds (10 milliseconds)
        updateDisplayElements(); // Refresh the displayed time

        // Check if the current phase has ended
        if (currentPhaseTime <= 0) {
            currentPhaseTime = 0; // Ensure time doesn't show negative values
            updateDisplayElements(); // Final update to show 00:00.00
            t.clearInterval(interval); // Stop the current timer
            interval = 0; // Reset the interval ID

            // --- Phase-specific logic after a phase ends ---
            if (isTrainingPhase) {
                // If a training phase just ended:
                // Save the click count for this specific training cycle.
                saveClickCount(phaseCycleCount, clickCount);
                clickCount = 0; // Reset click count for the next training phase
                if (clickCountElement) {
                    clickCountElement.innerText = clickCount; // Update click count display to 0
                }
                console.log(`Training Cycle #${phaseCycleCount} ended. Click count saved and reset.`);

                // Check if all designated training cycles are complete.
                if (phaseCycleCount >= totalTrainingCycles) {
                    console.log("All training cycles completed!");
                    currentPhaseTitle = "Completed!"; // Update title to indicate completion
                    if (titleElement) {
                        titleElement.innerText = currentPhaseTitle; // Display completion message
                    }
                    if (timeElement) {
                        timeElement.innerText = "00:00.00"; // Ensure time display shows 0
                    }
                    return; // Stop the entire timer sequence
                }
            }

            // If not all cycles are complete, toggle to the next phase (Break or Training).
            togglePhase();
        }
    };

    /**
     * Toggles the timer between Training and Break phases.
     * Also updates the phase title, time, and cycle count as needed.
     * Uses a closure to access shared state and `startTimerSequence`.
     */
    const togglePhase = () => {
        if (isTrainingPhase) {
            // Currently in Training -> Switch to Break
            currentPhaseTitle = "Break";
            currentPhaseTime = breakDuration;
            isTrainingPhase = false;
            console.log("Switching to Break phase.");
        } else {
            // Currently in Break -> Switch to Training
            currentPhaseTitle = "Training";
            currentPhaseTime = trainingDuration;
            isTrainingPhase = true;
            phaseCycleCount++; // Increment cycle count when starting a new training phase
            console.log(`Switching to Training phase #${phaseCycleCount}.`);
        }
        startTimerSequence(); // Start the timer for the newly set phase
    };

    /**
     * Starts or restarts the timer (setInterval).
     * Clears any existing timer before starting a new one.
     * Uses a closure to access `CountDown`.
     */
    const startTimerSequence = () => {
        if (interval) {
            t.clearInterval(interval); // Clear any previously running timer
        }
        interval = t.setInterval(CountDown, 10); // Start CountDown every 10 milliseconds
        console.log(`Timer started: ${currentPhaseTitle} #${phaseCycleCount}, remaining time: ${currentPhaseTime.toFixed(2)}s`);
    };

    /**
     * Saves the click count for a specific training cycle to the browser's Local Storage.
     * This allows data persistence even if the user navigates away or closes the tab.
     * @param {number} cycle - The training cycle number for which to save clicks.
     * @param {number} count - The total click count for that specific cycle.
     */
    const saveClickCount = (cycle, count) => {
        const key = `training_cycle_${cycle}_clicks`; // Unique key for storage (e.g., "training_cycle_1_clicks")
        try {
            localStorage.setItem(key, count.toString()); // Store as string
            console.log(`Saved ${key}: ${count} to Local Storage.`);
            // You could optionally add logic here to display all saved counts on the page.
        } catch (e) {
            console.error("Failed to save click count to Local Storage:", e);
        }
    };

    /**
     * Event listener for all window clicks.
     * Clicks are only counted if the timer is currently in a "Training" phase.
     * @param {Event} e - The click event object.
     */
    t.addEventListener("click", (e) => {
        // Only increment click count if currently in the training phase
        // and the click count display element exists.
        if (isTrainingPhase && clickCountElement) {
            clickCountElement.innerText = ++clickCount; // Increment and update display
        } else if (!isTrainingPhase) {
            console.log("Clicks are not counted during the Break phase.");
        }
    });

    // 7. Perform an initial display update to show the starting values before the timer starts.
    updateDisplayElements();

    // 8. Automatically start the timer sequence once the page is loaded.
    // This assumes the user has navigated from a setup page (e.g., index.html).
    startTimerSequence();

    // 9. Clean up the URL by removing the parameters from the address bar.
    // This doesn't reload the page.
    t.history.replaceState("", "", "./timer.html?");
}));

/**
 * Formats time from seconds into a MM:SS.ms (minutes:seconds.centiseconds) string.
 * This function is defined globally because it doesn't directly interact with DOM elements
 * obtained within DOMContentLoaded, making it reusable.
 * @param {number} timeInSeconds - The time value in seconds to format.
 * @returns {string} The formatted time string (e.g., "01:30.50").
 */
function formatTime(timeInSeconds) {
    // Ensure time is not negative and convert to centiseconds for accurate floor operations.
    const totalCentiseconds = Math.max(0, Math.floor(timeInSeconds * 100));
    const minutes = Math.floor(totalCentiseconds / (60 * 100)); // Total centiseconds in a minute
    const seconds = Math.floor((totalCentiseconds % (60 * 100)) / 100); // Remaining centiseconds in seconds
    const centiseconds = totalCentiseconds % 100; // Remaining centiseconds

    // Use the PadTo2Digits prototype method for consistent formatting.
    return `${Number(minutes).PadTo2Digits()}:${Number(seconds).PadTo2Digits()}.${Number(centiseconds).PadTo2Digits()}`;
}