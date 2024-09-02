import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './css/InboxSetup.css';

function InboxSetup() {
    const [days, setDays] = useState(7);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate(`/dashboard?days=${days}`);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Set random position and size for the particle
            const size = Math.random() * 20 + 10 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '100vh';

            document.querySelector('.background-animation').appendChild(particle);

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
        <div className="inbox-setup-page">
            <div className="background-animation"></div>
            <h2 className="title">Set Up Your Inbox View</h2>
            <p className="description">
                Select the number of days of emails you'd like to retrieve. This will determine the range of emails displayed on your dashboard.
            </p>
            <div className="input-container">
                <label htmlFor="days">Number of Days:</label>
                <input
                    type="number"
                    id="days"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    min="1"
                    max="30"
                />
            </div>
            <button className="btn primary" onClick={handleSubmit}>Continue</button>
            <button className="btn info" onClick={toggleModal}>
                <FontAwesomeIcon icon={faInfoCircle} /> How will content be displayed?
            </button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Content Display Information</h3>
                        <p>Your emails will be displayed in a chronological order, grouped by date. Unread emails will be highlighted in purple, while read emails will be shown in white. Each email will have a summary and smart reply suggestion tailored to its content which you can edit.</p>
                        <button className="btn secondary" onClick={toggleModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InboxSetup;