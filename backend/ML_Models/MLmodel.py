import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import speech_recognition as sr
import google.generativeai as genai
from transformers import pipeline

from config.settings import GEMINI_API_KEY, init_settings

init_settings()

class MLmodelsClass:
    @staticmethod
    def speechTotext(audio_buffer,lan):
        try:
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_buffer) as source:
                audio_data = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio_data,language=lan)
                    return {"success": True, "text": text, "error": None}
                except sr.UnknownValueError:
                    return {"success": False, "text": "", "error": "Speech was unintelligible."}
                except sr.RequestError as e:
                    return {"success": False, "text": "", "error": f"API unavailable or request failed: {e}"}
        except Exception as e:
            return {"success": False, "text": "", "error": f"Failed to process audio buffer: {e}"}
        
    @staticmethod
    def language_translator(text):
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            response = model.generate_content(f"Translate the following text into English: '{text}'. Only provide the Hindi translation, nothing else.")
            return True, response.text
        except Exception as error:
            return False, error
        
    @staticmethod
    def grievance_classification(grie_desc,language):
        try:
            classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                framework="pt"
            )
            labels = ["examination", "infrastructure", "general facility","research facility","journals/literature","fellowship"]
            if language != 'english':
                res,text = MLmodelsClass.language_translator(grie_desc)
                if res:
                    grie_desc = text
                    
            result = classifier(grie_desc, candidate_labels=labels)
            return result['labels'][0]
        except: 
            return None








# print(dir(recognizer))

# with sr.AudioFile("./Humendra.wav") as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio1 = recognizer.record(source)

# with sr.AudioFile("./akasha.wav") as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio2 = recognizer.record(source)
    
# print(type(audio1))

# print(dir(sr))

# with microphone as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio = recognizer.listen(source)

# original_text = "I would like to formally raise a grievance regarding the ongoing issues I have been facing in my current environment which have started to significantly impact both my work performance and personal well being Despite multiple attempts to address these concerns informally the lack of proper response or resolution has left me with no other option but to document them through this formal complaint Firstly I have experienced repeated instances of miscommunication and lack of clarity in task delegation Often deadlines and expectations are not clearly defined which leads to confusion and ultimately results in undue pressure and blame This not only affects my confidence but also creates a stressful atmosphere where mistakes become more likely Secondly I feel that there has been a consistent lack of recognition for my efforts While I understand that praise should be earned I have gone above and beyond on several occasions without any acknowledgment whereas others are regularly recognized for similar or even lesser contributions This inequality has become deeply demotivating Additionally I have noticed an imbalance in workload distribution I am frequently assigned tasks that extend beyond my role while others in similar positions have a noticeably lighter load This has led to burnout and frustration on my end I believe in fairness open communication and mutual respect I hope that by bringing this grievance forward, steps can be taken to ensure a healthier more transparent and respectful working environment for everyone involved Thank you for taking the time to hear my concerns"




# time = datetime.datetime.now()
# converted = recognizer.recognize_sphinx(audio2)
# print("Time taken by recognize_sphinx to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# converted = recognizer.recognize_google(audio2)
# print("Time taken by recognize_google to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# converted = recognizer.recognize_faster_whisper(audio2)
# print("Time taken by recognize_faster_whisper to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# print(recognizer.recognize_wit(audio, key="55CMZLYPMVRA2H5CVOXIKX6R676M2ADV")) # multi language not support 
# print("Time taken by recognize_wit to convert Speech to Text", datetime.datetime.now() - time ,"\n\n")

# import speech_recognition as sr
# import datetime
# from jiwer import wer

# recognizer = sr.Recognizer()
# microphone = sr.Microphone()

# print(dir(recognizer))

# with sr.AudioFile("./Humendra.wav") as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio1 = recognizer.record(source)

# with sr.AudioFile("./akasha.wav") as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio2 = recognizer.record(source)
    
# print(type(audio1))



# with microphone as source:
#     recognizer.adjust_for_ambient_noise(source)
#     audio = recognizer.listen(source)



# time = datetime.datetime.now()
# converted = recognizer.recognize_sphinx(audio2)
# print("Time taken by recognize_sphinx to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# converted = recognizer.recognize_google(audio2)
# print("Time taken by recognize_google to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# converted = recognizer.recognize_faster_whisper(audio2)
# print("Time taken by recognize_faster_whisper to convert Speech to Text", datetime.datetime.now() - time)
# error = wer(original_text, converted)
# print(f"WER: {100 - error * 100:.2f}% \n\n")


# time = datetime.datetime.now()
# print(recognizer.recognize_wit(audio, key="55CMZLYPMVRA2H5CVOXIKX6R676M2ADV")) # multi language not support 
# print("Time taken by recognize_wit to convert Speech to Text", datetime.datetime.now() - time ,"\n\n")


# import os
# os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# import tensorflow as tf

# from transformers import pipeline

# original_text = "I would like to formally raise a grievance regarding the ongoing issues I have been facing in my current environment which have started to significantly impact both my work performance and personal well being Despite multiple attempts to address these concerns informally the lack of proper response or resolution has left me with no other option but to document them through this formal complaint Firstly I have experienced repeated instances of miscommunication and lack of clarity in task delegation Often deadlines and expectations are not clearly defined which leads to confusion and ultimately results in undue pressure and blame This not only affects my confidence but also creates a stressful atmosphere where mistakes become more likely Secondly I feel that there has been a consistent lack of recognition for my efforts While I understand that praise should be earned I have gone above and beyond on several occasions without any acknowledgment whereas others are regularly recognized for similar or even lesser contributions This inequality has become deeply demotivating Additionally I have noticed an imbalance in workload distribution I am frequently assigned tasks that extend beyond my role while others in similar positions have a noticeably lighter load This has led to burnout and frustration on my end I believe in fairness open communication and mutual respect I hope that by bringing this grievance forward, steps can be taken to ensure a healthier more transparent and respectful working environment for everyone involved Thank you for taking the time to hear my concerns"

# original_text = "मैं अपने वर्तमान परिवेश में चल रही समस्याओं के बारे में औपचारिक रूप से शिकायत दर्ज कराना चाहता हूं, जिसने मेरे कार्य प्रदर्शन और व्यक्तिगत कल्याण दोनों को महत्वपूर्ण रूप से प्रभावित करना शुरू कर दिया है। इन चिंताओं को अनौपचारिक रूप से संबोधित करने के कई प्रयासों के बावजूद उचित प्रतिक्रिया या समाधान की कमी ने मुझे उन्हें इस औपचारिक शिकायत के माध्यम से दर्ज करने के अलावा कोई अन्य विकल्प नहीं छोड़ा है। सबसे पहले, मैंने कार्य सौंपने में गलतफहमी और स्पष्टता की कमी के बार-बार उदाहरणों का अनुभव किया है। अक्सर समय सीमा और अपेक्षाएं स्पष्ट रूप से परिभाषित नहीं होती हैं, जिससे भ्रम होता है और अंततः अनुचित दबाव और दोषारोपण होता है। इससे न केवल मेरा आत्मविश्वास प्रभावित होता है, बल्कि तनावपूर्ण माहौल भी बनता है, जहां गलतियां होने की संभावना अधिक होती है। दूसरी बात, मुझे लगता है कि मेरे प्रयासों को लगातार मान्यता नहीं मिली है। जबकि मैं समझता हूं कि प्रशंसा अर्जित की जानी चाहिए, मैंने कई अवसरों पर बिना किसी स्वीकृति के अपनी क्षमता से अधिक काम किया है, जबकि दूसरों को समान या उससे भी कम योगदान के लिए नियमित रूप से मान्यता दी जाती है। यह असमानता बहुत अधिक हतोत्साहित करने वाली हो गई आगे, इसमें शामिल सभी लोगों के लिए अधिक स्वस्थ, अधिक पारदर्शी और सम्मानजनक कार्य वातावरण सुनिश्चित करने के लिए कदम उठाए जा सकते हैं। मेरी चिंताओं को सुनने के लिए समय निकालने के लिए धन्यवाद।"


# examination = "The recent semester exams had multiple scheduling conflicts. Two of my core subjects were scheduled on the same day, and I was not given any alternative arrangement despite informing the administration in advance."

# infrastructure = "Many classrooms in our block have broken chairs, non-functional fans, and poor lighting. It's very hard to focus during lectures, especially in the afternoon due to the heat and lack of ventilation."

# general_facility =  "The campus canteen lacks basic hygiene standards. The tables are usually dirty, and the food is often served cold or stale, which has led to stomach issues for several students."

# research_facility = "As a final year student working on my research project, I have not been given proper access to laboratory equipment. Many of the required tools are outdated or non-functional, and there’s a long waiting period to get even basic resources."

# literature = "The library does not have access to updated journals or recent editions of key textbooks. Online journal subscriptions are limited, making it hard to conduct literature reviews for academic writing."

# fellowship = "I was promised a fellowship for academic excellence, but despite completing all documentation, the disbursement is delayed for over three months without any proper update or support from the concerned department."


# examination = "हाल ही में हुए सेमेस्टर परीक्षाओं में कई समय-सारणी संघर्ष थे। मेरी दो मुख्य विषयों की परीक्षाएं एक ही दिन निर्धारित कर दी गईं, और प्रशासन को पहले से सूचित करने के बावजूद मुझे कोई वैकल्पिक व्यवस्था नहीं दी गई।"

# infrastructure = "हमारे ब्लॉक की कई कक्षाओं में कुर्सियाँ टूटी हुई हैं, पंखे काम नहीं करते और रोशनी भी बहुत खराब है। खासकर दोपहर के समय गर्मी और वेंटिलेशन की कमी के कारण पढ़ाई पर ध्यान केंद्रित करना मुश्किल हो जाता है।"

# general_facility = "कैंपस की कैंटीन में बुनियादी स्वच्छता की बहुत कमी है। टेबल अक्सर गंदे होते हैं, और खाना ठंडा या बासी परोसा जाता है, जिससे कई छात्रों को पेट की समस्याएं हो चुकी हैं।"

# research_facility = "मैं अंतिम वर्ष का छात्र हूँ और अपने रिसर्च प्रोजेक्ट पर काम कर रहा हूँ, लेकिन मुझे प्रयोगशाला के उपकरणों तक सही ढंग से पहुँच नहीं दी गई है। ज़रूरी उपकरण या तो पुराने हैं या फिर खराब हैं, और सामान्य संसाधनों के लिए भी बहुत लंबा इंतजार करना पड़ता है।"

# literature = "पुस्तकालय में अद्यतन जर्नल्स या प्रमुख पाठ्यपुस्तकों के हालिया संस्करण उपलब्ध नहीं हैं। ऑनलाइन जर्नल सब्सक्रिप्शन भी सीमित हैं, जिससे अकादमिक लेखन के लिए साहित्य समीक्षा करना मुश्किल हो जाता है।"

# fellowship = "मुझे शैक्षणिक उत्कृष्टता के लिए एक छात्रवृत्ति का वादा किया गया था, लेकिन सभी दस्तावेज़ पूरे करने के बावजूद तीन महीने से अधिक समय हो गया है और अभी तक राशि नहीं मिली है, न ही संबंधित विभाग से कोई जानकारी दी गई है।"


# classifier = pipeline(
#     "zero-shot-classification",
#     model="facebook/bart-large-mnli",
#     framework="pt" 
# )

# classifier = pipeline("zero-shot-classification",model="joeddav/xlm-roberta-large-xnli")


# labels = ["Examination", "infrastructure", "General Facility","Research Facility","Journals/Literature","Fellowship"]


# result = classifier(examination, candidate_labels=labels)
# print(result)

# result = classifier(infrastructure, candidate_labels=labels)
# print(result['labels'][0])

# result = classifier(general_facility, candidate_labels=labels)
# print(result['labels'][0])

# result = classifier(research_facility, candidate_labels=labels)
# print(result['labels'][0])

# result = classifier(literature, candidate_labels=labels)
# print(result['labels'][0])

# result = classifier(fellowship, candidate_labels=labels)
# print(result['labels'][0])

# print(result)


# from transformers import pipeline, AutoModelForSequenceClassification, XLMRobertaTokenizer
# import pandas as pd

# model_name = "joeddav/xlm-roberta-large-xnli"

# pipe = pipeline(
#     "zero-shot-classification",
#     model=model_name,
#     tokenizer=XLMRobertaTokenizer.from_pretrained(model_name)
# )

# data = pd.read_csv("C:/Users/HP/OneDrive/Desktop/jupyter/grievance_classification.csv")

# result = pipe(examination, candidate_labels=labels)
# print(result['labels'][0])

# result = pipe(infrastructure, candidate_labels=labels)
# print(result['labels'][0])

# result = pipe(general_facility, candidate_labels=labels)
# print(result['labels'][0])

# result = pipe(fellowship, candidate_labels=labels)
# print(result['labels'][0])

# result = pipe(literature, candidate_labels=labels)
# print(result['labels'][0])

# result = pipe(research_facility, candidate_labels=labels)
# print(result['labels'][0])

# print(data)

# print(type(data['text']))
# for text in data['text']:
#     print(text)

# outputs = []
# for text in data['text']:
#     result = pipe( text, candidate_labels=labels)
#     outputs.append(result['labels'][0])

# count = 0
# for i,clas in enumerate(data['true_label']):
#     if outputs[i].lower() != clas.lower():
#         count += 1

# print(count)


