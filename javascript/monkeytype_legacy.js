(function () {
    console.log("%c Monkeytype Legacy / Input Event Typer ", "background: #222; color: #ff00ff; font-size: 20px");

    const CONFIG = {
        startDelay: 100,
        typingDelay: 20, // Slightly slower to be safe
    };

    let isArmed = true;

    // Different method: Focus purely on InputEvent which carries the character
    // Many modern sites (React based) care more about 'beforeinput' and 'input' than keydown.
    function typeChar(char) {
        const target = document.activeElement || document.body;

        // 1. Dispatch 'beforeinput' (modern standard)
        const beforeInput = new InputEvent('beforeinput', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true,
            view: window,
            isTrusted: true // We hope...
        });
        target.dispatchEvent(beforeInput);

        // 2. Dispatch 'input'
        const inputEvent = new InputEvent('input', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true,
            view: window,
        });
        target.dispatchEvent(inputEvent);

        // 3. Dispatch 'textInput' (legacy, but sometimes checked)
        if (document.createEvent) {
            const textEvent = document.createEvent('TextEvent');
            textEvent.initTextEvent('textInput', true, true, window, char, 0, "en-US");
            target.dispatchEvent(textEvent);
        }
    }

    async function autoType(text) {
        console.log(`Typing ${text.length} chars (InputEvent only)...`);
        for (let i = 0; i < text.length; i++) {
            typeChar(text[i]);
            if (CONFIG.typingDelay > 0) {
                await new Promise(r => setTimeout(r, CONFIG.typingDelay));
            }
        }
    }

    const triggerHandler = (e) => {
        if (!isArmed) return;

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {

            const activeWord = document.querySelector('#words .word.active');
            if (!activeWord) return;

            const firstLetterElement = activeWord.querySelector('letter');
            const firstLetter = firstLetterElement ? firstLetterElement.textContent : null;

            if (firstLetter && e.key === firstLetter) {
                isArmed = false;

                // Get ALL remaining text from DOM
                const allWords = document.querySelectorAll('#words .word');
                let fullBuffer = "";
                let foundActive = false;

                allWords.forEach(word => {
                    if (word === activeWord) {
                        foundActive = true;
                        const letters = word.querySelectorAll('letter');
                        // Start from index 1 (user just typed 0)
                        for (let i = 1; i < letters.length; i++) {
                            fullBuffer += letters[i].textContent;
                        }
                        fullBuffer += " ";
                    } else if (foundActive) {
                        const letters = word.querySelectorAll('letter');
                        letters.forEach(l => fullBuffer += l.textContent);
                        fullBuffer += " ";
                    }
                });

                if (fullBuffer.endsWith(" ")) {
                    fullBuffer = fullBuffer.slice(0, -1);
                }

                window.removeEventListener('keydown', triggerHandler);

                console.log("Trigger detected. Starting Legacy Typer...");
                setTimeout(() => {
                    autoType(fullBuffer);
                }, CONFIG.startDelay);
            }
        }
    };

    window.addEventListener('keydown', triggerHandler);
    console.log("READY! Type the first letter to test Legacy Mode.");
})();
