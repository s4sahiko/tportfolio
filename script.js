document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('command-input');
    const terminalScreen = document.getElementById('terminal-screen');
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('system-status');
    const clockTime = document.getElementById('clock-time');
    
    let history = [];
    let historyIndex = -1;
    let currentDir = '/profile';
    let isBooting = true; 
    
    // --- Content and Command Mapping ---

    const FILE_SYSTEM = {
        '/profile': [
            { name: 'summary.txt', type: 'file' },
            { name: 'skills.data', type: 'file' },
            { name: 'experience.log', type: 'file' },
            { name: 'education.txt', type: 'file' },
            { name: 'certificate.txt', type: 'file' },
            { name: 'contact.pub', type: 'file' },

        ]
    };

    const PROFILE_DATA = {
        'summary.txt': `
<span class="cli-response-title"> SAHIL RAJ - PROFESSIONAL SUMMARY</span>
-------------------------------------------------------
[STATUS] Active | [ROLE] Security Specialist
-------------------------------------------------------
I am a dedicated <b> Cybersecurity Professional </b> committed to safeguarding digital environments and strengthening organizational resilience.I bring a strong 
command of security principles, threat analysis, and risk management, allowing me to identify vulnerabilities and implement effective,
forward-thinking security controls.I excel at responding to security incidents with precision, analyzing emerging threats, and applying industry best practices
to enhance overall security posture. With a proactive mindset and a focus on continuous improvement,I strive to protect critical assets, support secure operations, and contribute to a culture of security excellence within any organization.

`,
        'skills.data': `
<span class="cli-response-title">CORE SKILLS & TOOLS </span>
<ul class="cli-list">
    <li class="cli-list-item cli-info">Ethical Hacking & Pentesting</li>
    <li class="cli-list-item cli-info">Python,HTML, CSS, C++, SQL </li>
    <li class="cli-list-item cli-info">Linux (Kali, Ubuntu), Windows </li>
    <li class="cli-list-item cli-info">Network Analysis (Wireshark, Nmap)</li>
    <li class="cli-list-item cli-info">Vulnerability Exploitation (Metasploit, Burp Suite)</li>
    <li class="cli-list-item cli-info">Version Control (Git, GitHub)</li>
</ul>
`,
        'experience.log': `
<span class="cli-response-title">EXPERIENCE & CERTIFICATIONS </span>
<span class="cli-info">--- [JOB] AI Intern @ Infoys | Sep 2025 to Present ---</span>
<ul class="cli-list">
    <li class="cli-list-item">An AI ticket classifier is a machine learning system that uses Natural Language Processing (NLP) to automatically read, categorize, and route incoming support tickets.
  Its main goal is to speed up resolution and improve efficiency by instantly assigning the correct issue type, priority, and department to each ticket,eliminating 
  manual triage and ensuring the right agent gets the request immediately.

  Project Link: <a href="https://github.com/s4sahiko/Smart-Ticket-Classifier-3.0" target="_blank" class="cli-success">github.com/s4sahiko/Smart-Ticket-Classifier-3.0</a>
  </li>
</ul>

`,
        'education.txt': `
<span class="cli-response-title">EDUCATION FILE</span>
<ul class="cli-list">
    <li class="cli-list-item cli-info">B.Tech - Cyber Security | Parul University - Vadodara, Gujarat | Sep 2025</li>
    <li class="cli-list-item cli-info">Senior Secondary | Trident Public School - Muzaffarpur, Bihar CBSE Board | Jan 2025</li>
    <li class="cli-list-item cli-info">Secondary | Sunshine Prep./High School - Muzaffarpur, Bihar CBSE Board | Jan 2023</li>
</ul>
`,
        'contact.pub': `
<span class="cli-response-title">CONTACT CHANNELS </span>
<ul class="cli-list">
    <li class="cli-list-item cli-info">Email: <a href="mailto:s4sahiko@gmail.com" target="_blank" class="cli-success">s4sahiko@gmail.com</a></li>
    <li class="cli-list-item cli-info">GitHub: <a href="https://github.com/s4sahiko/" target="_blank" class="cli-success">github.com/s4sahiko</a></li>
    <li class="cli-list-item cli-info">Location: Muzaffarpur, Bihar</li>
</ul>
`,
        'certificate.txt': `
<span class="cli-response-title">CERTIFICATE VALIDATION DETAILS</span>
-------------------------------------------------------

<span class="cli-info">--- CNSP - Certified Network Security Professional ---</span>
[ISSUER] SecOps Group
-------------------------------------------------------

<span class="cli-info">--- CCNP - Certified Cybersecurity Network Professional ---</span>
[ISSUER] Red Team Leader
-------------------------------------------------------

<span class="cli-info">--- Ethical Hacking Course ---</span>
[ISSUER] Cisco Networking Academy
-------------------------------------------------------

<span class="cli-info">--- Drop Certified Security Course (DCSE) ---</span>
[ISSUER] The Drop Orgination
-------------------------------------------------------

<span class="cli-info">--- Introduction to Cybersecurity Course ---</span>
[ISSUER] Cisco Networking Academy
-------------------------------------------------------

<span class="cli-info">--- Cybersecurity Pathways Course ---</span>
[ISSUER] Cisco Networking Academy
-------------------------------------------------------

<span class="cli-info">Total 7 verified certification/course records found.</span>
`,
    };

    const HELP_COMMANDS = `
<span class="cli-response-title">HELP - Available Commands:</span>
-------------------------------------------------------
<span class="cli-command">ls</span>: List all profile files.
<span class="cli-command">cat [file]</span>: Display the content of a file (e.g., <span class="cli-command">cat summary.txt</span>).
<span class="cli-command">whoami</span>: Displays the current user and host.
<span class="cli-command">clear</span>: Clears the terminal screen history.
<span class="cli-command">-h</span>: Alias for the 'help' command.
-------------------------------------------------------
`;
    
    const SIMPLE_COMMANDS = {
        'help': HELP_COMMANDS,
        '-h': HELP_COMMANDS,
        'whoami': `<span class="cli-info">user: s4sahiko\nhost: sahil-pentest</span>`,
    };

    // --- Utility Functions ---

    /** Renders the prompt based on the current directory. */
    function getPrompt() {
        return `<span class="cli-command">user@sahil-pentest:${currentDir}$</span> `;
    }

    /** Appends content to the terminal output area. */
    function outputContent(content, isCommand = false) {
        let line = document.createElement('div');
        
        if (isCommand) {
            line.innerHTML = getPrompt() + content;
        } else {
            line.innerHTML = content;
        }

        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    /** Updates the system clock in the status bar. */
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        clockTime.textContent = `TIME: ${timeString}`;
    }

    // ---  Command Handlers ---

    /** Implements the 'ls' command (List Directory Contents). */
    function handleLs() {
        const files = FILE_SYSTEM[currentDir];
        if (!files) return `<span class="cli-error">Error: Directory not found or inaccessible.</span>`;

        let outputHtml = `<span class="cli-response-title">Listing contents of ${currentDir}:</span>`;
        files.forEach(file => {
            // Note: Since 'secret_login.creds' is removed from FILE_SYSTEM, the isSecret check is not strictly needed but kept for file type clarity.
            const color = file.type === 'dir' ? '#00aaff' : '#00ff00';
            outputHtml += `<span style="color: ${color}; margin-right: 15px;">${file.name}</span>`;
        });
        return outputHtml;
    }

    /** Implements the 'cat' command (Concatenate/Display File Content). */
    function handleCat(args) {
        const filename = args[1];
        if (!filename) return `<span class="cli-error">Error: cat: missing operand.</span>`;

        const fileExists = FILE_SYSTEM[currentDir].find(f => f.name === filename && f.type === 'file');

        if (fileExists) {
            // No need to check for 'secret_login.creds' here anymore
            return PROFILE_DATA[filename];
        }
        return `<span class="cli-error">Error: cat: ${filename}: No such file or directory.</span>`;
    }

    /** Modified 'access' command handler to reflect the file's removal. */
    function handleAccess(args) {
        // The 'access' command is removed from HELP, but handling it here for completeness
        return `<span class="cli-error">Error: access: The target file 'secret_login.creds' was securely purged and is no longer accessible.</span>`;
    }
    
    /** Processes the user's command input. */
    function processCommand(fullCommand) {
        // Block command execution during the boot sequence
        if (isBooting) {
            outputContent(fullCommand, true);
            outputContent(`<span class="cli-error">Error: System is still initializing. Please wait.</span>`);
            input.value = '';
            return;
        }

        const parts = fullCommand.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        
        // 1. Log the command
        outputContent(fullCommand, true);

        // 2. Add to history array
        if (fullCommand.trim()) {
            history.unshift(fullCommand);
            historyIndex = -1;
        }

        // 3. Execute command logic
        let response = '';
        switch (command) {
            case 'clear':
                // FIX: Clear output and call welcome message without animation
                output.innerHTML = '';
                outputWelcomeMessage(false);
                break;
            case 'ls':
                response = handleLs();
                break;
            case 'cat':
                response = handleCat(parts);
                break;
            case 'access':
                response = handleAccess(parts); // Handle command if user types it
                break;
            case 'cd':
                // Removed to streamline profile access
                response = `<span class="cli-error">Error: cd command disabled for profile shell. Use 'ls' and 'cat' to navigate.</span>`;
                break;
            default:
                if (SIMPLE_COMMANDS.hasOwnProperty(command)) {
                    response = SIMPLE_COMMANDS[command];
                } else if (command) {
                    response = `<span class="cli-error">Error: command not found: ${command}</span><br>Type '<span class="cli-command">help</span>' or '<span class="cli-command">-h</span>' for a list of valid commands.`;
                }
                break;
        }
        
        if (response) {
            outputContent(response);
        }
        
        // 4. Clear input
        input.value = '';
    }

    /** Initial welcome message with ASCII logo and typewriter effect */
    function outputWelcomeMessage(withTyping = true) {
        const asciiArt = `
          SSSSSS   AAAAAA   HH    HH  IIIIIIII  KKK  KK    OOOOO   
         SS       AA    AA  HH    HH     II     KK KK     OO   OO  
          SSSSS   AAAAAAAA  HHHHHHHH     II     KKK       OO   OO  
             SS   AA    AA  HH    HH     II     KK KK     OO   OO  
         SSSSSS   AA    AA  HH    HH  IIIIIIII  KKK  KK    OOOOO   
        
        
                    ** SAFE : SECURE : SAHIKO  **
        `;
        
        const finalMessageText = `
** SAHIKO - INTERACTIVE PROFILE SHELL **
[STATUS] Active user session. Current directory: ${currentDir}
[TUTORIAL] Start by listing the files: type '<span class="cli-command">ls</span>'
[TUTORIAL] View a file's content: type '<span class="cli-command">cat [filename]</span>'
[INFO] Type '<span class="cli-command">help</span>' for command list.
`;
        // Ensure the status bar is visible before proceeding
        statusBar.style.display = 'flex';
        
        // Start booting
        isBooting = true; 
        input.disabled = false; // Input is NOT disabled so copy/paste works immediately

        if (!withTyping) {
            // Case for 'clear' command: skip animation
            outputContent(`<pre class="cli-success" style="text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);">${asciiArt}</pre>`);
            statusText.textContent = 'STATUS: ONLINE';
            outputContent(finalMessageText);
            isBooting = false; // Boot finished immediately
            input.focus();
            return;
        }


        // --- Boot Animation Sequence (Only runs on initial load) ---
        
        // Step 1: Display ASCII banner immediately
        outputContent(`<pre class="cli-success" style="text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);">${asciiArt}</pre>`);

        const bootSequence = [
            `BIOS: OK (v4.0.1)`,
            `PCI Bus: [OK] System Check Complete`,
            `Kernel: 5.15.0-100-generic loading...`,
            `Mounting /dev/sda1... [SUCCESS]`,
            `Initializing network interface eth0... [UP]`,
            `Security Protocol 7.0 established... [ONLINE]`,
            `Executing: /usr/local/bin/s4sahiko_shell.sh`,
        ];
        
        let lineIndex = 0;
        
        function runBootLine() {
            if (lineIndex < bootSequence.length) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'cli-info boot-anim-line';
                lineDiv.textContent = `[${lineIndex + 1}/${bootSequence.length}] ${bootSequence[lineIndex]}`;
                output.appendChild(lineDiv);
                output.scrollTop = output.scrollHeight;
                
                setTimeout(runBootLine, 300); 
                lineIndex++;
            } else {
                // Step 2: Show final welcome message
                setTimeout(showFinalWelcome, 500);
            }
        }
        
        function showFinalWelcome() {
            statusText.textContent = 'STATUS: ONLINE'; // Update status bar
            outputContent(finalMessageText);
            isBooting = false; // Boot finished
            input.focus();
        }

        setTimeout(runBootLine, 500);
    }

    // --- 4. Event Listeners and Init ---
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Allow command processing unless explicitly disabled (e.g., during 'access' hack)
            if (!input.disabled) { 
                processCommand(input.value);
                historyIndex = -1;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                }
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            } else if (historyIndex === 0) {
                historyIndex = -1;
                input.value = '';
            }
        }
    });

    // Initial setup
    outputWelcomeMessage();
    setInterval(updateClock, 1000); // Start the clock
    
    // Keep focus on the input field
    document.body.addEventListener('click', () => {
        if (!input.disabled) {
            input.focus();
        }
    });
});