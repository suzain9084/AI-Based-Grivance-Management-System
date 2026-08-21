from ML_Models.service.ml_service import MLService

class MLModelController:
    @staticmethod
    def speechTotext(audio_buffer,lan):
        return MLService.speechTotext(audio_buffer,lan)
    
    @staticmethod
    def language_translator(text):
        return MLService.language_translator(text)
    
    @staticmethod
    def grievance_classification(grie_desc,language):
        return MLService.grievance_classification(grie_desc,language)