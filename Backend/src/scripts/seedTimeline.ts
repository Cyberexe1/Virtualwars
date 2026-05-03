/**
 * Seed script: writes the India 2024 Lok Sabha election timeline to Firestore.
 * Run with: npm run seed
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { adminDb } from '../services/firebaseAdmin';
import { TimelineDocument } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

const INDIA_2024_TIMELINE: TimelineDocument = {
  year: 2024,
  label: '2024 Lok Sabha General Elections — India',
  events: [
    {
      id: 'roll-revision-start',
      date: '2024-01-01',
      phase: 'registration',
      title: 'Voter Roll Revision Begins',
      description: 'Annual summary revision of electoral rolls starts. New voters can apply via Form 6 at voters.eci.gov.in or the Voter Helpline App.',
      type: 'milestone',
      urgent: false,
      actionUrl: 'https://voters.eci.gov.in',
    },
    {
      id: 'roll-final-publication',
      date: '2024-01-31',
      phase: 'registration',
      title: 'Final Publication of Electoral Rolls',
      description: 'Revised electoral rolls published. Last date to raise objections or apply for corrections via Form 8.',
      type: 'deadline',
      urgent: true,
      actionUrl: 'https://voters.eci.gov.in',
    },
    {
      id: 'mcc-announcement',
      date: '2024-03-16',
      phase: 'nomination',
      title: 'Election Schedule Announced — MCC in Effect',
      description: 'ECI announces the 7-phase Lok Sabha election schedule. Model Code of Conduct (MCC) comes into immediate effect across all states.',
      type: 'milestone',
      urgent: false,
      actionUrl: 'https://eci.gov.in',
    },
    {
      id: 'phase1-nomination',
      date: '2024-03-20/2024-03-27',
      phase: 'nomination',
      title: 'Phase 1 Nomination Filing',
      description: 'Candidates file nomination papers with Returning Officers for Phase 1 constituencies (102 seats across 21 states/UTs).',
      type: 'period',
      urgent: false,
    },
    {
      id: 'phase1-polling',
      date: '2024-04-19',
      phase: 'polling',
      title: 'Phase 1 Polling Day',
      description: 'Polling for 102 Lok Sabha constituencies across 21 states and UTs. Polls open 7:00 AM – 6:00 PM.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase2-polling',
      date: '2024-04-26',
      phase: 'polling',
      title: 'Phase 2 Polling Day',
      description: 'Polling for 89 Lok Sabha constituencies across 13 states and UTs.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase3-polling',
      date: '2024-05-07',
      phase: 'polling',
      title: 'Phase 3 Polling Day',
      description: 'Polling for 94 Lok Sabha constituencies across 12 states and UTs.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase4-polling',
      date: '2024-05-13',
      phase: 'polling',
      title: 'Phase 4 Polling Day',
      description: 'Polling for 96 Lok Sabha constituencies across 10 states and UTs.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase5-polling',
      date: '2024-05-20',
      phase: 'polling',
      title: 'Phase 5 Polling Day',
      description: 'Polling for 49 Lok Sabha constituencies across 8 states and UTs.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase6-polling',
      date: '2024-05-25',
      phase: 'polling',
      title: 'Phase 6 Polling Day',
      description: 'Polling for 58 Lok Sabha constituencies across 7 states and UTs.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'phase7-polling',
      date: '2024-06-01',
      phase: 'polling',
      title: 'Phase 7 Polling Day (Final Phase)',
      description: 'Polling for 57 Lok Sabha constituencies across 8 states and UTs. Final phase of the 2024 General Elections.',
      type: 'election-day',
      urgent: false,
    },
    {
      id: 'counting-day',
      date: '2024-06-04',
      phase: 'counting',
      title: 'Vote Counting & Results',
      description: 'Counting of votes begins at 8:00 AM across all 543 constituencies. Results declared throughout the day. New government formation begins.',
      type: 'milestone',
      urgent: false,
      actionUrl: 'https://results.eci.gov.in',
    },
    {
      id: 'mcc-lifted',
      date: '2024-06-05',
      phase: 'certification',
      title: 'Model Code of Conduct Lifted',
      description: 'MCC is lifted after completion of the election process. New government formation and swearing-in ceremony follows.',
      type: 'milestone',
      urgent: false,
    },
  ],
};

async function seedTimeline() {
  console.log('🌱 Seeding India 2024 election timeline...');
  await adminDb
    .collection('timelines')
    .doc('india-2024')
    .set({
      ...INDIA_2024_TIMELINE,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  console.log(`✅ Timeline seeded: ${INDIA_2024_TIMELINE.label}`);
  console.log(`   ${INDIA_2024_TIMELINE.events.length} events written.`);
}

seedTimeline().catch((err) => {
  console.error('❌ Timeline seed failed:', err);
  process.exit(1);
});
