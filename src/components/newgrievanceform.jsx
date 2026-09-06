import React, { useState, useRef, useContext } from 'react';
import "../css/newgrievanceform.css";
import toWav from 'audiobuffer-to-wav';
import MicNoneIcon from '@mui/icons-material/MicNone';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { userContext } from '../context/usercontext';
import { useNavigate } from 'react-router-dom';
import { apiUrl, authFetch } from '../utils/api';
import { useToast } from '../context/toastcontext';
import { GuestPrompt } from './uiStates';


const NewGrievanceForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('not_assign');
  const [isloading, setIsloading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setlanguage] = useState("english")

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate()
  const audioBlobRef = useRef(null)

  const { User, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Please add a title and description", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      let formdata = new FormData()
      formdata.append('title', title)
      formdata.append("description", description)
      formdata.append('blob', audioBlobRef.current)
      formdata.append('comittee', assignedTo)
      formdata.append('u_id', User.u_id)
      formdata.append("language", language)
      let res = await authFetch(apiUrl("/api/grievances/add_grievance"), User.token, {
        method: "POST",
        body: formdata
      })
      if (res.status == 200) {
        showToast("Grievance has been added", "success")
        navigate("/")
      } else {
        showToast("There is some problem, try again after some time", "error")
      }
    } catch (error) {
      showToast(error.message || "Unable to submit grievance", "error")
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    try {
    setIsRecording(true)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      audioBlobRef.current = blob
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setIsRecording(false);

      const wavBlob = await blobToWav(blob);

      let formdata = new FormData()
      formdata.append("file", wavBlob, "audio.webm");
      formdata.append("language", language)

      setIsloading(true)
      let res = await authFetch(apiUrl("/api/grievances/speechToText"), User.token, {
        method: 'POST',
        body: formdata
      })
      if (res.status == 200) {
        res = await res.json()
        setDescription(res)
        showToast("Audio transcribed successfully", "success")
      } else {
        res = await res.json()
        showToast(res.message || "Could not transcribe audio", "error")
      }
      setIsloading(false)
    };

    recorder.start();
    setIsRecording(true);
    } catch (error) {
      setIsRecording(false);
      showToast(error.message || "Microphone access is required to record", "error");
    }
  };

  const stopRecording = () => {
    setIsRecording(false)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const blobToWav = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = toWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

    return wavBlob;
  };


  if (!isLoggedIn) {
    return (
      <div className='gri-cont-to-fit-in-page'>
        <GuestPrompt description="Sign in to submit a new grievance." />
      </div>
    );
  }

  return (
    <div className='gri-cont-to-fit-in-page'>
      <div className="grievance-container">
        <h2 className="grievance-heading">New Grievance</h2>
        <p className="grievance-subtext">
          Fill out the form below or record your grievance using the microphone
        </p>

        <form onSubmit={handleSubmit} className="grievance-form">
          <div>
            <label className="grievance-label">Title</label>
            <input
              type="text"
              className="grievance-input"
              placeholder={"Brief title of your grievance"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grievance-assignment-box">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Select Language</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={language}
                label="commty"
                onChange={(e) => { setlanguage(e.target.value) }}
                disabled={isRecording}
              >
                <MenuItem value={'english'}>English</MenuItem>
                <MenuItem value={'hindi'}>Hindi</MenuItem>
                <MenuItem value={'marathi'}>Marahti</MenuItem>
                <MenuItem value={'gujarati'}>Gujarati</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div>
            <div className="description-row">
              <div className='flex justify-between align-baseline'>
                <label className="grievance-label">Description</label>
                {isRecording ? (
                  <button
                    type="button"
                    className="record-button px-3 py-1 text-sm bg-red-500"
                    onClick={stopRecording}
                  >
                    <StopCircleIcon />   stop Rec
                  </button>
                ) : (
                  <button
                    type="button"
                    className="record-button px-3 py-1 text-sm bg-black"
                    onClick={startRecording}
                    disabled={isloading}
                  >
                    <MicNoneIcon /> start Rec
                  </button>
                )}

              </div>
              <textarea
                className="grievance-textarea"
                rows="4"
                placeholder={isloading ? "Transcribing..." : "Enter description"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isloading}
              />
              {isloading && (
                <div className="loading-overlay">
                  <div className="loader"></div>
                </div>
              )}
              {audioURL && <audio controls src={audioURL}></audio>}
            </div>
          </div>

          <div className="grievance-assignment-box">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Select Commiitee</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={assignedTo}
                label="committee"
                onChange={(e) => { setAssignedTo(e.target.value) }}
              >
                <MenuItem value={'not_assign'}>Not Assign</MenuItem>
                <MenuItem value={'examination'}>Examination</MenuItem>
                <MenuItem value={"infrastructure"}>Infrastructure</MenuItem>
                <MenuItem value={"general_facility"}>General Facility</MenuItem>
                <MenuItem value={"research_facility"}>Research Facility</MenuItem>
                <MenuItem value={"journals/literature"}>Journals/literature</MenuItem>
                <MenuItem value={"fellowship"}>Fellowship</MenuItem>
              </Select>
            </FormControl>
          </div>

          <button
            type="submit" className="submit-button"
            disabled={isSubmitting || isloading}>
            {isSubmitting ? "Submitting..." : "Submit Grievance"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewGrievanceForm;