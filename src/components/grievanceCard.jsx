import React from 'react';
import '../css/grievanceCard.css';


const GrievanceCard = ({grievance,setOpenDialog,setcurrGrie}) => {
  const getStatusMeta = (status) => {
    const key = String(status || '').toLowerCase();
    if (key.includes('resolve')) return { color: '#15803d', bg: '#dcfce7' };
    if (key.includes('progress')) return { color: '#1d4ed8', bg: '#dbeafe' };
    if (key.includes('pending')) return { color: '#b45309', bg: '#ffedd5' };
    return { color: '#374151', bg: '#f3f4f6' };
  };

  const getDaysAgo = (timestampStr) => {
    const parsedDate = new Date(timestampStr);
    const now = new Date();
    const diffInMs = now - parsedDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffInDays) || diffInDays < 0) return 'Recently';
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  const handleOpenDialog = () => {
      setcurrGrie(grievance)
      setOpenDialog(true)
  }

  const statusMeta = getStatusMeta(grievance.status);

  return (
    <div className="grievance-card" onClick={handleOpenDialog}>
      <div className='flex justify-between align-middle h-auto'>
        <h2 className="grievance-title">{grievance.title}</h2>
        <p className="grievance-time">{getDaysAgo(grievance.time_stamp)}</p>
      </div>
      <p className="grievance-description">
        {grievance.desc}
      </p>
      <div className="grievance-tags">
        <span className="tag">{grievance.c_id}</span>
        <span className="tag status-tag" style={{ backgroundColor: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.bg }}>{grievance.status}</span>
      </div>
    </div>
  );
};

export default GrievanceCard;
