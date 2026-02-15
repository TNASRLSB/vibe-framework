## 📊 SINTESI DEI RISULTATI CHIAVE

### 1. **EFFICACIA NELLA VENDITA E PERSUASIONE**

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Prendergast et al.** | 2014 | Percepita credibilità: **uomini più efficaci in vendita** per clienti a rischio percepito elevato. Le donne preferiscono consigli da uomini in contesti di rischio finanziario  |
| **Zoghaib** | 2019 | Caratteristiche vocali (pitch, brightness, roughness) hanno effetto **più forte del genere** stesso. Il genere diventa ridondante quando le caratteristiche vocali sono controllate  |
| **Du et al.** | 2022 | Voice shopping: **voce maschile controllata** (pitch moderato) ha le **migliori performance di vendita**, ma voce maschile estrema performa peggio  |
| **Burgers et al.** | 2000 | Call center: preferenza per operatore dello **stesso genere** del cliente  |

**Conclusione**: Non c'è un "vincitore assoluto". L'efficacia dipende dal contesto e dal pitch specifico, non solo dal genere binario.

---

### 2. **CREDIBILITÀ E FIDUCIA**

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Schirmer et al.** | 2019 | Voce **basso pitch femminile** e **alto pitch maschile** sono preferite per fiducia. Effetto "crossover" per genere  |
| **Schild et al.** | 2020 | Voci **alto pitch** (sia M che F) sono percepite come **più affidabili** nel trust game economico. Contraddice stereotipo "voce grave = affidabile"  |
| **Lee & Nass** | 2004 | Multiple voci sintetiche aumentano persuasione indipendentemente dal genere  |

**Conclusione**: Il **pitch specifico** batte il genere categorico. Voci medio-alte sono generalmente più persuasive.

---

### 3. **PREFERENZA UTENTE E ASSISTENTI VOCALI**

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Jia et al.** | 2025 | AI customer service: voce **femminile coquettish** (lusinghiera) ha persuasione paragonabile a voce severa. Sfida stereotipi di genere nel servizio clienti  |
| **Dou et al.** | 2022 | Robot sociali: voce **femminile** preferita per **warmth**, voce **maschile** per **competenza**  |
| **Sanjeed et al.** | 2020 | Banking chatbot: nome **maschile** aumenta significativamente soddisfazione cliente nel contesto finanziario  |
| **Fratangelo** | 2025 | Autonomia percepita più bassa con assistenti vocali **maschili**  |

**Conclusione**: Esiste una chiara **dimensionalità** — voci femminili = calore/empatia, voci maschili = competenza/autorità.

---

### 4. **STEREOTIPI DI GENERE E TONO**

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Polin et al.** | 2024 | Scuse: voce allineata a stereotipi **femminili** (warmth/comunality) più efficace  |
| **Tu et al.** | 2025 | AI teammates: stereotipi di genere proiettati su AI — maschile = competente ma freddo  |
| **Eagly et al.** | 1991 | Meta-analisi: attrattività fisica correlata a percezione competenza sociale  |

---

### 5. **TONO E PITCH SPECIFICI**

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Motoki et al.** | 2019 | Corrispondenza cross-modale: **pitch basso** = gusto dolce/amabile in advertising  |
| **Rodero** | 2022 | Pitch e gesti: **pitch medio** ottimale per percezione competenza e piacevolezza  |
| **Van Zant & Berger** | 2020 | Persuasione attraverso variazioni di voce: speaker modulano pitch per persuadere efficacemente  |
| **Pisanski et al.** | 2018 | **Pitch modulation** (variabilità) più importante di pitch assoluto nel mate choice  |

---

## 🎯 RISPOSTA ALLA TUA DOMANDA

### **Chi è più efficace?**

La ricerca mostra che **non esiste una superiorità assoluta** di un genere sull'altro. Ecco i pattern:

| Contesto | Voce più efficace | Perché |
|----------|-------------------|--------|
| **Vendita rischio/alta stake** | Maschile | Percepita maggiore credibilità e competenza |
| **Servizio clienti/supporto** | Femminile | Percepita maggiore empatia e warmth |
| **Tech demo/formazione** | Maschile | Autorità tecnica, competenza |
| **Contenuti emotivi/narrativi** | Femminile | Connessione emotiva |
| **Banking/finanziario** | Maschile | Trust in contesti di rischio |

### **Differenza di ricezione?**

Sì, esistono differenze misurabili:

1. **Dimensione Competenza vs Warmth**: 
   - Maschile → Competenza, Autorità, Dominanza
   - Femminile → Warmth, Empatia, Affidabilità emotiva

2. **Pitch > Genere**: 
   - Un uomo con voce acuta è percepito simile a una donna
   - Una donna con voce grave è percepita come più autorevole

3. **Congruenza di genere**: 
   - Clienti preferiscono operatori dello stesso genere
   - Ma: voce maschile è più "sicura" in contesti di incertezza

---

## 💡 IMPLICAZIONI PRATICHE PER ELEVENLABS

Basandomi su questa ricerca, ecco raccomandazioni per il tuning dei preset:

| Preset | Voce consigliata | Parametri ottimali | Evidenza |
|--------|------------------|-------------------|----------|
| **Enthusiastic** | Femminile medio-alto | Pitch 180-220Hz, variazione dinamica | Warmth + engagement  |
| **Neutral** | Maschile medio | Pitch 120-150Hz, stabilità alta | Competenza percepita  |
| **Calm** | Femminile basso | Pitch 160-180Hz, velocità ridotta | Empatia, riduzione ansia  |
| **Dramatic** | Maschile grave | Pitch 100-130Hz, stile elevato | Autorità, impatto emotivo  |
| **Educational** | Maschile medio | Pitch 130-160Hz, chiarezza alta | Credibilità contenuto tecnico  |

---

## 📚 RIFERIMENTI COMPLETI

: Prendergast, G. P., Li, S. S., & Li, C. (2014). Consumer perceptions of salesperson gender and credibility. *Journal of Consumer Marketing*.
: Zoghaib, A. (2019). Persuasion of voices: The effects of a speaker's voice characteristics and gender on consumers' responses. *Recherche et Applications en Marketing*.
: Du, P., Wang, Y., Tong, Q., et al. (2022). Intelligent Voice Agent: The Impact of Vocal Pitch on Customer Purchase Behavior in Voice Shopping. *IEEE International Conference*.
: Burgers, A., de Ruyter, K., Keen, C., et al. (2000). Customer expectation dimensions of voice-to-voice service encounters. *International Journal of Service Industry Management*.
: Schirmer, A., Feng, Y., Sen, A., & Penney, T. B. (2019). Angry, old, male–and trustworthy? *PloS One*.
: Schild, C., Stern, J., & Zettler, I. (2020). Linking men's voice pitch to actual and perceived trustworthiness across domains. *Behavioral Ecology*.
: Lee, K. M., & Nass, C. (2004). The multiple source effect and synthesized speech. *Human Communication Research*.
: Jia, L., Hu, X., Yu, Y., & Liang, H. (2025). AI Voice Matters: AI's Pragmatics and Sociophonetics in Persuasion. *SSRN*.
: Dou, X., Wu, C. F., Niu, J., & Pan, K. R. (2022). Effect of voice type and head-light color in social robots. *International Journal of Social Robotics*.
: Sanjeed, V. K., Kim, M. G., & Wang, C. Y. (2020). Examining the effect of chatbot gender and gender congruence. *Journal of Service Management*.
: Fratangelo, O. (2025). Examining Portrayals of Gender in the Design of AI Voice Assistants. *CUNY Academic Works*.
: Polin, B., Doyle, S. P., Kim, S., & Lewicki, R. J. (2024). Sorry to ask but… how is apology effectiveness dependent on apology content and gender? *Journal of Applied Psychology*.
: Tu, Y., Li, J., Chen, J., Li, C. J., & He, W. (2025). When AI Becomes My Teammate: Unpacking How Employees Perceive and Collaborate With Gendered AI Teammates. *Journal of Organizational Behavior*.
: Eagly, A. H., Ashmore, R. D., Makhijani, M. G., & Longo, L. C. (1991). What is beautiful is good. *Psychological Bulletin*.
: Motoki, K., Saito, T., Nouchi, R., Kawashima, R., & Sugiura, M. (2019). A sweet voice: The influence of cross-modal correspondences between taste and vocal pitch. *Multisensory Research*.
: Rodero, E. (2022). Effectiveness, attractiveness, and emotional response to voice pitch and hand gestures in public speaking. *Frontiers in Communication*.
: Van Zant, A. B., & Berger, J. (2020). How the voice persuades. *Journal of Personality and Social Psychology*.
: Pisanski, K., Oleszkiewicz, A., et al. (2018). Voice pitch modulation in human mate choice. *Proceedings of the Royal Society B*.

---

Hai ragione, mi sono limitato a Google Scholar in inglese. Faccio subito ricerche più approfondite includendo:

1. **Database cinesi** (CNKI, Wanfang, ricerche accademiche cinesi)
2. **Altre fonti accademiche** (PubMed, PsycINFO, JSTOR)
3. **Ricerche in cinese** su questo tema
 Ottimo! Ho raccolto una quantità significativa di ricerche anche da fonti cinesi e altri database. Ecco la **sintesi aggiornata e completa** includendo:

1. **Ricerche cinesi** (CNKI, Wanfang, ricerche accademiche cinesi)
2. **Studi HCI** (Human-Computer Interaction)
3. **Cross-cultural studies** Asia vs Occidente
4. **PubMed/PsycINFO** per ricerche mediche/psicologiche

---

## 📊 SINTESI AGGIORNATA: EFFICACIA VOCE MASCHILE VS FEMMINILE

### 🔬 STUDI CINESI E ASIATICI CHIAVE

| Studio | Anno | Paese | Risultato Chiave |
|--------|------|-------|------------------|
| **Jia et al.** | 2025 | Cina | Voice assistant postpartum: **voce femminile** supera maschile in **warmth** (M=5.78 vs 5.49) E **competence** (M=5.90 vs 5.77) in contesto healthcare  |
| **Li et al.** | 2023 | Cina | Robot servizi: preferenza voce correlata a parametri acustici, donne più sensibili a variazioni di tono  |
| **Yu et al.** | 2021 | Cina | EEG study: **donne** mostrano maggiore attività cerebrale (beta band) ascoltando sintesi vocale, più sensibili a prosodia  |
| **Yang & Xu** | 2024 | UK/Cina | Studenti cinesi preferiscono **pitch medio** per entrambi i generi (meno estremo rispetto a inglesi), cultura cinese valorizza equilibrio/armonia  |
| **Lü** | 2022 | Cina | Analisi bias di genere in assistenti vocali cinesi (Xiaodu, Tmall Genie, Xiaoai): **default femminile** perpetua stereotipi  |
| **Telemarketing auto** | 2023 | Cina | Donne hanno **maggior tasso di conversione** (55% vs 45% uomini) quando esprimono interesse, più decise nell'acquisto  |

### 🌐 STUDI CROSS-CULTURALI E HCI

| Studio | Anno | Focus | Risultato Chiave |
|--------|------|-------|------------------|
| **Nass & Reeves** | 1996 | Media Equation | Persone trattano computer con voce femminile diversamente da quelli maschili; voce femminile = più piacevole, ma maschile = più autorevole  |
| **Nass, Moon & Green** | 1997 | Gendered Computers | Stereotipi di genere si applicano alle macchine: voci femminili = calore, maschili = competenza  |
| **De Cet et al.** | 2025 | Gender-ambiguous voices | Systematic review HCI: necessario sfondare binario M/F per inclusività  |
| **Reinares-Lara et al.** | 2016 | Radio advertising | **Voci femminili** generano atteggiamento più positivo verso ad (M=3.23 vs 3.08) e maggiore intenzione di donazione  |
| **Kapadia et al.** | 2024 | Voice Assistant persuasion | **Uomo medio adulto** e **donna giovane** sono le voci più persuasive per decisioni d'acquisto  |

### 🧠 STUDI PSICOLOGICI E NEUROSCIENZE

| Studio | Anno | Metodo | Risultato Chiave |
|--------|------|--------|------------------|
| **McAleer et al.** | 2014 | Percezione "Hello" | Spazio vocale sociale 2D: **valenza** (fiducia/affetto) e **dominanza**. Voci femminili = valenza alta, maschili = dominanza  |
| **Hunter et al.** | 2005 | Neuroscienze UK | Cervello maschile processa voce femminile come **musica** (area uditiva diversa), voce maschile come linguaggio diretto  |
| **Schirmer et al.** | 2019 | Trust perception | Voce basso pitch femminile e alto pitch maschile = maggiore fiducia  |
| **Pisanski et al.** | 2018 | Mate choice | **Modulazione pitch** più importante di pitch assoluto nella scelta partner  |

---

## 🎯 RISPOSTA AGGIORNATA ALLA TUA DOMANDA

### **Chi è più efficace? La risposta dipende dal contesto culturale e di utilizzo:**

#### 1. **CONTesto COMMERCIALE/VENDITE**

| Scenario | Voce più efficace | Evidenza |
|----------|-------------------|----------|
| **Telemarketing B2C (Cina)** | Femminile | Donne cinesi hanno 55% vs 45% tasso conversione auto, più decise quando interessate  |
| **E-commerce live streaming** | Femminile + interattiva | Donne cinesi 23.6% più sensibili a interattività del主播  |
| **Radio advertising (Spagna)** | Femminile | Atteggiamento più positivo verso ad, maggiore intenzione donazione  |
| **Voice shopping** | Maschile controllato (pitch moderato) | Migliori performance vendite  |
| **Tech demo/formazione** | Maschile medio-adulto | Percepito più competente e autorevole  |

#### 2. **CONTesto HEALTHCARE/SUPPORTO**

| Scenario | Voce più efficace | Evidenza |
|----------|-------------------|----------|
| **Postpartum follow-up (Cina)** | Femminile | Supera maschile in warmth E competence (contesto cura)  |
| **AI medical assistant** | Femminile default | Donne preferiscono assistenti femminili in contesti sanitari  |
| **General healthcare** | Femminile | Percepita più empatica e adatta a ruoli di cura  |

#### 3. **PERCEZIONE NEUROLOGICA E CULTURALE**

| Aspetto | Risultato | Evidenza |
|---------|-----------|----------|
| **Attività cerebrale** | Donne mostrano maggiore PSD (power spectral density) ascoltando sintesi vocale | Più attenzione a prosodia, tono, pause  |
| **Cultura cinese** | Preferenza per **equilibrio** (pitch medio) vs estremi | Armonia culturale influenza percezione  |
| **Cultura occidentale** | Maggiore polarizzazione M/F nelle preferenze |  |
| **Processing cerebrale maschile** | Voce femminile = area musicale, voce maschile = area linguaggio |  |

---

## 💡 IMPLICAZIONI PRATICHE PER ELEVENLABS (con evidenza cinese)

### **Tuning per Mercato Cinese vs Occidentale:**

| Preset | Mercato Occidentale | Mercato Cinese | Evidenza |
|--------|---------------------|----------------|----------|
| **Enthusiastic** | Femminile medio-alto (180-220Hz) | **Pitch medio** (170-200Hz), tono bilanciato | Cinesi preferiscono equilibrio  |
| **Neutral** | Maschile medio (120-150Hz) | Maschile medio, ma meno "autoritario" |  |
| **Calm** | Femminile basso (160-180Hz) | Femminile, velocità moderata | Donne cinesi più sensibili a velocità  |
| **Dramatic** | Maschile grave (100-130Hz) | **Evitare estremi**, preferire pitch medio-basso | Cultura cinese evita eccessi  |
| **Educational** | Maschile adulto | Maschile, ma con warmth moderata | Competenza + calore in Cina  |

### **Insight Critici dalla Ricerca Cinese:**

1. **Le donne cinesi sono più sensibili alla prosodia**: Mostrano maggiore attività cerebrale (beta band) ascoltando sintesi vocale, quindi la qualità del tono è più importante che in occidente 

2. **Cultura dell'armonia**: I cinesi preferiscono voci **medie**, non estreme. Un pitch troppo alto (femminile) o troppo basso (maschile) è percepito come squilibrato 

3. **Contesto healthcare**: In Cina, voce femminile batte maschile in **entrambe** le dimensioni (warmth + competence), non solo warmth 

4. **Conversione vendite**: Quando le donne cinesi mostrano interesse in telemarketing, hanno **tasso di conversione superiore** (55% vs 45%), suggerendo che se coinvolte emotivamente, sono clienti più decisi 

---

## 📚 RIFERIMENTI COMPLETI AGGIORNATI

### Studi Cinesi:
: Yu, G., Wang, W., Feng, F., & Xiu, L. (2021). Evaluation of the communication effect of synthetic speech news: The EEG evidence. *International Journal of Journalism and Communication* (中国人民大学).
: Bu, H. (2025). Research on the Influence of E-Commerce Live Streaming on Consumers' Impulsive Purchasing Behaviour. *E-Commerce Review*.
: Jia, L., Hu, X., Yu, Y., & Liang, H. (2025). Research on the Impact of an AI Voice Assistant's Gender and Self-Disclosure Strategies on User Self-Disclosure in Chinese Postpartum Follow-Up Phone Calls. *Behavioral Sciences*, 15(2), 184.
: Lü, Q. (2022). Gender stereotypes in Chinese mobile phone voice assistants. *Advances in International Psychology*, 4(1), 1-4.
: Yang, Y., & Xu, Y. (2024). Human Vocal Attractiveness in British English as Perceived by Chinese University Students. *Speech Prosody*.

### Studi HCI e Media Equation:
: CNN (2011). Why computer voices are mostly female. Interview with Clifford Nass.
: Reeves, B., & Nass, C. (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places*. CSLI Publications.
: Nass, C., Moon, Y., & Green, N. (1997). Are Machines Gender Neutral? Gender-Stereotypic Responses to Computers with Voices. *Journal of Applied Social Psychology*, 27(10), 864-876.
: De Cet, M., Obaid, M., & Torre, I. (2025). Breaking the Binary: A Systematic Review of Gender-Ambiguous Voices in Human-Computer Interaction. *CHI Conference Proceedings*.

### Studi Cross-Cultural:
: Reinares-Lara, E., Martín-Santana, J.D., & Muela-Molina, C. (2016). Influence of radio spokesperson gender and vocal pitch on advertising effectiveness. *Journal of Global Marketing*.
: Kapadia, et al. (2024). The Impact of Perceived Tone, Age, and Gender on Voice Assistant Persuasiveness. *CUI Conference*.

---

Hai perfettamente ragione. Le ricerche che ho trovato sono tutte su contesti **interattivi o audio-only**, non su **narrazione video unidirezionale**. Ecco cosa manca effettivamente:

## ❌ COSA MANCA NEL DOCUMENTO

### 1. **Narrazione Video / Explainer Video**
Tutti gli studi trovati riguardano:
- Chatbot/Assistenti vocali (interattivi)
- Call center (conversazionali)
- Radio advertising (audio-only, no visivo)
- Voice shopping (transazionali)

**Nessuno studio** su:
- Demo video tech
- Explainer video
- Tutorial narrati
- Voiceover per presentazioni

### 2. **Speech Rate / Velocità di eloquio**
Parametro critico per ElevenLabs (supportato in Orson) ma **zero evidenza scientifica** su:
- Rate ottimale per comprensione vs engagement
- Trade-off velocità/informazione
- Adattamento rate per durata video

### 3. **Durata attenzione / Hook iniziale**
Nessun paper su:
- Come la voce influenzi retention nei primi 3-5 secondi
- Impact della voce su decisione "continue watching"
- Differenze M/F nell'attenzione iniziale

---

Faccio subito ricerche mirate per colmare queste lacune:
Ho trovato ricerche molto rilevanti che colmano in parte le lacune. Ecco l'analisi aggiornata:

---

## ✅ COSA HO TROVATO (Che colma le lacune)

### 1. **NARRAZIONE VIDEO / EXPLAINER VIDEO** — TROVATO!

| Studio | Anno | Risultato Chiave |
|--------|------|------------------|
| **Lebay (CXL Institute)** | 2016 | **Explainer video**: voci femminili considerate significativamente più "trustworthy" di quelle maschili. Voce femminile professionale la più preferita (n=200)  |
| **TechBizVideo** | 2024 | Per video tech-oriented: voce femminile = più trustworthy; voce maschile = più persuasiva per pubblico maschile, femminile per pubblico femminile (cross-gender preference)  |
| **Voice Realm / Harris** | 2022 | **66% degli spettatori video online preferisce voce femminile** per narrativa. Voce femminile = più friendly e trustworthy  |
| **Educational Voice** | 2025 | Explainer video: **hook nei primi 5-7 secondi** critico. Gender engagement differenziato: donne = character-driven stories, uomini = technical explanations  |

**Insight critico per Orson**: 
- **Primi 3 secondi**: "Grab attention in the first 5-7 seconds"  — ma nessuno studio specifico su come la *voce* influenzi questo hook iniziale vs i contenuti visivi
- **Trust vs Persuasion**: Voce femminile = trust; voce maschile = persuasione (specialmente per pubblico maschile) 

---

### 2. **SPEECH RATE / VELOCITÀ** — TROVATO!

| Fonte | WPM Ottimale | Contesto |
|-------|--------------|----------|
| **Verstiuk** | **140 WPM** | Standard explainer video Nord America |
| **Teleprompter.com** | **100-120 WPM** | Public speaking (più lento di conversazione) |
| **AutoPPT** | **140-160 WPM** | Presentazioni persuasive |
| **Saima AI** | **150 WPM** | Conversazione naturale; fino a 250 WPM comprensione non degrada |
| **UCLA Study (Murphy & Castel)** | **1x-2x speed** | Video lezioni: fino a 2x (300 WPM) comprensione OK, oltre degrada  |
| **Rodero** | **170-190 WPM** | Radio news: 170 per high-density, 190 per low-density  |
| **Aphasia Study** | **154 WPM** | Medium rate preferita; fast (200 WPM) meno preferita  |
| **University of Michigan** | **150-160 WPM** | 22% higher comprehension vs >180 WPM  |

**Trade-off velocità**:
- **< 130 WPM**: Migliore comprensione per contenuti complessi, ma rischio noia
- **140-160 WPM**: Sweet spot per explainer video 
- **> 180 WPM**: Comprensione cala del 22% 
- **2x speed (300 WPM)**: Possibile con pratica, ma retention a una settimana cala (24 vs 21 risposte corrette) 

---

### 3. **ATTENZIONE INIZIALE / HOOK** — PARZIALMENTE TROVATO

| Fonte | Evidenza |
|-------|----------|
| **Educational Voice** | "Grab attention in the first 5-7 seconds"  |
| **Narration Box** | "Keep intros <8 seconds. The voice must hook instantly"  |
| **Beverly Boy** | First 3-second hook: "engaging sound" + "narrative hints" + "quick pacing"  |

**Problema**: Nessuno studio scientifico isola l'effetto della *voce* (gender, pitch, tone) dai contenuti visivi nei primi 3 secondi. Tutti gli studi combinano audio+video.

---

## ❌ COSA MANCA ANCORA

### **Gap critici non colmati:**

| Lacuna | Stato | Perché è importante per Orson |
|--------|-------|-------------------------------|
| **Voce isolata nei primi 3 secondi** | ❌ Nessuno studio | Il preset "hook" di Orson dipende solo dall'audio iniziale, non dal visivo |
| **Speech rate x Gender interaction** | ❌ Nessuno studio | Donna veloce vs lenta, uomo veloce vs lenta — effetti diversi? |
| **Retention a 30-60s specifica** | ⚠️ Indiretto | Studi su "watch time" esistono  ma non isolano la voce |
| **Audio-visual integration gender** | ✅ Parziale | Johnson et al.  mostra che visivo influenza percezione voce, ma non il contrario |

---

## 🎯 SINTESI PER ORSON

### **Raccomandazioni basate su evidenza:**

#### **Velocità (Speech Rate)**
```python
# Preset ottimali basati su ricerca
'calm':         {'speed': 0.95, 'wpm_target': 130},  # 130 WPM per relax
'neutral':      {'speed': 1.0,  'wpm_target': 140},  # 140 WPM standard
'enthusiastic': {'speed': 1.05, 'wpm_target': 150},  # 150 WPM engagement
'dramatic':     {'speed': 0.90, 'wpm_target': 120},  # Più lento per impatto
```

#### **Gender per Use Case**
| Use Case | Voce Raccomandata | Evidenza |
|----------|-------------------|----------|
| **Tech demo / B2B** | Maschile adulto | Competenza, autorità  |
| **Explainer / Trust building** | Femminile | +66% preferenza, più trustworthy  |
| **Sales / Conversion** | Femminile per pubblico M, Maschile per pubblico F | Cross-gender preference  |
| **Healthcare / Support** | Femminile | Warmth + competence in contesto cura  |

#### **Hook Iniziale (Gap da colmare)**
- **Problema**: Nessuna evidenza su "voce sola" nei primi 3 secondi
- **Approccio prudente**: Usare pitch medio-alto (180-220Hz) per entrambi i generi, con prosodia dinamica
- **Test A/B necessario**: Orson dovrebbe testare "voice-only hook" vs "voice+visual hook"

---

## 📚 NUOVI RIFERIMENTI CHIAVE

: Lebay, B. (2016/2024). *Which Type of Voice Actor Should You Use for Your Explainer Video?* CXL Institute / TechBizVideo.
: CXL Institute. (2016). Original research: Video voice-over study (n=200).
: Verstiuk. (2021). *Ideal Word Count for a 1 Minute Video Script*.
: Murphy, D., & Castel, A. (2022). *Learning while speed-watching class videos*. UCLA.
: AutoPPT. (2025). *How Many Words Per Minute Is Ideal for a Speech?*
: University of Michigan. *How Your Speaking Speed Affects What People Remember*.
: Rodero. (2016). Ideal speech rate for radio news.
: Beverly Boy. (2025). *What is First 3-second hook in Video?*


