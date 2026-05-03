/**
 * Plain JS seed script — runs directly with Node.js (no TypeScript needed)
 * Usage: node seed.js
 */
const admin = require('firebase-admin');
const path = require('path');

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const now = admin.firestore.Timestamp.now();

function estimateReadingTime(md) {
  return Math.max(1, Math.ceil(md.trim().split(/\s+/).length / 200));
}

const TOPICS = [
  {
    id: 'voter-registration',
    title: 'Voter Registration in India',
    slug: 'voter-registration',
    category: 'registration',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Voter Registration in India

## Who Can Register?
Any Indian citizen who is 18 years or older on the qualifying date (January 1 of the revision year) can register as a voter.

## How to Register
1. Visit voters.eci.gov.in or download the Voter Helpline App
2. Fill Form 6 for new registration or Form 8 for corrections
3. Provide proof of age, identity, and address
4. Submit online or at your local Electoral Registration Officer (ERO)

## Documents Required
- **Proof of Age:** Birth certificate, school certificate, or Aadhaar card
- **Proof of Address:** Aadhaar, passport, utility bill, or bank passbook
- **Photograph:** Recent passport-size photo

## EPIC Card
After verification, you receive your Elector's Photo Identity Card (EPIC) — commonly called the Voter ID card. It is issued free of cost.

## Checking Your Name on the Roll
1. Visit voters.eci.gov.in
2. Enter your name, date of birth, and state
3. Or call Voter Helpline **1950** (toll-free)

## Important Deadlines
- Applications for new registration must be submitted before the cutoff date announced by the ECI
- The qualifying date for age eligibility is **January 1** of the year of revision

:::factsheet
Register Online Today
Visit the official ECI voter portal to register, check your name, or update your details.
Register at voters.eci.gov.in|https://voters.eci.gov.in
:::`,
  },
  {
    id: 'ballot-types',
    title: 'Types of Ballots in Indian Elections',
    slug: 'ballot-types',
    category: 'ballot',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Types of Ballots in Indian Elections

## Electronic Voting Machine (EVM)
India has used EVMs in all elections since 2004. The EVM consists of two units:

- **Ballot Unit (BU):** The voter-facing unit with candidate names and buttons
- **Control Unit (CU):** Operated by the Presiding Officer to enable voting

### How EVMs Work
1. The Presiding Officer enables the ballot on the Control Unit
2. The voter presses the button next to their chosen candidate
3. A beep confirms the vote has been recorded
4. The EVM stores votes in encrypted memory with no external connectivity

## VVPAT — Voter Verifiable Paper Audit Trail
Introduced in 2013, VVPAT provides transparency:

1. After pressing the EVM button, a paper slip prints automatically
2. The slip shows the candidate's name, party, and symbol
3. The slip is visible through a glass window for **7 seconds**
4. It then drops into a sealed box for audit purposes

## Postal Ballot
Service voters can vote by post:

- Members of the Armed Forces (Army, Navy, Air Force)
- Government employees posted outside their constituency
- Persons under preventive detention

## Proxy Voting
Service voters may appoint a proxy to vote in person on their behalf using Form 13F.

## NOTA — None of the Above
Since 2013, voters can choose NOTA if they do not wish to vote for any candidate. NOTA does not invalidate the election — the candidate with the next highest votes wins.

:::factsheet
EVM Security
EVMs have no internet or wireless connectivity and are stored in secure warehouses with CCTV surveillance between elections.
Learn More|https://eci.gov.in
:::`,
  },
  {
    id: 'polling-locations',
    title: 'Finding Your Polling Booth',
    slug: 'polling-locations',
    category: 'polling',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Finding Your Polling Booth

## How to Find Your Booth
Every registered voter is assigned a specific polling booth based on their registered address.

1. Call **Voter Helpline 1950** (toll-free, available in multiple languages)
2. Visit **voters.eci.gov.in** and search by EPIC number or name
3. Download the **Voter Helpline App** from Google Play or App Store
4. Check your **EPIC card** — the booth number and address are printed on it

## On Polling Day

### What to Carry
- Your EPIC (Voter ID) card, OR
- Any of the 12 alternative photo ID documents accepted by the ECI

### Alternative ID Documents
If you don't have your EPIC card, you can use:
- Aadhaar card
- Passport
- Driving licence
- PAN card
- MNREGA job card
- Bank or Post Office passbook with photograph
- Smart card issued by RGI under NPR
- Pension document with photograph
- Service identity card issued by Central/State Government
- Health insurance smart card issued under ESIC scheme
- Official identity card issued to MPs/MLAs/MLCs

### Polling Hours
- Polls are generally open from **7:00 AM to 6:00 PM**
- Timings may vary by state and constituency
- Voters in queue at closing time are allowed to vote

## Booth Level Officer (BLO)
Each polling booth has a designated BLO who can help you:
- Verify your name on the electoral roll
- Assist with registration or corrections
- Provide information about your booth location

:::factsheet
Find Your Booth
Use the official ECI portal to locate your polling booth before election day.
Find My Booth|https://voters.eci.gov.in
:::`,
  },
  {
    id: 'eci-structure',
    title: 'Election Commission of India: Structure & Powers',
    slug: 'eci-structure',
    category: 'eci-structure',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Election Commission of India

## Constitutional Mandate
The Election Commission of India (ECI) is an autonomous constitutional authority established under **Article 324** of the Indian Constitution on **January 25, 1950** — one day before India became a Republic.

## Composition
- **Chief Election Commissioner (CEC)** — heads the Commission
- **Two Election Commissioners** — appointed since 1993
- All three members have equal voting power
- They can only be removed through a process similar to removing a Supreme Court judge

## Key Powers and Functions

### Electoral Roll Management
1. Preparation and continuous revision of electoral rolls
2. Registration of voters across all constituencies
3. Delimitation of constituencies (in coordination with the Delimitation Commission)

### Election Administration
1. Announcement of election schedules for Parliament and State Legislatures
2. Enforcement of the Model Code of Conduct (MCC)
3. Deployment of Central Armed Police Forces (CAPF) for sensitive constituencies
4. Appointment of Returning Officers and Presiding Officers

### Political Party Regulation
1. Recognition of national and state political parties
2. Allotment of election symbols to parties and candidates
3. Deregistration of parties that violate election laws

### Dispute Resolution
1. Adjudication of disputes related to election symbols
2. Disqualification of candidates for corrupt practices
3. Countermanding elections in case of booth capturing or violence

## Important Milestones
- **1952:** First General Elections — world's largest democratic exercise at the time
- **1982:** First use of EVMs in a by-election in Kerala
- **2004:** EVMs used in all Lok Sabha constituencies
- **2013:** Introduction of VVPAT and NOTA

:::factsheet
Contact the ECI
For election-related queries, visit the official ECI website or call the Voter Helpline.
Visit eci.gov.in|https://eci.gov.in
:::`,
  },
  {
    id: 'postal-voting',
    title: 'Postal and Absentee Voting',
    slug: 'postal-voting',
    category: 'postal-voting',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Postal and Absentee Voting in India

## Who Can Vote by Post?
The following categories of voters are eligible for postal ballots:

- Members of the **Armed Forces** (Army, Navy, Air Force)
- Members of the **Armed Police Forces** serving outside their home state
- **Government employees** posted outside India
- Persons under **preventive detention**
- Voters with **disabilities** (optional postal ballot in some states)
- **Senior citizens** aged 85 and above (optional in some states)

## How to Apply for a Postal Ballot

1. Submit **Form 12** to the Returning Officer of your constituency
2. The Returning Officer sends you a postal ballot paper
3. Mark your vote on the ballot paper
4. Seal it in the provided envelope
5. Return it to the Returning Officer before the counting date

## Proxy Voting for Service Voters
Service voters can appoint a proxy to vote in person:

1. Submit **Form 13F** to the Returning Officer
2. The proxy must be a registered voter in the same constituency
3. The proxy votes on behalf of the service voter at the polling station
4. The proxy cannot be changed once appointed for that election

## Electronically Transmitted Postal Ballot System (ETPBS)
For service voters posted in remote areas:

1. The ballot paper is transmitted electronically to the voter
2. The voter prints, marks, and returns the ballot by post
3. This system reduces delays for voters in remote postings

:::factsheet
Apply for Postal Ballot
Service voters should contact their unit's record office or the Returning Officer of their home constituency.
Learn More|https://eci.gov.in
:::`,
  },
  {
    id: 'election-security',
    title: 'Election Security in India',
    slug: 'election-security',
    category: 'election-security',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Election Security in India

## EVM Security Features
EVMs are designed with multiple layers of security:

- **No connectivity:** EVMs have no internet, Bluetooth, or wireless capability
- **Unique numbering:** Each EVM is uniquely numbered and tracked throughout its lifecycle
- **Tamper-proof:** Any attempt to tamper with the EVM triggers an automatic lock
- **Secure storage:** EVMs are stored in warehouses with CCTV surveillance and multi-lock systems
- **Candidate inspection:** Candidates and their agents can inspect EVMs before and after polling

## VVPAT Verification
- Voters can verify their vote on the VVPAT slip for **7 seconds**
- VVPAT slips are counted for **5 randomly selected EVMs** per assembly segment
- The count is done in the presence of candidates and their agents

## Security Forces Deployment
1. **Central Armed Police Forces (CAPF)** are deployed for sensitive constituencies
2. Multi-phase elections allow forces to be redeployed across states
3. **State Police** provides additional security at polling stations
4. **Micro-observers** from the IAS/IPS are posted at sensitive booths

## Model Code of Conduct (MCC)
The MCC restricts activities that could compromise election integrity:

- No announcement of new government schemes after election schedule
- No use of government vehicles or resources for campaigning
- No hate speech or communal appeals
- Strict regulation of election expenditure

## Citizen Complaint Mechanisms

### cVIGIL App
- Citizens can report election code violations with photo or video evidence
- Reports are geotagged and time-stamped
- Flying squads respond within **100 minutes** of a complaint

### National Grievance Services Portal
- Online portal for election-related complaints
- Available at **pgportal.gov.in**

:::factsheet
Report a Violation
Use the cVIGIL app to report election code violations with photo or video evidence.
Download cVIGIL|https://cvigil.eci.gov.in
:::`,
  },
  {
    id: 'candidate-selection',
    title: 'Candidate Selection and Nomination',
    slug: 'candidate-selection',
    category: 'candidates',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Candidate Selection and Nomination

## Eligibility to Contest a Lok Sabha Election
To contest a Lok Sabha election, a candidate must:

- Be a **citizen of India**
- Be at least **25 years of age**
- Be registered as a voter in **any parliamentary constituency** in India
- Not hold any **office of profit** under the Central or State Government
- Not be of **unsound mind** as declared by a competent court
- Not be an **undischarged insolvent**

## Disqualifications
A person is disqualified if they:

- Have been convicted of a criminal offence and sentenced to imprisonment of 2 or more years
- Have been found guilty of corrupt practices in a previous election
- Have been dismissed from government service for corruption or disloyalty

## Nomination Process

1. **File nomination papers** with the Returning Officer during the notified period (usually 4-7 days)
2. **Pay the security deposit:**
   - General candidates: **₹25,000** for Lok Sabha, **₹10,000** for State Assembly
   - SC/ST candidates: **₹12,500** for Lok Sabha, **₹5,000** for State Assembly
3. **Scrutiny of nominations** by the Returning Officer
4. **Withdrawal period:** Candidates can withdraw within **2 days** of scrutiny

## Party Symbols
- Recognised **national parties** get reserved symbols (e.g., lotus, hand)
- Recognised **state parties** get reserved symbols within their state
- **Independent candidates** choose from a list of free symbols
- The ECI maintains the official list of recognised parties and symbols

## Security Deposit Refund
The security deposit is refunded if the candidate:
- Wins the election, OR
- Secures more than **1/6th of the total valid votes** polled in the constituency

:::factsheet
Candidate Affidavit
All candidates must file a sworn affidavit disclosing criminal records, assets, and liabilities. These are publicly available on the ECI website.
View Affidavits|https://affidavit.eci.gov.in
:::`,
  },
  {
    id: 'campaign-finance',
    title: 'Campaign Finance and Election Expenditure',
    slug: 'campaign-finance',
    category: 'campaign-finance',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Campaign Finance and Election Expenditure

## Expenditure Limits
The ECI sets strict limits on election expenditure per candidate:

### Lok Sabha Elections
- **Large states** (e.g., UP, Maharashtra): **₹95 lakh** per candidate
- **Smaller states and UTs**: **₹75 lakh** per candidate

### State Assembly Elections
- **Large states**: **₹40 lakh** per candidate
- **Smaller states and UTs**: **₹28 lakh** per candidate

## What Counts as Election Expenditure?
- Campaign rallies, meetings, and processions
- Advertisements in print, electronic, and social media
- Vehicles used for campaigning
- Banners, posters, and hoardings
- Gifts or payments to voters (illegal — constitutes a corrupt practice)

## Disclosure Requirements
1. Candidates must maintain a **daily account** of all election expenditure
2. Submit the expenditure statement to the Returning Officer within **30 days** of results
3. **Failure to submit** can lead to disqualification from contesting future elections

## Expenditure Observers
The ECI appoints **Expenditure Observers** (senior IRS officers) to:
- Monitor candidate expenditure
- Conduct surprise checks on campaign activities
- Verify expenditure statements

## Model Code of Conduct (MCC)
The MCC comes into effect from the date of election schedule announcement:

- **No new schemes:** Government cannot announce new welfare schemes
- **No government resources:** Officials cannot use government vehicles or staff for campaigning
- **No transfers:** Senior officials cannot be transferred without ECI approval
- **No hate speech:** Communal or divisive appeals are prohibited

## Electoral Bonds
Electoral bonds are financial instruments for political donations:

1. Purchased from the **State Bank of India** in specified denominations
2. Donated to political parties within **15 days** of purchase
3. Parties encash them through their designated bank accounts

:::factsheet
Track Election Expenditure
The ECI publishes candidate expenditure statements on its website after elections.
View Expenditure Data|https://eci.gov.in
:::`,
  },
  {
    id: 'results-certification',
    title: 'Results Certification and Government Formation',
    slug: 'results-certification',
    category: 'certification',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Results Certification and Government Formation

## Counting Day

### Preparation
1. Counting centres are set up at designated locations (usually district headquarters)
2. Candidates and their **counting agents** are issued passes
3. **Counting observers** from the IAS are appointed by the ECI
4. Strong rooms containing EVMs are opened in the presence of candidates

### Counting Process
1. Counting begins at **8:00 AM** on the designated counting day
2. **Postal ballots** are counted first
3. EVM votes are counted round by round for each assembly segment
4. Results of each round are announced and displayed on a board
5. Candidates and agents can raise objections at any stage

### Declaration of Results
1. The **Returning Officer** announces the winner for each constituency
2. Results are uploaded to the ECI website in **real-time**
3. The winning candidate receives a **Certificate of Election**
4. Losing candidates can file an **Election Petition** in the High Court within 45 days

## Government Formation (Lok Sabha)

### Simple Majority
- A party or alliance needs **272 or more seats** (out of 543) to form the government
- The President invites the leader of the majority to be sworn in as **Prime Minister**

### Hung Parliament
If no single party or alliance has a majority:
1. The President invites the **single largest party** to form the government
2. The party must prove its majority on the floor of the House within a specified time
3. If it fails, the President invites the next largest party or coalition

### Swearing-In Ceremony
1. The Prime Minister is sworn in by the **President of India**
2. The Council of Ministers is sworn in subsequently
3. The new government assumes office immediately after the oath

## Model Code of Conduct Lifted
The MCC is lifted after:
- Completion of the election process in all phases
- Announcement of results for all constituencies

:::factsheet
Election Results
Live election results are available on the ECI website from counting day.
View Results|https://results.eci.gov.in
:::`,
  },
  {
    id: 'civic-rights',
    title: 'Civic Rights and Duties of Indian Voters',
    slug: 'civic-rights',
    category: 'civic-rights',
    locale: 'en',
    mediaRefs: [],
    contentMd: `# Civic Rights and Duties of Indian Voters

## Fundamental Rights Related to Elections

### Article 326 — Universal Adult Suffrage
Every Indian citizen who is 18 years or older has the right to vote in elections to the Lok Sabha and State Legislative Assemblies, regardless of religion, race, caste, sex, or place of birth.

### Article 324 — Free and Fair Elections
The Election Commission of India is constitutionally mandated to ensure free and fair elections, protecting every voter's right to cast their vote without fear or coercion.

### Article 19(1)(a) — Freedom of Expression
Citizens have the right to express their political opinions, support candidates, and participate in political discourse.

## Your Rights as a Voter

1. **Right to vote without fear** — No one can coerce or threaten you about how to vote
2. **Right to secret ballot** — Your vote is completely confidential; no one can ask how you voted
3. **Right to NOTA** — You can choose "None of the Above" if you don't support any candidate
4. **Right to complain** — You can report violations via the cVIGIL app or Voter Helpline 1950
5. **Right to information** — Candidate affidavits (criminal records, assets) are publicly available

## Your Duties as a Voter

- **Register and stay registered** — Keep your address and details updated on the electoral roll
- **Vote in every election** — Local, state, and national elections all matter
- **Make an informed choice** — Read candidate affidavits and party manifestos
- **Report violations** — Report bribery, booth capturing, or MCC violations
- **Refuse bribes** — Accepting money or gifts in exchange for votes is illegal

## NOTA — None of the Above
- Introduced by the Supreme Court in **2013**
- Available on all EVMs as the last option
- If NOTA gets the highest votes, the candidate with the **next highest votes wins**
- NOTA does not invalidate the election or trigger a re-election

## Right to Information in Elections
Under the RTI Act and ECI guidelines:
- Candidate affidavits are publicly available on the ECI website
- Election expenditure statements are published after elections
- Electoral rolls are available for public inspection

## Voter Awareness Initiatives
The ECI runs the **SVEEP (Systematic Voters' Education and Electoral Participation)** programme to:
- Increase voter registration among first-time voters
- Encourage participation among women, youth, and marginalized communities
- Promote ethical voting and rejection of bribery

:::factsheet
Know Your Candidate
Check the criminal records, assets, and liabilities of candidates before voting.
View Candidate Affidavits|https://affidavit.eci.gov.in
:::`,
  },
];

async function seed() {
  console.log('\n🌱 Starting Firestore seed...\n');

  // Seed topics
  const topicsBatch = db.batch();
  for (const topic of TOPICS) {
    const readingTimeMinutes = estimateReadingTime(topic.contentMd);
    const ref = db.collection('topics').doc(topic.id);
    topicsBatch.set(ref, {
      title: topic.title,
      slug: topic.slug,
      category: topic.category,
      locale: topic.locale,
      contentMd: topic.contentMd,
      mediaRefs: topic.mediaRefs,
      readingTimeMinutes,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ Topic: ${topic.title} (${readingTimeMinutes} min read)`);
  }
  await topicsBatch.commit();
  console.log(`\n✅ ${TOPICS.length} topics seeded successfully.\n`);

  // Seed India 2024 timeline
  console.log('🌱 Seeding India 2024 election timeline...');
  await db.collection('timelines').doc('india-2024').set({
    year: 2024,
    label: '2024 Lok Sabha General Elections — India',
    events: [
      { id: 'roll-revision-start', date: '2024-01-01', phase: 'registration', title: 'Voter Roll Revision Begins', description: 'Annual summary revision of electoral rolls starts. New voters can apply via Form 6 at voters.eci.gov.in.', type: 'milestone', urgent: false, actionUrl: 'https://voters.eci.gov.in' },
      { id: 'roll-final-publication', date: '2024-01-31', phase: 'registration', title: 'Final Publication of Electoral Rolls', description: 'Revised electoral rolls published. Last date to raise objections or apply for corrections via Form 8.', type: 'deadline', urgent: true, actionUrl: 'https://voters.eci.gov.in' },
      { id: 'mcc-announcement', date: '2024-03-16', phase: 'nomination', title: 'Election Schedule Announced — MCC in Effect', description: 'ECI announces the 7-phase Lok Sabha election schedule. Model Code of Conduct comes into immediate effect.', type: 'milestone', urgent: false, actionUrl: 'https://eci.gov.in' },
      { id: 'phase1-nomination', date: '2024-03-20/2024-03-27', phase: 'nomination', title: 'Phase 1 Nomination Filing', description: 'Candidates file nomination papers for Phase 1 constituencies (102 seats across 21 states/UTs).', type: 'period', urgent: false },
      { id: 'phase1-polling', date: '2024-04-19', phase: 'polling', title: 'Phase 1 Polling Day', description: 'Polling for 102 Lok Sabha constituencies. Polls open 7:00 AM – 6:00 PM.', type: 'election-day', urgent: false },
      { id: 'phase2-polling', date: '2024-04-26', phase: 'polling', title: 'Phase 2 Polling Day', description: 'Polling for 89 Lok Sabha constituencies across 13 states and UTs.', type: 'election-day', urgent: false },
      { id: 'phase3-polling', date: '2024-05-07', phase: 'polling', title: 'Phase 3 Polling Day', description: 'Polling for 94 Lok Sabha constituencies across 12 states and UTs.', type: 'election-day', urgent: false },
      { id: 'phase4-polling', date: '2024-05-13', phase: 'polling', title: 'Phase 4 Polling Day', description: 'Polling for 96 Lok Sabha constituencies across 10 states and UTs.', type: 'election-day', urgent: false },
      { id: 'phase5-polling', date: '2024-05-20', phase: 'polling', title: 'Phase 5 Polling Day', description: 'Polling for 49 Lok Sabha constituencies across 8 states and UTs.', type: 'election-day', urgent: false },
      { id: 'phase6-polling', date: '2024-05-25', phase: 'polling', title: 'Phase 6 Polling Day', description: 'Polling for 58 Lok Sabha constituencies across 7 states and UTs.', type: 'election-day', urgent: false },
      { id: 'phase7-polling', date: '2024-06-01', phase: 'polling', title: 'Phase 7 Polling Day (Final Phase)', description: 'Polling for 57 Lok Sabha constituencies. Final phase of the 2024 General Elections.', type: 'election-day', urgent: false },
      { id: 'counting-day', date: '2024-06-04', phase: 'counting', title: 'Vote Counting & Results', description: 'Counting begins at 8:00 AM across all 543 constituencies. Results declared throughout the day.', type: 'milestone', urgent: false, actionUrl: 'https://results.eci.gov.in' },
      { id: 'mcc-lifted', date: '2024-06-05', phase: 'certification', title: 'Model Code of Conduct Lifted', description: 'MCC lifted after completion of election process. New government formation begins.', type: 'milestone', urgent: false },
    ],
    createdAt: now,
    updatedAt: now,
  });
  console.log('✅ Timeline seeded: 2024 Lok Sabha General Elections\n');

  console.log('🎉 All data seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
