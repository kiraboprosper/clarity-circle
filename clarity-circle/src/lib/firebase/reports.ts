import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { DailyReport, MoodEvent, BehaviorEvent } from "../types";

/**
 * Gets or creates a daily report for a specific child by a specific caregiver for today.
 * @param caregiverId The UID of the caregiver.
 * @param childId The UID of the child.
 * @param familyId The ID of the family.
 * @returns The ID of the daily report document.
 */
export async function getOrCreateDailyReport(caregiverId: string, childId: string, familyId: string): Promise<string> {
  const reportsRef = collection(db, "dailyReports");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const q = query(
    reportsRef,
    where("caregiverId", "==", caregiverId),
    where("childId", "==", childId),
    where("reportDate", ">=", Timestamp.fromDate(today)),
    where("reportDate", "<", Timestamp.fromDate(tomorrow))
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }

  const newReportRef = await addDoc(reportsRef, {
    childId,
    familyId,
    caregiverId,
    reportDate: serverTimestamp(),
    status: "in_progress",
  });
  return newReportRef.id;
}

export async function addEventToReport<T extends MoodEvent | BehaviorEvent>(reportId: string, subcollectionName: 'moodEvents' | 'behaviorEvents', eventData: Omit<T, 'id' | 'time'>): Promise<void> {
  const eventsCollectionRef = collection(db, `dailyReports/${reportId}/${subcollectionName}`);
  await addDoc(eventsCollectionRef, {
    ...eventData,
    time: serverTimestamp(),
  });
}

export async function submitDailyReport(reportId: string, summary: any): Promise<void> {
  const reportRef = doc(db, "dailyReports", reportId);
  await updateDoc(reportRef, {
    status: "submitted",
    summary: summary,
    // You can also add other top-level fields here like meals, departure time, etc.
  });
}

export async function getReportEvents(reportId: string, subcollectionName: 'moodEvents' | 'behaviorEvents'): Promise<any[]> {
  const eventsQuery = query(
    collection(db, `dailyReports/${reportId}/${subcollectionName}`),
    orderBy('time', 'asc')
  );
  const querySnapshot = await getDocs(eventsQuery);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamps to JS Date objects
    return { ...data, time: data.time.toDate() };
  });
}

/**
 * Fetches a single daily report and all its event subcollections.
 * @param reportId The ID of the report to fetch.
 * @returns The full report data or null if not found.
 */
export async function getReportById(reportId: string): Promise<any | null> {
  const reportRef = doc(db, "dailyReports", reportId);
  const reportSnap = await getDoc(reportRef);

  if (!reportSnap.exists()) {
    return null;
  }

  const reportData = reportSnap.data();

  const [moodEvents, behaviorEvents] = await Promise.all([
    getReportEvents(reportId, 'moodEvents'),
    getReportEvents(reportId, 'behaviorEvents')
  ]);

  return {
    id: reportSnap.id,
    ...reportData,
    reportDate: reportData.reportDate.toDate(),
    moodEvents,
    behaviorEvents,
  };
}

/**
 * Fetches all submitted reports for all children of a given parent.
 * @param familyId The ID of the family.
 * @returns A promise that resolves to an array of submitted reports.
 */
export async function getSubmittedReportsForFamily(familyId: string): Promise<DailyReport[]> {
  if (!familyId) return [];

  const reportsRef = collection(db, "dailyReports");
  const q = query(
    reportsRef,
    where("familyId", "==", familyId),
    where("status", "==", "submitted"),
    orderBy("reportDate", "desc")
  );

  const querySnapshot = await getDocs(q);

  const reportsWithMoods = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const moodEvents = await getReportEvents(doc.id, 'moodEvents');
      return {
        id: doc.id,
        childId: data.childId,
        familyId: data.familyId,
        caregiverId: data.caregiverId,
        reportDate: data.reportDate as Timestamp,
        status: data.status,
        summary: data.summary,
        moodEvents,
      } as DailyReport;
    })
  );

  return reportsWithMoods;
}