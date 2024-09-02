import React, { useEffect } from 'react';
import './css/LandingPage.css';

function LandingPage() {
    useEffect(() => {
        // Function to generate particles
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}%`;
            document.body.appendChild(particle);

            // Remove the particle after animation ends
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        };

        // Generate particles at intervals
        const particleInterval = setInterval(createParticle, 500);

        // Cleanup on component unmount
        return () => clearInterval(particleInterval);
    }, []);

    return (
        <div className="landing-page">
            <div className="background-animation"></div>
            <h1 className="title">Welcome to AI-Powered Multimodal Inbox Manager</h1>
            <p className="description">
                Revolutionize the way you manage your emails. Summarize, categorize, and interact with your inbox like never before.
            </p>
            <div className="button-container">
                <button className="btn primary" onClick={() => window.location.href = 'http://localhost:3001/nylas/auth'}>Register with Us</button>
                <button className="btn secondary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
            </div>
        </div>
    );
}

export default LandingPage;