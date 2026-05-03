/**
 * Seed script: writes 10 India ECI election education topics to Firestore.
 * Run with: npm run seed
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { adminDb } from '../services/firebaseAdmin';
import { validateTopicSchema, estimateReadingTime } from '../services/contentService';
import { Timestamp } from 'firebase-admin/firestore';

const now = Timestamp.now();

const TOPICS = [
  {
    title: 'Voter Registration in India',
    slug: 'voter-registration',
    category: 'registration' as const,
    locale: 'en' as const,
    contentMd: `# Voter Registration in India

## Who Can Register?
Any Indian citizen who is 18 years or older on the qualifying date (January 1 of the revision year) can register as a voter.

## How to Register
1. Visit voters.eci.gov.in or the Voter Helpline App
2. Fill Form 6 (new registration) or Form 8 (correction/migration)
3. Provide proof of age, identity, and address
4. Submit the form online or at your local Electoral Registration Officer (ERO)

## Documents Required
- Proof of Age: Birth certificate, school certificate, or Aadhaar card
- Proof of Address: Aadhaar, passport, utility bill, or bank passbook
- Passport-size photograph

## EPIC Card
After verification, you will receive your Elector's Photo Identity Card (EPIC), also known as the Voter ID card.

:::factsheet
Register Online
Visit voters.eci.gov.in to register or check your name on the electoral roll.
Register Now|https://voters.eci.gov.in
:::`,
    mediaRefs: [],
  },
  {
    title: 'Types of Ballots in Indian Elections',
    slug: 'ballot-types',
    category: 'ballot' as const,
    locale: 'en' as const,
    contentMd: `# Types of Ballots in Indian Elections

## Electronic Voting Machine (EVM)
India uses EVMs for all elections since 2004. The EVM consists of:
- **Ballot Unit**: Where voters press the button next to their candidate
- **Control Unit**: Operated by the Presiding Officer to enable voting

## VVPAT (Voter Verifiable Paper Audit Trail)
Introduced in 2013, VVPAT provides a paper slip showing the candidate and symbol voted for. The slip is visible for 7 seconds before dropping into a sealed box.

## Postal Ballot
Service voters (armed forces, government employees posted away from constituency) can vote by postal ballot.

## Proxy Voting
Service voters can also appoint a proxy to vote on their behalf.`,
    mediaRefs: [],
  },
  {
    title: 'Finding Your Polling Booth',
    slug: 'polling-locations',
    category: 'polling' as const,
    locale: 'en' as const,
    contentMd: `# Finding Your Polling Booth

## How to Find Your Booth
1. Call Voter Helpline **1950** (toll-free)
2. Visit voters.eci.gov.in and search by EPIC number or name
3. Use the Voter Helpline mobile app
4. Check your EPIC card — the booth number is printed on it

## On Polling Day
- Polls are open from **7:00 AM to 6:00 PM** (timings may vary by state)
- Carry your EPIC card or any of the 12 alternative photo ID documents
- You will be given a voter slip by the Booth Level Officer (BLO)

## Alternative ID Documents
If you don't have your EPIC card, you can use:
- Aadhaar card
- Passport
- Driving licence
- PAN card
- MNREGA job card
- Bank/Post Office passbook with photograph`,
    mediaRefs: [],
  },
  {
    title: 'Election Commission of India: Structure & Powers',
    slug: 'eci-structure',
    category: 'eci-structure' as const,
    locale: 'en' as const,
    contentMd: `# Election Commission of India

## Constitutional Mandate
The Election Commission of India (ECI) is an autonomous constitutional authority established under Article 324 of the Indian Constitution on January 25, 1950.

## Composition
- Chief Election Commissioner (CEC)
- Two Election Commissioners (since 1993)
- All three have equal voting power

## Key Powers
1. Superintendence, direction, and control of elections to Parliament and State Legislatures
2. Preparation and revision of electoral rolls
3. Recognition of political parties and allotment of election symbols
4. Enforcement of the Model Code of Conduct
5. Announcement of election schedules
6. Deployment of central forces for free and fair elections

## Contact
- Website: eci.gov.in
- Voter Helpline: 1950`,
    mediaRefs: [],
  },
  {
    title: 'Postal and Absentee Voting',
    slug: 'postal-voting',
    category: 'postal-voting' as const,
    locale: 'en' as const,
    contentMd: `# Postal and Absentee Voting in India

## Who Can Vote by Post?
- Members of the Armed Forces (Army, Navy, Air Force)
- Members of the Armed Police Forces serving outside their home state
- Government employees posted outside India
- Persons under preventive detention
- Voters with disabilities (optional postal ballot in some states)

## How to Apply
1. Submit Form 12 to the Returning Officer of your constituency
2. The Returning Officer will send you a postal ballot paper
3. Mark your vote, seal it in the provided envelope, and return it before the counting date

## Proxy Voting for Service Voters
Service voters can also appoint a proxy (Form 13F) to vote in person on their behalf at the polling station.`,
    mediaRefs: [],
  },
  {
    title: 'Election Security in India',
    slug: 'election-security',
    category: 'election-security' as const,
    locale: 'en' as const,
    contentMd: `# Election Security in India

## EVM Security Features
- EVMs are standalone devices with no internet or wireless connectivity
- Each EVM is uniquely numbered and tracked
- EVMs are stored in secure warehouses with CCTV surveillance
- Candidates and their agents can inspect EVMs before and after polling

## VVPAT Verification
- Voters can verify their vote on the VVPAT slip for 7 seconds
- VVPAT slips are counted for 5 randomly selected EVMs per assembly segment

## Security Forces
- Central Armed Police Forces (CAPF) are deployed for sensitive constituencies
- Multi-phase elections allow forces to be redeployed across states

## Complaint Mechanism
- cVIGIL app: Citizens can report election code violations with photo/video evidence
- National Grievance Services Portal: pgportal.gov.in`,
    mediaRefs: [],
  },
  {
    title: 'Candidate Selection and Nomination',
    slug: 'candidate-selection',
    category: 'candidates' as const,
    locale: 'en' as const,
    contentMd: `# Candidate Selection and Nomination

## Eligibility to Contest
To contest a Lok Sabha election, a candidate must:
- Be a citizen of India
- Be at least 25 years of age
- Be registered as a voter in any parliamentary constituency
- Not hold any office of profit under the government

## Nomination Process
1. File nomination papers with the Returning Officer during the notified period
2. Pay the security deposit (₹25,000 for general candidates, ₹12,500 for SC/ST)
3. Nomination papers are scrutinised by the Returning Officer
4. Candidates can withdraw within 2 days of scrutiny

## Party Symbols
- Recognised national and state parties get reserved symbols
- Independent candidates choose from a list of free symbols
- The ECI maintains the list of recognised parties and symbols`,
    mediaRefs: [],
  },
  {
    title: 'Campaign Finance and Election Expenditure',
    slug: 'campaign-finance',
    category: 'campaign-finance' as const,
    locale: 'en' as const,
    contentMd: `# Campaign Finance and Election Expenditure

## Expenditure Limits
The ECI sets limits on election expenditure:
- Lok Sabha: ₹95 lakh per candidate (large states), ₹75 lakh (smaller states/UTs)
- State Assembly: ₹40 lakh per candidate (large states), ₹28 lakh (smaller states)

## Disclosure Requirements
- Candidates must maintain a daily account of election expenditure
- Submit expenditure statement to the Returning Officer within 30 days of results
- Failure to submit can lead to disqualification

## Electoral Bonds
Electoral bonds are financial instruments for political donations. They are purchased from the State Bank of India and donated to political parties.

## Model Code of Conduct
The MCC prohibits use of government resources for campaigning and restricts announcement of new schemes during the election period.`,
    mediaRefs: [],
  },
  {
    title: 'Results Certification and Government Formation',
    slug: 'results-certification',
    category: 'certification' as const,
    locale: 'en' as const,
    contentMd: `# Results Certification and Government Formation

## Counting Day
- Counting begins at 8:00 AM on the designated counting day
- Postal ballots are counted first, followed by EVM votes
- Candidates and their counting agents are present throughout

## Declaration of Results
1. Returning Officer announces the winner for each constituency
2. Results are uploaded to the ECI website in real-time
3. The winning candidate receives a certificate of election

## Government Formation (Lok Sabha)
1. The party/alliance with majority (272+ seats) is invited to form the government
2. The President invites the leader of the majority to be sworn in as Prime Minister
3. The Council of Ministers is sworn in by the President

## Model Code of Conduct Lifted
The MCC is lifted after the completion of the election process and announcement of results.`,
    mediaRefs: [],
  },
  {
    title: 'Civic Rights and Duties of Indian Voters',
    slug: 'civic-rights',
    category: 'civic-rights' as const,
    locale: 'en' as const,
    contentMd: `# Civic Rights and Duties of Indian Voters

## Fundamental Rights Related to Elections
- **Article 19(1)(a)**: Freedom of speech and expression (includes political speech)
- **Article 326**: Right to vote for all adult citizens
- **Article 324**: Right to free and fair elections administered by the ECI

## Your Rights as a Voter
1. Right to vote without fear or coercion
2. Right to secret ballot — no one can ask how you voted
3. Right to NOTA (None of the Above) option on the EVM
4. Right to file complaints about election violations via cVIGIL

## Your Duties as a Voter
- Register as a voter and keep your details updated
- Vote in every election — local, state, and national
- Report election code violations
- Refuse bribes and vote based on merit

## NOTA
The "None of the Above" (NOTA) option was introduced in 2013. If NOTA gets the highest votes, the candidate with the next highest votes wins (NOTA does not invalidate the election).`,
    mediaRefs: [],
  },
];

async function seedTopics() {
  console.log('🌱 Seeding topics...');
  const batch = adminDb.batch();

  for (const topic of TOPICS) {
    const readingTimeMinutes = estimateReadingTime(topic.contentMd);
    const docData = {
      ...topic,
      readingTimeMinutes,
      createdAt: now,
      updatedAt: now,
    };

    // Validate schema before writing
    validateTopicSchema(docData);

    const ref = adminDb.collection('topics').doc(topic.slug);
    batch.set(ref, docData);
    console.log(`  ✓ ${topic.title}`);
  }

  await batch.commit();
  console.log(`✅ Seeded ${TOPICS.length} topics successfully.`);
}

seedTopics().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
