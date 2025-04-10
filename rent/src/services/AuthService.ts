/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    User,
} from '@/@types/auth'
import FirebaseAuth from './firebase/FirebaseAuth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, updateProfile } from 'firebase/auth'
import { Landlord, LandlordDoc } from './Landlord'
import { addDoc, CollectionReference, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { Proprio } from '@/views/Entity'
import {  getApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { USER_ROLE } from '@/views/shared/schema'


export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function getProprioById(id: string) {
    try {
        const Ref = LandlordDoc as CollectionReference<Proprio>;
        const q = query(Ref, where('id_user', '==', id));
        const querySnapshot = await getDocs(q);
        const users: (Proprio & { id: string })[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        if (users.length === 0 ) {
            throw new Error('No entity for this User');
        }
        if (users.length > 1 ) {
            throw new Error('User has more than one entity');
        }
        return users[0];
    }  catch (error) {
        console.error('Error fetching user by ID:', error);
        throw new Error('User has no associated entity');
    }
}



export async function apiSignIn(data: SignInCredential) {
    try {
        const resp = await signInWithEmailAndPassword(FirebaseAuth, data.email, data.password) ;
        const user = resp.user;
        const token = await resp.user.getIdToken();
        const proprio = await getProprioById(user.uid);
        if (!proprio)  throw new Error('Votre compte n\'est pas actif, veuillez contacter l\'administrateur');
        if (!proprio.active)  throw new Error('Votre compte n\'est pas actif, veuillez contacter l\'administrateur');
        const customUser: User = {
            userId: resp.user.uid,
            avatar: user.photoURL,
            userName: user.displayName,
            email: user.email,
            authority: [(proprio.type_person) ? proprio.type_person : 'agent_immobilier' as USER_ROLE], 
            proprio: proprio,
            active: proprio.active,
            proprioId: proprio.id,
          };
        return {
            token,
            user: customUser,
        };
    } catch (error: any) {
        console.error( error);
        throw new Error("Email ou mot de passe incorrect");
    }
}

export async function apiSignUp(data: SignUpCredential) {
    try {
        const userCreds = await createUserWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const user = userCreds.user;
        const landlord: any = {
            id: '',
            fullName:data.fullName,
            regions: [],
            id_user: user.uid,
            nickName: data.fullName,
            companyName: '',
            type_person: 'agent_immobilier' as USER_ROLE,
            nif: '',
            cin: '',
            address: '',
            phone: '',
            phone_b: '',
            email: data.email,
            active: false,
            createdAt: new Date(),
            createBy: user.uid,
            updateBy: user.uid,
          };
        const docRef = await addDoc(Landlord, landlord);
        landlord.id = docRef.id;
        await updateDoc(docRef, {id: docRef.id});
        await updateProfile(user, { displayName : data.fullName });
        await user.reload();

        const token = await user.getIdToken();
        const customUser: User = {
            userId: user.uid,
            avatar: user.photoURL,
            userName: user.displayName,
            email: user.email,
            authority: [landlord.type_person], 
            proprio: landlord,
            active: landlord.active,
            proprioId: landlord.id,
          };
          const resp = { token : token , refreshToken: user.refreshToken ,  user: customUser  };
          return resp;
       } catch (error: any) {
        console.error("Error registering user:", error.message);
      }
}


export async function apiSignUpInside(data: SignUpCredential,type_entity: string) {
    try {
        const userCreds = await createUserWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const user = userCreds.user;
        await updateProfile(user, { displayName : data.fullName });
        await user.reload();
        const customUser: User = {
            userId: user.uid,
            avatar: user.photoURL,
            userName: user.displayName,
            email: user.email,
            authority: [type_entity], 
          };
          return customUser;
       } catch (error: any) {
        console.error("Error registering user:", error.message);
      }
}

const changeMyPassword = async (newPassword: string)  => {
    const user = FirebaseAuth.currentUser;
    let error ;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        return {
            message: 'Password updated successfully',
            error: false
        };
      } catch (e) {
        console.error("Error updating password:", e);
        if (e instanceof Error) {
            error = e.message;
         } else {
            error = 'An unknown error occurred';
         }
    }
   }
    else {
       console.error("No user is logged in.");
       error = 'No user is logged in.';
    }
    return {
        message: error,
        error: true
    };
  };

  export const updateUserPassword = async (uid: string, newPassword: string) => {
    const functions = getFunctions(getApp());
    const updateUserPassword = httpsCallable(functions, 'updateUserPassword');
    try {
      const result = await updateUserPassword({ uid, newPassword });
      console.log(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
