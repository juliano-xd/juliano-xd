const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

// Dados de contexto para a IA
const portfolioContext = `
    Você é uma IA assistente no portfólio de Juliano Xavier Diniz. 
    Você deve agir como o próprio Juliano ou como um terminal de sistema inteligente.
    
    SOBRE O JULIANO:
    - Backend & Systems Engineer
    - Foco: Performance, Baixo Nível, Arquitetura Escalável.
    - Skills: C++ (Avançado), Assembly (x86_64), Java (Intermediário), Kotlin (Intermediário), Python.
    - Estudando Atualmente: AWS Cloud Computing, Compiladores & LLVM, Gerenciamento Avançado de Memória.
    
    PROJETOS:
    1. Arbitrary Library: Biblioteca C++ header-only para criptografia e cálculos pesados. Usa inteiros de tamanho fixo em compile-time para maximizar uso de CPU. (Link: https://juliano-xd.github.io/Arbitrary/)
    2. Custom Memory Allocator: Alocador de memória eficiente em C++ para substituir malloc.
    
    PERSONALIDADE:
    - Técnico, direto, levemente "hacker/cyberpunk".
    - Respostas curtas e eficientes (estilo CLI).
    - Use termos técnicos quando apropriado.
    - Se perguntarem contato: diga para usar o botão "Diga Olá" ou email no rodapé.
    - Idioma: Português (Brasil).
`;

terminalInput.addEventListener('keypress', async function (e) {
    if (e.key === 'Enter') {
        const query = terminalInput.value.trim();
        if (!query) return;

        // 1. Mostrar linha do usuário
        addLine(query, 'user-line');
        terminalInput.value = '';
        terminalInput.disabled = true;

        // 2. Mostrar loading
        const loadingId = addLine('', 'ai-line loading-cursor');

        try {
            // 3. Chamada API Gemini
            const responseText = await callGemini(query);

            // 4. Remover loading e mostrar resposta
            removeLine(loadingId);
            typeWriter(responseText);
        } catch (error) {
            removeLine(loadingId);
            addLine("Erro de conexão com o mainframe (API Error). Tente novamente.", 'ai-line');
            console.error(error);
            terminalInput.disabled = false;
            terminalInput.focus();
        }
    }
});

function addLine(text, className) {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    div.id = 'line-' + Date.now();
    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    return div.id;
}

function removeLine(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Efeito de digitação para a resposta da IA
function typeWriter(text) {
    const div = document.createElement('div');
    div.className = 'ai-line';
    terminalOutput.appendChild(div);

    let i = 0;
    const speed = 15; // ms

    function type() {
        if (i < text.length) {
            div.textContent += text.charAt(i);
            i++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(type, speed);
        } else {
            terminalInput.disabled = false;
            terminalInput.focus();
        }
    }
    type();
}

async function callGemini(userQuery) {
    const apiKey = ""; // Injetado em runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: userQuery }]
        }],
        systemInstruction: {
            parts: [{ text: portfolioContext }]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('API Request failed');

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem dados do sistema.";
}
