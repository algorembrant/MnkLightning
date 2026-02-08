(function () {
    console.log("%c Monkeytype Auto-Typer (Anti-Cheat Bypass) Initiated ", "background: #222; color: #00ff00; font-size: 20px");

    // CONFIGURATION
    const CONFIG = {
        // Delay after you type the first character before the bot takes over (ms)
        startDelay: 50,
        // Delay between characters (ms). 
        // 0 = Instant (but risky for some anti-cheats). 
        // 10-30 = Super fast but slightly safer.
        typingDelay: 10,
        // If true, types spaces between words.
        typeSpaces: true
    };

    let isArmed = true;

    // Helper: Create and dispatch events that look "real"
    function typeChar(char) {
        const target = document.activeElement || document.body;

        let key = char;
        let code, keyCode;

        // Handle Space specifically
        if (char === ' ') {
            code = 'Space';
            keyCode = 32;
        }
        // Handle common punctuation to ensure correct codes
        else if (char === '\n') {
            code = 'Enter';
            keyCode = 13;
        }
        else {
            // Very basic mapping. For complex symbols, this might be generic (which usually passes).
            code = `Key${char.toUpperCase()}`;
            keyCode = char.charCodeAt(0);
        }

        const eventOptions = {
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            isTrusted: true // Browser ignores this for script-generated events, but we set it anyway.
        };

        // 1. Keydown
        target.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

        // 2. Keypress (Deprecated but some sites check it)
        target.dispatchEvent(new KeyboardEvent('keypress', eventOptions));

        // 3. Input (Essential for modern frameworks like React/Vue used in Monkeytype)
        const inputEvent = new InputEvent('input', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(inputEvent);

        // 4. Keyup
        target.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    }

    async function autoType(text) {
        console.log(`Taking over! Typing ${text.length} characters...`);

        for (let i = 0; i < text.length; i++) {
            typeChar(text[i]);
            // Small delay to prevent freezing the browser and mimic extremely fast typing
            if (CONFIG.typingDelay > 0) {
                await new Promise(r => setTimeout(r, CONFIG.typingDelay));
            }
        }
    }

    // MAIN LOGIC
    const triggerHandler = (e) => {
        if (!isArmed) return;

        // We only care about single key presses (no Ctrl/Alt commands)
        // We also ignore if the user is just navigating menus. 
        // We assume the user is "starting" the test.
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {

            const activeWord = document.querySelector('#words .word.active');
            if (!activeWord) return;

            const firstLetterElement = activeWord.querySelector('letter');
            // Monkeytype sometimes puts the first letter in a slightly different state
            // or we might need to be careful about 'correct' class.
            // But generally, the first letter of the active word is what we need.

            const firstLetter = firstLetterElement ? firstLetterElement.textContent : null;

            // CHECK: Did the user type the CORRECT first key?
            if (firstLetter && e.key === firstLetter) {
                isArmed = false; // Disarm immediately

                // Get ALL remaining text
                const allWords = document.querySelectorAll('#words .word');
                let fullBuffer = "";
                let foundActive = false;

                allWords.forEach(word => {
                    if (word === activeWord) {
                        foundActive = true;
                        // For the active word, we need to skip the first letter (user just typed it)
                        // But wait! If we type too fast, we might conflict with the user's input event processing.
                        // So we rebuild the string *including* the rest of this word.

                        const letters = word.querySelectorAll('letter');
                        // Start from index 1 (second letter)
                        for (let i = 1; i < letters.length; i++) {
                            fullBuffer += letters[i].textContent;
                        }
                        if (CONFIG.typeSpaces) fullBuffer += " ";
                    } else if (foundActive) {
                        // Future words
                        const letters = word.querySelectorAll('letter');
                        letters.forEach(l => fullBuffer += l.textContent);
                        if (CONFIG.typeSpaces) fullBuffer += " "; // Add space between words
                    }
                });

                // Remove the very last trailing space if it exists (Monkeytype hates extra spaces at end)
                if (fullBuffer.endsWith(" ")) {
                    fullBuffer = fullBuffer.slice(0, -1);
                }

                // Remove listener to prevent checking every single key stroke from now on
                window.removeEventListener('keydown', triggerHandler);

                console.log("Trigger detected. Typer starting in " + CONFIG.startDelay + "ms");

                setTimeout(() => {
                    autoType(fullBuffer);
                }, CONFIG.startDelay);
            }
        }
    };

    // Auto-rearm logic (Optional, simple reload usually safer)
    // For now, we just run once per page load to ensure stability.
    window.addEventListener('keydown', triggerHandler);

    console.log("READY! Start the test by typing the first letter manually.");
})();
