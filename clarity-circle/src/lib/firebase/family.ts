import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseApp, db } from "./config";
import type { AssignedChild } from "../types";

function getFirebaseFunctions() {
  return getFunctions(getFirebaseApp());
}

/**
 * Invites a caregiver to a family and assigns them to specific children.
 * This should be implemented as a secure Cloud Function.
 * @param parentId The UID of the parent sending the invitation.
 * @param familyId The ID of the family.
 * @param caregiverEmail The email of the caregiver to invite.
 * @param assignedChildIds An array of child UIDs to assign to the caregiver.
 */
export async function inviteCaregiver(
  parentId: string,
  familyId: string,
  caregiverEmail: string,
  assignedChildIds: string[]
): Promise<void> {  const functions = getFirebaseFunctions();  const callable = httpsCallable(functions, "inviteCaregiver");
  await callable({ parentId, familyId, caregiverEmail, assignedChildIds });
  console.log(`Invitation sent to ${caregiverEmail}`);
}

/**
 * Fetches the profiles of children assigned to a specific caregiver.
 * @param caregiverId The UID of the caregiver.
 * @returns A promise that resolves to an array of assigned child profiles.
 */
export async function getAssignedChildrenForCaregiver(caregiverId: string): Promise<AssignedChild[]> {
  // 1. Get caregiver's user doc to find assigned families
  const caregiverUserRef = doc(db, "users", caregiverId);
  const caregiverUserSnap = await getDoc(caregiverUserRef);

  if (!caregiverUserSnap.exists() || !caregiverUserSnap.data().assignedFamilyIds) {
    return [];
  }

  const assignedFamilyIds = caregiverUserSnap.data().assignedFamilyIds as string[];
  if (assignedFamilyIds.length === 0) {
    return [];
  }

  // 2. Fetch all family documents in parallel
  const familyPromises = assignedFamilyIds.map(familyId => getDoc(doc(db, "families", familyId)));
  const familySnaps = await Promise.all(familyPromises);

  const allChildIds = new Set<string>();
  familySnaps.forEach(familySnap => {
    if (familySnap.exists()) {
      const caregiverAssignments = familySnap.data().caregivers?.[caregiverId];
      if (caregiverAssignments?.assignedChildIds) {
        caregiverAssignments.assignedChildIds.forEach((childId: string) => allChildIds.add(childId));
      }
    }
  });

  const uniqueChildIds = Array.from(allChildIds);
  if (uniqueChildIds.length === 0) {
    return [];
  }

  // 3. Fetch all unique child profiles in parallel
  const childPromises = uniqueChildIds.map(childId => getDoc(doc(db, "users", childId)));
  const childSnaps = await Promise.all(childPromises);

  return childSnaps
    .filter(snap => snap.exists())
    .map(snap => {
      const childData = snap.data();
      return {
        id: snap.id,
        name: childData.displayName,
        photoURL: childData.photoURL,
      } as AssignedChild;
    });
}