const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// HTML template with the consciousness components
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoreFlow360 - Consciousness Components Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes consciousness-pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-consciousness-pulse {
            animation: consciousness-pulse 4s ease-in-out infinite;
        }
    </style>
</head>
<body class="bg-black text-white">
    <div class="min-h-screen">
        <!-- Hero Section -->
        <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-black"></div>
            
            <!-- Canvas for particle system -->
            <canvas id="consciousness-canvas" class="absolute inset-0 w-full h-full"></canvas>
            
            <div class="relative z-10 text-center px-4">
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    <span class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        CoreFlow360
                    </span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-8">
                    Experience Business Consciousness
                </p>
                <div class="flex gap-4 justify-center">
                    <button onclick="window.location.href='#dashboard'" class="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        View Dashboard
                    </button>
                    <button onclick="resetCanvas()" class="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-colors">
                        Reset Particles
                    </button>
                </div>
            </div>
        </div>

        <!-- Dashboard Section -->
        <div id="dashboard" class="min-h-screen bg-gray-950 p-8">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-4xl font-bold mb-8 text-center">
                    <span class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Quantum Evolution Dashboard
                    </span>
                </h2>
                
                <!-- Metrics Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-lg border border-purple-500/20">
                        <h3 class="text-lg font-semibold mb-2">Consciousness Level</h3>
                        <div class="text-3xl font-bold text-purple-400">87%</div>
                        <div class="text-sm text-gray-400">+12% from last month</div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-6 rounded-lg border border-blue-500/20">
                        <h3 class="text-lg font-semibold mb-2">Neural Connections</h3>
                        <div class="text-3xl font-bold text-blue-400">1,234</div>
                        <div class="text-sm text-gray-400">Active synapses</div>
                    </div>
                    <div class="bg-gradient-to-br from-cyan-900/50 to-green-900/50 p-6 rounded-lg border border-cyan-500/20">
                        <h3 class="text-lg font-semibold mb-2">Evolution Rate</h3>
                        <div class="text-3xl font-bold text-cyan-400">2.4x</div>
                        <div class="text-sm text-gray-400">Faster than baseline</div>
                    </div>
                </div>

                <!-- AI Evolution Visualization -->
                <div class="bg-gray-900 p-8 rounded-lg border border-gray-800">
                    <h3 class="text-2xl font-semibold mb-4">AI Evolution Tree</h3>
                    <div class="relative h-64">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="animate-consciousness-pulse w-32 h-32 bg-purple-600 rounded-full opacity-20"></div>
                            <div class="absolute w-20 h-20 bg-purple-500 rounded-full"></div>
                            <div class="absolute w-8 h-8 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Particle system for consciousness awakening
        const canvas = document.getElementById('consciousness-canvas');
        const ctx = canvas.getContext('2d');
        
        let particles = [];
        let connections = [];
        let mouseX = 0;
        let mouseY = 0;
        
        // Resize canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.color = \`hsl(\${Math.random() * 60 + 250}, 70%, 60%)\`;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Bounce off walls
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                
                // Attract to mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    this.vx += dx * 0.0001;
                    this.vy += dy * 0.0001;
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
        
        // Initialize particles
        function initParticles() {
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                ));
            }
        }
        
        // Draw connections
        function drawConnections() {
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Animation loop
        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            drawConnections();
            
            requestAnimationFrame(animate);
        }
        
        // Mouse tracking
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        // Reset function
        function resetCanvas() {
            initParticles();
        }
        
        // Start animation
        initParticles();
        animate();
    </script>
</body>
</html>
`;

// Create server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`
✨ Consciousness Demo Server Running! ✨

Visit: http://localhost:${PORT}

Features:
- Interactive particle system with mouse tracking
- Neural connections visualization
- Quantum Evolution Dashboard
- Responsive design

Press Ctrl+C to stop the server.
    `);
});