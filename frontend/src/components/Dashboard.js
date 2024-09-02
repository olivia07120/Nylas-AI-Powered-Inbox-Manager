import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './css/Dashboard.css';
import DOMPurify from 'dompurify'; // For sanitizing HTML content

function Dashboard() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const days = searchParams.get('days') || 7; // Default to 7 days if not specified
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [smartReply, setSmartReply] = useState('');

    useEffect(() => {
        fetchEmails();
    }, [days]);

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/emails?days=${days}`);
            if (!response.ok) {
                throw new Error('Failed to fetch emails');
            }
            const data = await response.json();
            setEmails(data);
        } catch (error) {
            console.error('Error fetching emails:', error);
            setError('Unable to load emails at the moment. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const groupedEmails = emails.reduce((groups, email) => {
        const date = new Date(email.date * 1000).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(email);
        return groups;
    }, {});

    const handleSmartReplyClick = (email) => {
        setSelectedEmail(email);
        setSmartReply(email.sampleReply || ''); // Set smart reply from email data
        setShowModal(true);
    };

    const handleSendSmartReply = async () => {
        try {
            const response = await fetch('http://localhost:3001/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: selectedEmail.from[0].email,
                    subject: `Re: ${selectedEmail.subject}`,
                    body: smartReply,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            setShowModal(false);
            alert('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again later.');
        }
    };

    return (
        <div className="dashboard-page">
            <h1>Your Emails</h1>
            {loading ? (
                <div>
                    <div className="loading-spinner"></div>
                    <p className="loading-message">Loading emails, please wait...</p>
                </div>
            ) : error ? (
                <p className="loading-message">{error}</p>
            ) : Object.keys(groupedEmails).length === 0 ? (
                <p className="loading-message">No emails found for the specified period.</p>
            ) : (
                Object.entries(groupedEmails).map(([date, emails]) => (
                    <div key={date} className="email-group">
                        <h2 className="date-heading">{date}</h2>
                        <div className="emails-by-date">
                            {emails.map((email, index) => (
                                <div
                                    key={index}
                                    className={`email-tile ${email.unread ? 'unread' : 'read'}`}
                                >
                                    <div
                                        className={`email-category ${
                                            email.unread ? 'unread' : 'read'
                                        }`}
                                    >
                                        {email.category}
                                    </div>
                                    <div
                                        className={`email-action ${email.unread ? 'unread' : 'read'} ${
                                            email.action.toLowerCase()
                                        }`}
                                    >
                                        Recommended Action: Reply
                                    </div>
                                    <div className="email-header">
                                        <h2>{email.subject}</h2>
                                    </div>
                                    <p className="email-summary">{email.summary}</p>
                                    <div className="email-actions">
                                        <button
                                            className={`smart-reply-btn ${
                                                email.unread ? 'unread' : 'read'
                                            }`}
                                            onClick={() => handleSmartReplyClick(email)}
                                        >
                                            Smart Reply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {showModal && selectedEmail && (
                <div className="modal">
                    <div className="modal-content">
                        <h4>{selectedEmail.subject}</h4>
                        <p className="email-from">From: {selectedEmail.from.map((sender) => sender.email).join(', ')}</p>
                        <div
                            className="email-body"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(selectedEmail.body),
                            }}
                        />
                        <div className="sample-reply">
                            <h4>Sample Reply</h4>
                            <textarea
                                value={smartReply}
                                onChange={(e) => setSmartReply(e.target.value)}
                                rows="4"
                                style={{ width: '100%', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                            <button
                                className="send-btn"
                                onClick={handleSendSmartReply}
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;