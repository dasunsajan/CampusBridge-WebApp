# CampusBridge — 5-Minute Project Demonstration Script

**Student Name:** A.G.D.S. Sandeepa  
**Registration Number:** EG/2023/5864  
**Course Module:** EC4307 Web Application Development  
**Academic Year:** 2026  
**Target Video Duration:** 4 to 5 Minutes  

---

## 📌 Video Recording Guidelines
1. **Camera Position:** Keep your webcam switched ON throughout the demonstration (positioned in the corner of your screen recording).
2. **Audio:** Ensure clear audio and a quiet environment.
3. **Screen Setup:** Open your browser to `http://localhost:3000` with the CampusBridge application running.

---

## ⏱️ Video Timeline Breakdown

| Time | Section | Screen Action | What to Say (Spoken Script) |
|---|---|---|---|
| **0:00 - 0:40** | Introduction & Problem | Dashboard view | Greet the examiner, state your name, registration number, module EC4307, and the problem CampusBridge solves. |
| **0:40 - 1:20** | Dashboard & Reading Data | Dashboard & Events Listing | Show dynamic statistics calculated from the SQLite database; demonstrate Search, Category filters, and Sorting. |
| **1:20 - 2:20** | CREATE Event & Validation | 'New Event' Modal | Demonstrate both client-side and backend validation errors (empty inputs, negative budget), then submit a valid event. |
| **2:20 - 3:05** | UPDATE & Database Persistence | Edit Modal & Refresh | Edit event budget/venue, save changes, and refresh the browser (Ctrl+R) to prove persistent storage in SQLite. |
| **3:05 - 4:05** | Micro-Sponsorship Workflow | Event Details & Pledges | Submit a pledge from a sponsor; show that PENDING pledges do not inflate the total; mark it ACCEPTED and observe the live funding progress bar update. |
| **4:05 - 4:35** | Safe DELETE & Cascading | Delete Confirmation Dialog | Delete an event safely using the modal confirmation dialog; explain the database cascade deletion rule. |
| **4:35 - 5:00** | Conclusion & Architecture | Analytics Page | Briefly summarize the tech stack (React, TypeScript, Express, SQLite, Prisma) and conclude politely. |

---

## 🎙️ Word-for-Word Spoken Narration Script (English)

### 1. Introduction (0:00 - 0:40)
> *"Good day, sir. My name is **A.G.D.S. Sandeepa**, registration number **EG/2023/5864**, and this is my individual project demonstration for **EC4307 Web Application Development**.*
>
> *My project is **CampusBridge — Campus Events & Micro-Sponsorship Platform**. In our universities, student clubs and societies frequently organize hackathons, cultural festivals, and workshops. However, finding large corporate sponsorships is challenging, while alumni and local businesses often want to support student initiatives with smaller micro-sponsorship contributions (such as 10,000 or 50,000 rupees). I built CampusBridge to connect student organizers with micro-sponsors through transparent pledge tracking and real-time funding progress."*

---

### 2. Dashboard, Read & Filtering (0:40 - 1:20)
*(Screen: Show `http://localhost:3000/`)*
> *"Starting on the main dashboard, every metric displayed here—including total events, registered sponsors, and accepted sponsorship funds—is queried live from our local SQLite database.*
>
> *(Click 'Campus Events' in the sidebar)*  
> *Under the Events module, all published events are displayed as interactive cards. I have built comprehensive search, filter, and sorting features. For example, I can search for 'HackX' in the search bar, filter by category such as 'Technology' or 'Sports', and sort events by scheduled date or target budget."*

---

### 3. Event Creation & Validation (1:20 - 2:20)
*(Screen: Click the '+ New Event' button)*
> *"Now I will demonstrate the **CREATE** operation, along with our validation system.*
>
> *(Click 'Save Event' with empty fields)*  
> *Notice that if I attempt to submit without required information, the system blocks the submission and displays specific error messages. Similarly, if I enter a negative target budget, it is rejected by our backend validation schema.*
>
> *(Fill in sample data)*  
> - **Title:** National Robotics Showcase 2026  
> - **Description:** Annual inter-university autonomous robotics and rover demonstration.  
> - **Category:** Technology  
> - **Organizer:** Robotics & Innovation Club  
> - **Budget:** 150000  
> - **Date:** (Select a future date)  
> - **Venue:** Indoor Gymnasium  
>
> *(Click 'Save Event')*  
> *Upon submission, the new event is persisted to the SQLite database, a success alert appears, and the event card is immediately visible in our listing."*

---

### 4. UPDATE Operation & Database Persistence (2:20 - 3:05)
*(Screen: Click the Edit icon on the newly created event)*
> *"Next is the **UPDATE** operation. Clicking edit opens the form pre-filled with the event's existing data. Let me adjust the target budget to 180,000 rupees and update the venue to 'Main Sports Complex'.*
>
> *(Click 'Update Changes', then press Ctrl+R to reload the browser)*  
> *The changes are updated instantly. To verify true database persistence rather than temporary frontend state, I refresh the browser. As you can see, all updated values remain securely saved in the database."*

---

### 5. Micro-Sponsorship Workflow & Calculation Logic (3:05 - 4:05)
*(Screen: Click into the event card to open the Event Details view)*
> *"Now let us look at the micro-sponsorship workflow. Here on the event details page, we see our target budget of 180,000 rupees with zero percent funded so far.*
>
> *(Click 'Pledge Sponsorship', select 'Ceylon Cloud Solutions', enter 50000, and click Submit)*  
> *A sponsor pledges 50,000 rupees. Notice that the pledge is initially marked as **PENDING**. In my business logic, pending pledges do NOT falsely inflate the accepted funded amount.*
>
> *(Navigate to 'Sponsorship Pledges' tab and click the green checkmark to Accept the pledge)*  
> *Once the student committee reviews and accepts the pledge, the event's funded total automatically recalculates to 50,000 rupees, and the progress bar updates to 28 percent."*

---

### 6. Safe DELETE Operation (4:05 - 4:35)
*(Screen: Return to Events, find the test event, and click the Trash icon)*
> *"Finally, let us demonstrate the **DELETE** operation. Deleting records in a relational database must be done safely. CampusBridge prompts the user with a confirmation modal explaining that deleting this event will also cleanly remove its associated sponsorship pledges through database foreign-key cascade rules.*
>
> *(Click 'Delete Event')*  
> *Upon confirmation, the record is removed safely from the database with clear feedback."*

---

### 7. Conclusion & Architecture (4:35 - 5:00)
*(Screen: Navigate to the Analytics tab)*
> *"Under the Analytics tab, student organizers can review interactive charts comparing target budgets against actual accepted funding across all society categories.*
>
> *In conclusion, I have satisfied all evaluation requirements: full persistent CRUD operations, relational database design with foreign keys, two-tier validation, responsive UI design, and automated testing. The stack utilizes React, TypeScript, Vite, Tailwind CSS, Express, and SQLite with Prisma ORM.*
>
> *Thank you very much for your time and evaluation."*
