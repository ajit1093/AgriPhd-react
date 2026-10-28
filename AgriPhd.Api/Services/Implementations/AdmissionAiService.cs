using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using AgriPhd.Api.DTOs.Ai;
using AgriPhd.Api.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgriPhd.Api.Services.Implementations;

public class AdmissionAiService : IAdmissionAiService
{
    private readonly IConfiguration _config;
    private readonly ILogger<AdmissionAiService> _logger;
    private readonly HttpClient _httpClient;

    public AdmissionAiService(IConfiguration config, ILogger<AdmissionAiService> logger, HttpClient httpClient)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<AdmissionChatResponse> AnswerAsync(AdmissionChatRequest request, CancellationToken cancellationToken = default)
    {
        string rawMsg = (request.Message ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(rawMsg))
        {
            return new AdmissionChatResponse
            {
                Reply = "नमस्कार! मी MCAER Ph.D. प्रवेश सहाय्यक आहे. मी तुम्हाला पात्रता, आवश्यक कागदपत्रे, विद्यापीठे आणि प्रवेश प्रक्रियेबद्दल मदत करू शकतो. Hello! How can I assist you with Maharashtra Agriculture Ph.D. Admissions?",
                Language = "mr",
                Suggestions = new List<string> { "पात्रता निकष काय आहेत?", "आवश्यक कागदपत्रांची यादी", "4 कृषी विद्यापीठांची माहिती", "Merit List & Marks Calculation" }
            };
        }

        bool isMarathi = DetectMarathi(rawMsg) || request.Language == "mr";

        // 1. Try Gemini API if an API key is configured
        string? apiKey = _config["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var geminiReply = await CallGeminiAsync(apiKey, rawMsg, request.History, isMarathi, cancellationToken);
                if (!string.IsNullOrWhiteSpace(geminiReply))
                {
                    return new AdmissionChatResponse
                    {
                        Reply = geminiReply,
                        Language = isMarathi ? "mr" : "en",
                        Suggestions = GetSuggestions(rawMsg, isMarathi)
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API call failed, falling back to built-in MCAER RAG engine.");
            }
        }

        // 2. High-precision built-in MCAER Agricultural Admissions Knowledge Engine
        var knowledgeReply = GenerateKnowledgeReply(rawMsg, isMarathi);
        return knowledgeReply;
    }

    private static bool DetectMarathi(string text)
    {
        // Devanagari Unicode range: \u0900-\u097F
        return Regex.IsMatch(text, @"[\u0900-\u097F]");
    }

    private AdmissionChatResponse GenerateKnowledgeReply(string msg, bool isMarathi)
    {
        string lower = msg.ToLowerInvariant();

        // 1. Eligibility (पात्रता)
        if (lower.Contains("eligib") || lower.Contains("पात्रता") || lower.Contains("qualification") || lower.Contains("cgpa") || lower.Contains("टक्के") || lower.Contains("marks"))
        {
            if (isMarathi)
            {
                return new AdmissionChatResponse
                {
                    Language = "mr",
                    Reply = "🎓 **Ph.D. (कृषी) प्रवेश २०२६-२७ पात्रता निकष:**\n\n" +
                            "१. **पदव्युत्तर पदवी (M.Sc.):** संबंधित कृषी विषयात मान्यताप्राप्त कृषी विद्यापीठातून किमान **६.५/१०.० CGPA** (किंवा ६५% गुण).\n" +
                            "२. **राखीव प्रवर्ग सवलत:** SC, ST, PwD उमेदवारांसाठी किमान **६.०/१०.० CGPA** आवश्यक आहे.\n" +
                            "३. **प्रवेश परीक्षा / मेरिट:** पदव्युत्तर पदवीच्या गुणांवर आधारित केंद्रीभूत गुणवत्ता यादी (CAP) तयार केली जाते.\n" +
                            "४. **संशोधन प्रबंध (Thesis):** M.Sc. स्तरावर पूर्ण केलेला असावा.",
                    Suggestions = new List<string> { "गुणदान पद्धत (Merit Scoring) काय आहे?", "आवश्यक कागदपत्रांची यादी द्या", "कृषी विद्यापीठे कोणती आहेत?" }
                };
            }
            return new AdmissionChatResponse
            {
                Language = "en",
                Reply = "🎓 **Ph.D. Agriculture Admissions 2026-27 Eligibility Criteria:**\n\n" +
                        "1. **Master's Degree (M.Sc.):** Candidate must have passed M.Sc. in relevant agricultural discipline with minimum **6.50 / 10.00 CGPA** (or equivalent 65%).\n" +
                        "2. **Reserved Category Relaxation:** Candidates belonging to SC / ST / PwD require minimum **6.00 / 10.00 CGPA**.\n" +
                        "3. **Degree Recognition:** Degree must be from an ICAR-accredited or State Agricultural University (SAU).\n" +
                        "4. **Thesis Completion:** M.Sc. research dissertation/thesis must be completed before admission.",
                Suggestions = new List<string> { "How is merit calculated?", "Which documents are required?", "List of participating universities" }
            };
        }

        // 2. Documents required (कागदपत्रे / प्रमाणपत्रे)
        if (lower.Contains("document") || lower.Contains("कागदपत्र") || lower.Contains("certificate") || lower.Contains("प्रमाणपत्र") || lower.Contains("ncl") || lower.Contains("caste"))
        {
            if (isMarathi)
            {
                return new AdmissionChatResponse
                {
                    Language = "mr",
                    Reply = "📑 **ई-पडताळणी (E-Scrutiny) साठी आवश्यक कागदपत्रे:**\n\n" +
                            "१. **अधिवास प्रमाणपत्र (Domicile Certificate):** महाराष्ट्र राज्याचा रहिवासी असल्याचा पुरावा.\n" +
                            "२. **पदवी व पदव्युत्तर गुणपत्रिका (B.Sc. & M.Sc. Marksheets & PDC/Degree).**\n" +
                            "३. **जात प्रमाणपत्र (Caste Certificate):** राखीव प्रवर्गातील उमेदवारांसाठी.\n" +
                            "४. **जात वैधता प्रमाणपत्र (Caste Validity Certificate):** ST, SC, VJ/DT, NT, OBC, SBC साठी अनिवार्य.\n" +
                            "५. **नॉन-क्रीमी लेअर (NCL):** OBC, SBC, VJ/NT साठी **३१ मार्च २०२७** पर्यंत वैध असलेले NCL आवश्यक.\n" +
                            "६. **EWS प्रमाणपत्र:** सक्षम अधिकाऱ्याने दिलेले चालू वर्षाचे वैध प्रमाणपत्र.\n" +
                            "७. **शेतकरी दाखला (७/१२ उतारा):** अतिरिक्त वेटेजसाठी (लागू असल्यास).\n" +
                            "८. **संशोधन निबंध (Research Papers):** NAAS / UGC-CARE नामांकित जर्नल्समधील प्रत.",
                    Suggestions = new List<string> { "NCL ची अंतिम मुदत काय आहे?", "E-Verification कसे होते?", "Research Paper चे वेटेज किती?" }
                };
            }
            return new AdmissionChatResponse
            {
                Language = "en",
                Reply = "📑 **Mandatory Documents for Ph.D. Online E-Scrutiny:**\n\n" +
                        "1. **Domicile Certificate / Birth Certificate** of Maharashtra State.\n" +
                        "2. **Bachelor's & Master's Marksheets, PDC and Degree Certificates** (B.Sc. & M.Sc.).\n" +
                        "3. **Caste Certificate** (for SC, ST, VJ/DT, NT, OBC, SBC categories).\n" +
                        "4. **Caste Validity Certificate** issued by the competent Scrutiny Committee.\n" +
                        "5. **Non-Creamy Layer (NCL) Certificate** valid up to **31st March 2027** (mandatory for OBC/SBC/NT).\n" +
                        "6. **EWS Eligibility Certificate** for current financial year (if applicable).\n" +
                        "7. **Agriculturist Certificate (7/12 extract)** for additional weightage.\n" +
                        "8. **Published Research Papers** with official NAAS rating / DOI.",
                Suggestions = new List<string> { "What is the NCL validity cutoff?", "How does E-Verification work?", "How are research papers scored?" }
            };
        }

        // 3. Universities (विद्यापीठे)
        if (lower.Contains("universit") || lower.Contains("विद्यापीठ") || lower.Contains("college") || lower.Contains("mpkv") || lower.Contains("pdkv") || lower.Contains("vnmkv") || lower.Contains("bskkv") || lower.Contains("ahilyanagar") || lower.Contains("ahmednagar") || lower.Contains("sambhaji") || lower.Contains("aurangabad"))
        {
            if (isMarathi)
            {
                return new AdmissionChatResponse
                {
                    Language = "mr",
                    Reply = "🏛️ **महाराष्ट्रातील ४ राज्य कृषी विद्यापीठे (SAUs):**\n\n" +
                            "१. **महात्मा फुले कृषी विद्यापीठ (MPKV), राहुरी** (जि. अहिल्यानगर) - पश्चिम महाराष्ट्र अधिकारक्षेत्र.\n" +
                            "२. **डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (Dr. PDKV), अकोला** - विदर्भ विभाग अधिकारक्षेत्र.\n" +
                            "३. **वसंतराव नाईक मराठवाडा कृषी विद्यापीठ (VNMKV), परभणी** (छत्रपती संभाजीनगर / मराठवाडा विभाग अधिकारक्षेत्र).\n" +
                            "४. **डॉ. बाळासाहेब सावंत कोकण कृषी विद्यापीठ (Dr. BSKKV), दापोली** (जि. रत्नागिरी) - कोकण विभाग अधिकारक्षेत्र.\n\n" +
                            "सर्व विद्यापीठे **महाराष्ट्र कृषी शिक्षण व संशोधन परिषद (MCAER), पुणे** अंतर्गत संचालित आहेत.",
                    Suggestions = new List<string> { "विद्यापीठनिहाय विषय व जागा कशा पाहाव्यात?", "Option Form कसे भरावे?", "Spot Round कधी असतो?" }
                };
            }
            return new AdmissionChatResponse
            {
                Language = "en",
                Reply = "🏛️ **Participating State Agricultural Universities (SAUs):**\n\n" +
                        "1. **Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri** (Dist. Ahilyanagar) - Western Maharashtra Jurisdiction.\n" +
                        "2. **Dr. Panjabrao Deshmukh Krishi Vidyapeeth (Dr. PDKV), Akola** - Vidarbha Jurisdiction.\n" +
                        "3. **Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV), Parbhani** (Chh. Sambhaji Nagar / Marathwada Jurisdiction).\n" +
                        "4. **Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (Dr. BSKKV), Dapoli** (Dist. Ratnagiri) - Konkan Jurisdiction.\n\n" +
                        "All admissions are centrally administered by the **Maharashtra Council of Agriculture Education and Research (MCAER), Pune**.",
                Suggestions = new List<string> { "How to check subject-wise vacancies?", "How to shortlist university options?", "When is the Spot Round?" }
            };
        }

        // 4. Merit calculation & Weightage (गुणदान / वेटेज)
        if (lower.Contains("merit") || lower.Contains("वेटेज") || lower.Contains("weightage") || lower.Contains("score") || lower.Contains("paper") || lower.Contains("research"))
        {
            if (isMarathi)
            {
                return new AdmissionChatResponse
                {
                    Language = "mr",
                    Reply = "📊 **Ph.D. गुणवत्ता यादी (Merit Score) गुणदान सूत्र:**\n\n" +
                            "• **M.Sc. पदव्युत्तर CGPA:** ७०% वेटेज (मुख्य पाया)\n" +
                            "• **B.Sc. पदवी गुण:** १०% वेटेज\n" +
                            "• **संशोधन निबंध (Research Papers):** जास्तीत जास्त १० गुण (NAAS रेटेड जर्नल्समध्ये प्रथम/सह-लेखक).\n" +
                            "• **अतिरिक्त वेटेज (शेतकरी पुत्र / क्रीडा / सुवर्णपदक):** नियमानुसार कमाल १० गुण.\n\n" +
                            "समसमान गुण झाल्यास (Tie-Breaking Rule): M.Sc. CGPA ➔ B.Sc. CGPA ➔ ज्येष्ठ उमेदवारास प्रथम प्राधान्य दिले जाते.",
                    Suggestions = new List<string> { "Research Paper चे गुण कसे मोजतात?", "पात्रता निकष काय आहेत?", "Provisional Merit List कधी येणार?" }
                };
            }
            return new AdmissionChatResponse
            {
                Language = "en",
                Reply = "📊 **Ph.D. Admission Merit Score Calculation Formula:**\n\n" +
                        "• **M.Sc. Post-Graduate CGPA:** 70% Weightage (Primary component)\n" +
                        "• **B.Sc. Degree Performance:** 10% Weightage\n" +
                        "• **Research Publications:** Up to 10 Marks (Papers in NAAS / UGC-CARE indexed journals).\n" +
                        "• **Special Weightages (Agriculturist / Medals / Sports):** Up to 10 Marks as per MCAER rules.\n\n" +
                        "**Tie-Breaking Priority:** Higher M.Sc. CGPA ➔ Higher B.Sc. CGPA ➔ Older candidate by date of birth.",
                Suggestions = new List<string> { "How are research paper points calculated?", "What are the eligibility criteria?", "When is Provisional Merit List released?" }
            };
        }

        // 5. Helpline & Contact (हेल्पलाईन / संपर्क)
        if (lower.Contains("help") || lower.Contains("contact") || lower.Contains("phone") || lower.Contains("नंबर") || lower.Contains("संपर्क") || lower.Contains("email"))
        {
            if (isMarathi)
            {
                return new AdmissionChatResponse
                {
                    Language = "mr",
                    Reply = "📞 **अधिकृत MCAER Ph.D. प्रवेश मदत केंद्र (Helpline):**\n\n" +
                            "• **हेल्पलाईन क्रमांक:** **8806612998**\n" +
                            "• **वेळ:** सकाळी १०:०० ते संध्याकाळी ०६:०० (कामाच्या दिवशी)\n" +
                            "• **ईमेल:** `mcaer.admission@gmail.com`\n" +
                            "• **पत्ता:** महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, १३२-ब, भांबुर्डा, भोसले नगर, पुणे - ४११ ००७.",
                    Suggestions = new List<string> { "आवश्यक कागदपत्रांची यादी", "प्रवेश अर्ज कसा भरावा?", "विद्यापीठांची माहिती" }
                };
            }
            return new AdmissionChatResponse
            {
                Language = "en",
                Reply = "📞 **Official MCAER Ph.D. Admission Helpdesk & Contact:**\n\n" +
                        "• **Helpline Number:** **8806612998**\n" +
                        "• **Working Hours:** 10:00 AM to 06:00 PM (Monday to Saturday on working days)\n" +
                        "• **Official Email:** `mcaer.admission@gmail.com`\n" +
                        "• **Address:** Maharashtra Council of Agriculture Education and Research, 132-B, Bhamburda, Bhosale Nagar, Pune - 411 007.",
                Suggestions = new List<string> { "List of required documents", "How to fill application form?", "Participating universities" }
            };
        }

        // Default response
        if (isMarathi)
        {
            return new AdmissionChatResponse
            {
                Language = "mr",
                Reply = $"मी तुमच्या '{msg}' बद्दल मदत करू शकतो. महाराष्ट्र कृषी विद्यापीठे Ph.D. प्रवेश २०२६-२७ अंतर्गत पात्रता, आवश्यक कागदपत्रे, गुणवत्ता यादी, विद्यापीठे (MPKV, PDKV, VNMKV, BSKKV) आणि अर्ज प्रक्रियेबद्दल तुम्ही मला कोणताही प्रश्न विचारू शकता.",
                Suggestions = new List<string> { "पात्रता निकष काय आहेत?", "आवश्यक कागदपत्रांची यादी", "४ कृषी विद्यापीठे", "हेल्पलाईन क्रमांक काय आहे?" }
            };
        }

        return new AdmissionChatResponse
        {
            Language = "en",
            Reply = $"I can assist you regarding '{msg}'. You can ask me anything about Maharashtra Agriculture Ph.D. Admissions 2026-27: Eligibility criteria, required documents for E-Scrutiny, participating universities (MPKV, PDKV, VNMKV, BSKKV), merit calculation, or CAP schedule.",
            Suggestions = new List<string> { "What are the eligibility criteria?", "List of mandatory documents", "Participating universities", "Admission helpline numbers" }
        };
    }

    private static List<string> GetSuggestions(string msg, bool isMarathi)
    {
        if (isMarathi)
        {
            return new List<string> { "पात्रता निकष काय आहेत?", "आवश्यक कागदपत्रांची यादी", "गुणदान पद्धत (Merit Scoring)" };
        }
        return new List<string> { "What are the eligibility criteria?", "Required documents list", "How is merit calculated?" };
    }

    private async Task<string?> CallGeminiAsync(string apiKey, string userPrompt, List<ChatMessageItem>? history, bool isMarathi, CancellationToken ct)
    {
        string systemInstruction = @"You are the official AI Admission Assistant for the Maharashtra Council of Agriculture Education and Research (MCAER) Ph.D. Centralized Admissions 2026-27.
The 4 participating State Agricultural Universities are:
1. MPKV Rahuri
2. Dr. PDKV Akola
3. VNMKV Parbhani
4. Dr. BSKKV Dapoli
Provide accurate, professional, encouraging answers based on official Maharashtra Ph.D. admission rules. If the user asks in Marathi, respond fluently in polite Marathi (मराठी). If in English, respond in English. Always format with clean markdown bullet points.";

        var contents = new List<object>();

        if (history != null)
        {
            foreach (var item in history.TakeLast(6))
            {
                contents.Add(new
                {
                    role = item.Role == "user" ? "user" : "model",
                    parts = new[] { new { text = item.Content } }
                });
            }
        }

        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = userPrompt } }
        });

        var payload = new
        {
            system_instruction = new { parts = new[] { new { text = systemInstruction } } },
            contents,
            generationConfig = new
            {
                temperature = 0.4,
                maxOutputTokens = 800
            }
        };

        string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
        using var response = await _httpClient.PostAsJsonAsync(endpoint, payload, ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Gemini API returned status {StatusCode}", response.StatusCode);
            return null;
        }

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var candidates = doc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() > 0)
        {
            var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return text;
        }

        return null;
    }
}
