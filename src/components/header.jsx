import React from 'react'
import "../css/header.css"
import plusIcon from "/plusIcon.svg"
import { useNavigate } from 'react-router-dom'
import { userContext } from '../context/usercontext'
import { useContext } from 'react'

const Header = () => {
    const navigate = useNavigate()
    const { User, isLoggedIn } = useContext(userContext)
    return (
        <div className='header-cont'>
            <div>
                <div className='header-text'>
                    <h2>Grievance Hub</h2>
                    <p>{isLoggedIn ? (User.isAdmin ? "Admin workspace" : "Track and resolve campus issues") : "Sign in to submit and track grievances"}</p>
                </div>
                <div className='add-grievance-cont'>
                    {isLoggedIn && !User.isAdmin && (
                        <div className='add-grievance-button' onClick={() => navigate("/addGrievance")}>
                            <img src={plusIcon} alt="" />
                            <p>Add a Grievance</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header
