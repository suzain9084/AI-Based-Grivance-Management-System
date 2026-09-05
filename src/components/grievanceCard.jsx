import React from 'react';
import '../css/grievanceCard.css';


const GrievanceCard = ({grievance,setOpenDialog,setcurrGrie}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'green';
      case 'pending': return 'red';
      case 'in progress': return 'blue';
    }
  };

  const getDaysAgo = (timestampStr) => {
    const parsedDate = new Date(timestampStr);
    const now = new Date();
    const diffInMs = now - parsedDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  const handleOpenDialog = () => {
      console.log(grievance)
      setcurrGrie(grievance)
      setOpenDialog(true)
  }

  return (
    <div className="grievance-card" onClick={handleOpenDialog}>
      <div className='flex justify-between align-middle h-auto'>
        <h2 className="grievance-title">{grievance.title}</h2>
        <p className="grievance-time">{getDaysAgo(grievance.time_stamp)} days ago</p>
      </div>
      <p className="grievance-description">
        {grievance.desc}
      </p>
      <div className="grievance-tags">
        <span className="tag">{grievance.c_id}</span>
        <span className="tag" style={{ backgroundColor: getStatusColor(grievance.status)}}>{grievance.status}</span>
      </div>
    </div>
  );
};

export default GrievanceCard;

