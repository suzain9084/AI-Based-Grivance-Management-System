from config.settings import ML_SERVICE_URL
from shared.base_client import BaseServiceClient


class MLModelClient(BaseServiceClient):
    def __init__(self):
        super().__init__(ML_SERVICE_URL)

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
