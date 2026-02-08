(function () {
    console.log("%c Monkeytype Custom Text Typer Initiated ", "background: #222; color: #00ffff; font-size: 20px");

    // ==========================================
    // PASTE YOUR TEXT HERE
    // ==========================================
    const CUSTOM_TEXT = "do for between since face can leave where life head all own in be great there state what find back by even";
    // ==========================================

    const CONFIG = {
        startDelay: 50,  // ms to wait after first key
        typingDelay: 1000, // ms between keys
    };

    let isArmed = true;

    function typeChar(char) {
        const target = document.activeElement || document.body;

        let key = char;
        let code, keyCode;

        if (char === ' ') {
            code = 'Space';
            keyCode = 32;
        }
        else if (char === '\n') {
            code = 'Enter';
            keyCode = 13;
        }
        else {
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
            isTrusted: true
        };

        target.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        target.dispatchEvent(new KeyboardEvent('keypress', eventOptions));

        const inputEvent = new InputEvent('input', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(inputEvent);

        target.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    }

    async function autoType(text) {
        console.log(`Typing custom text (${text.length} chars)...`);
        for (let i = 0; i < text.length; i++) {
            typeChar(text[i]);
            if (CONFIG.typingDelay > 0) {
                await new Promise(r => setTimeout(r, CONFIG.typingDelay));
            }
        }
        console.log("Done!");
    }

    const triggerHandler = (e) => {
        if (!isArmed) return;

        // Check if user is typing a single character (no shortcuts)
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {

            // We use the FIRST character of our CUSTOM_TEXT as the trigger
            const firstCharOfCustom = CUSTOM_TEXT[0];

            if (firstCharOfCustom && e.key === firstCharOfCustom) {
                isArmed = false;
                window.removeEventListener('keydown', triggerHandler);

                // We skip the first char because the user just typed it
                const remainingText = CUSTOM_TEXT.substring(1);

                console.log("Trigger matched! Starting in " + CONFIG.startDelay + "ms...");

                setTimeout(() => {
                    autoType(remainingText);
                }, CONFIG.startDelay);
            }
        }
    };

    window.addEventListener('keydown', triggerHandler);

    console.log(`READY! Type the first letter "${CUSTOM_TEXT[0]}" to start.`);
})();
