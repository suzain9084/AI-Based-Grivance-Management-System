
from shared.base_client import BaseServiceClient
import os
from dotenv import load_dotenv
load_dotenv()
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL")

class MLModelClient(BaseServiceClient):
    def __init__(self, base_url=ML_SERVICE_URL):
        super().__init__(base_url)

    def speech_to_text(self, audio_buffer, lan):
        audio_buffer.seek(0)
        return self.request(
            "POST",
            "/speech-to-text",
            files={"file": ("audio.wav", audio_buffer, "audio/wav")},
            data={"lan": lan},
        )

    def committee_classification(self, grievance_description, language):
        return self.request(
            "POST",
            "/committe-classification",
            json={
                "grievance_description": grievance_description,
                "language": language,
            },
        )
