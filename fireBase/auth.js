import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, database } from "./fireBase";
import { get, ref, set } from "firebase/database";

function isValidUniqueId(id) {
  return /^\d{5,}$/.test(id);
}

function convertToEmail(id) {
  return `${id}@habittracker.com`;
}

export async function registerUser(uniqueId, password , name) {
  if (!isValidUniqueId(uniqueId)) {
    throw new Error("Unique ID must contain at least 5 digits.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  if(!name || name.trim().length === 0) throw new Error("Name is Required");

  const email = convertToEmail(uniqueId);

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  await updateProfile(user , {
    displayName: name
  });

  await set(ref(database , `users/${user.uid}`) ,{
    name: name,
    uniqueId: uniqueId,
    email: email,
    createdAt: Date.now()
  })

  return user;
}

export async function loginUser(uniqueId, password) {
  if (!isValidUniqueId(uniqueId)) {
    throw new Error("Unique ID must contain at least 5 digits.");
  }


  const email = convertToEmail(uniqueId);

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

export async function getUserProfile(uid) {
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function logOutUser() {
  await signOut(auth);
}
 