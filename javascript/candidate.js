(function () {
    console.log("%c Monkeytype Command Typer (execCommand) ", "background: #222; color: #ff0000; font-size: 20px");

    const CONFIG = {
        startDelay: 50,
        typingDelay: 10,
    };

    let isArmed = true;

    // EXECCOMMAND METHOD
    // This often bypasses "isTrusted" checks because it simulates a browser action (paste/insert)
    // rather than a raw key event.
    function typeChar(char) {
        // We use insertText which is a powerful way to simulate user input
        document.execCommand('insertText', false, char);
    }

    async function autoType(text) {
        console.log(`Typing ${text.length} chars (Command Method)...`);
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

                // Fetch text similar to before
                const allWords = document.querySelectorAll('#words .word');
                let fullBuffer = "";
                let foundActive = false;

                allWords.forEach(word => {
                    if (word === activeWord) {
                        foundActive = true;
                        const letters = word.querySelectorAll('letter');
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

                console.log("Trigger detected. Starting Command Typer...");
                setTimeout(() => {
                    autoType(fullBuffer);
                }, CONFIG.startDelay);
            }
        }
    };

    window.addEventListener('keydown', triggerHandler);
    console.log("READY! Type the first letter to test Command Mode.");
})();
