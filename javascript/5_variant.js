(function () {
    console.log("%c Monkeytype Cheat Initiated (Static Buffer Mode) ", "background: #222; color: #bada55; font-size: 20px");

    const keyMap = {
        ' ': { code: 'Space', keyCode: 32 },
        '\n': { code: 'Enter', keyCode: 13 },
    };

    function typeChar(char) {
        const target = document.activeElement || document.body;
        let key = char;
        let code, keyCode;

        // Basic char code fallback
        if (keyMap[char]) {
            code = keyMap[char].code;
            keyCode = keyMap[char].keyCode;
        } else {
            code = `Key${char.toUpperCase()}`;
            keyCode = char.toUpperCase().charCodeAt(0);
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

    function getDelay() {
        return 100 + (Math.random() * 60 - 30); // ~100-120ms
    }

    async function cheat(textToType) {
        console.log(`Cheat triggered. Typing ${textToType.length} chars...`);

        for (let i = 0; i < textToType.length; i++) {
            typeChar(textToType[i]);
            await new Promise(r => setTimeout(r, getDelay()));
        }
        console.log("Done.");
    }

    // 1. Identify whole words FIRST (as requested)
    function getFullText() {
        const words = document.querySelectorAll('#words .word');
        let fullBuffer = "";

        words.forEach((word, index) => {
            const letters = word.querySelectorAll('letter');
            letters.forEach(l => fullBuffer += l.textContent);

            // Add space between words, but NOT after the last word
            if (index < words.length - 1) {
                fullBuffer += " ";
            }
        });
        return fullBuffer;
    }

    const triggerHandler = (e) => {
        // Only trigger on single char keys
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const targetText = getFullText();
            const firstChar = targetText[0];

            if (firstChar && e.key === firstChar) {
                window.removeEventListener('keydown', triggerHandler);

                // User typed the first char. We type the rest.
                const remainingText = targetText.substring(1);

                console.log("Triggered! Taking over in 150ms...");
                setTimeout(() => cheat(remainingText), 150);
            }
        }
    };

    window.addEventListener('keydown', triggerHandler);
    console.log("READY: Static Buffer Mode. Words identified. Type first letter.");
})();