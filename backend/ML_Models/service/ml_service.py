import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from config.settings import GEMINI_API_KEY, init_settings

init_settings("ml_models")


class MLService:
    @staticmethod
    def speechTotext(audio_buffer, lan):
        import speech_recognition as sr

        try:
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_buffer) as source:
                audio_data = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio_data, language=lan)
                    return {"success": True, "text": text, "error": None}
                except sr.UnknownValueError:
                    return {"success": False, "text": "", "error": "Speech was unintelligible."}
                except sr.RequestError as e:
                    return {"success": False, "text": "", "error": f"API unavailable or request failed: {e}"}
        except Exception as e:
            return {"success": False, "text": "", "error": f"Failed to process audio buffer: {e}"}

    @staticmethod
    def language_translator(text):
        import google.generativeai as genai

        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            response = model.generate_content(
                f"Translate the following text into English: '{text}'. "
                "Only provide the English translation, nothing else."
            )
            return True, response.text
        except Exception as error:
            return False, error

    @staticmethod
    def grievance_classification(grie_desc, language):
        from transformers import pipeline

        try:
            classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                framework="pt",
            )
            labels = [
                "examination",
                "infrastructure",
                "general facility",
                "research facility",
                "journals/literature",
                "fellowship",
            ]
            if language != "english":
                res, text = MLService.language_translator(grie_desc)
                if res:
                    grie_desc = text

            result = classifier(grie_desc, candidate_labels=labels)
            return result["labels"][0]
        except Exception:
            return None
