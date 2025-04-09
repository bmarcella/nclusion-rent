

import { collection, doc  } from 'firebase/firestore';
import db from "@/services/firebase/FirebaseDB";

const entity = "landlord";
const bankImage = "BankPictures";
const bank = "bank";
const bankLease = "BankLease";
const bankComments = "BankComments";
const landlordPictures = "LandlordPictures";
const historicDecision = "HistoricDecision";
const historicSteps = "HistoricSteps";
const task = "tasks";
// 
export const hStepsDoc   = collection(db, historicSteps);
export const Landlord   = collection(db, entity);
export const LandlordDoc = Landlord;
export const BankDoc   = collection(db, bank);
export const BankLeaseDoc   = collection(db, bankLease);
export const hdDoc   = collection(db, historicDecision);
export const bankPicturesDoc = collection(db, bankImage);
export const LandlordPicturesDoc = collection(db, landlordPictures);
export const bankCommentsDoc = collection(db, bankComments);
export const taskCollection = collection(db, task);

export const getBankDoc = (id: string ) => {
     return doc(db, bank, id);
}

export const getLandlordDoc = (id: string ) => {
     return doc(db, entity, id);
}

export const getBankPictureRef = (id: string ) => {
     return doc(db, bankImage, id);
}

export const getLandlordPicturesRef = (id: string ) => {
     return doc(db, landlordPictures, id);
}