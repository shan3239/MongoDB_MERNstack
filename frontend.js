import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [properties, setProperties] = useState([]);
    const [property, setProperty] = useState({});
    const [bookings, setBookings] = useState([]);
    const [token, setToken] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3000/properties')
            .then(response => {
                setProperties(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        const { email, password } = event.target;
        const response = await axios.post('http://localhost:3000/login', { email: email.value, password: password.value });
        setToken(response.data.token);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        const { name, email, password } = event.target;
        const response = await axios.post('http://localhost:3000/register', { name: name.value, email: email.value, password: password.value });
        console.log(response.data);
    };

    const handleBooking = async (event) => {
        event.preventDefault();
        const { propertyId, startDate, endDate } = event.target;
        const response = await axios.post('http://localhost:3000/bookings', { propertyId: propertyId.value, startDate: startDate.value, endDate: endDate.value }, {
            headers: {
                'x-auth-token': token
            }
        });
        console.log(response.data);
    };

    return (
        <div>
            <h1>House Rent App</h1>
            <form onSubmit={handleLogin}>
                <label>Email:</label>
                <input type="email" name="email" />
                <br />
                <label>Password:</label>
                <input type="password" name="password" />
                <br />
                <button type="submit">Login</button>
            </form>
            <form onSubmit={handleRegister}>
                <label>Name:</label>
                <input type="text" name="name" />
                <br />
                <label>Email:</label>
                <input type="email" name="email" />
                <br />
                <label>Password:</label>
                <input type="password" name="password" />
                <br />
                <button type="submit">Register</button>
            </form>
            <h2>Properties</h2>
            <ul>
                {properties.map((property) => (
                    <li key={property._id}>
                        <h3>{property.title}</h3>
                        <p>{property.description}</p>
                        <p>Price: {property.price}</p>
                        <p>Location: {property.location}</p>
                        <button onClick={() => setProperty(property)}>View</button>
                    </li>
                ))}
            </ul>
            {property && (
                <div>
                    <h2>Property Details</h2>
                    <p>Title: {property.title}</p>
                    <p>Description: {property.description}</p>
                    <p>Price: {property.price}</p>
                    <p>Location: {property.location}</p>
                    <form onSubmit={handleBooking}>
                        <label>Start Date:</label>
                        <input type="date" name="startDate" />
                        <br />
                        <label>End Date:</label>
                        <input type="date" name="endDate" />
                        <br />
                        <button type="submit">Book</button>
                    </form>
                </div>
            )}
            <h2>Bookings</h2>
            <ul>
                {bookings.map((booking) => (
                    <li key={booking._id}>
                        <h3>Property: {booking.propertyId}</h3>
                        <p>Start Date: {booking.startDate}</p>
                        <p>End Date: {booking.endDate}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;