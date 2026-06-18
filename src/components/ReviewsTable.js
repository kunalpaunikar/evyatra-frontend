import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function ReviewsTable() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const fetchAllReviews = async () => {
        try {
            const res = await API.get('/admin/reviews');
            setReviews(res.data);
        } catch (err) {
            console.error('Reviews load nahi hue!', err);
        }
    };

    return (
        <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white'
            }}>
                <thead>
                    <tr style={{ backgroundColor: '#1a1a2e' }}>
                        {['User', 'Station', 'Rating', 'Comment', 'Date'].map(h => (
                            <th
                                key={h}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'white'
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {reviews.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f2f5' }}>
                            <td style={{ padding: '0.8rem 1rem' }}>{r.userName}</td>
                            <td style={{ padding: '0.8rem 1rem' }}>{r.stationName}</td>

                            <td style={{ padding: '0.8rem 1rem' }}>
                                {'★'.repeat(r.rating || 0)}
                                {'☆'.repeat(5 - (r.rating || 0))}
                            </td>

                            <td style={{ padding: '0.8rem 1rem', color: '#666' }}>
                                {r.comment || 'No comment'}
                            </td>

                            <td style={{
                                padding: '0.8rem 1rem',
                                color: '#888',
                                fontSize: '0.85rem'
                            }}>
                                {new Date(r.createdAt).toLocaleDateString('en-IN')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ReviewsTable;