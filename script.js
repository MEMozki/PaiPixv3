const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('prompt');
const generatedImagesContainer = document.getElementById('generated-images');

generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        alert("Please enter a prompt!");
        return;
    }

    showLoadingState();

    try {
        const translatedText = await translateToEnglish(prompt);
        const imageData = await generateImage(translatedText);

        if (imageData) {
            displayGeneratedImage(imageData.image, prompt);
        } else {
            throw new Error("No image data returned");
        }
    } catch (err) {
        console.error(err);
        alert("Error generating the image. Please try again.");
    } finally {
        hideLoadingState();
    }
});

function showLoadingState() {
    promptInput.disabled = true;
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";
}

function hideLoadingState() {
    promptInput.disabled = false;
    generateBtn.disabled = false;
    generateBtn.innerText = "Generate";
}

function displayGeneratedImage(imageBase64, originalPrompt) {
    generatedImagesContainer.innerHTML = `
        <img class="generated" src="data:image/jpeg;base64,${imageBase64}" alt="Generated Art">
        <p><strong>Prompt:</strong> ${originalPrompt}</p>
    `;
}

async function translateToEnglish(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0];
}

async function generateImage(prompt) {
    const url = "https://bf.dallemini.ai/generate";
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt })
    });

    if (response.ok) {
        const data = await response.json();
        const imageBase64 = data.images?.[0];
        if (imageBase64) {
            return {
                image: imageBase64,
                size: `${(imageBase64.length * 3) / 4} bytes`
            };
        }
    }

    throw new Error("Image generation failed");
}
